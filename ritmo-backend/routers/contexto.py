"""
Router para el endpoint /contexto
Maneja las peticiones de análisis de contexto y patrones de usuario
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import uuid
from datetime import datetime

from models.schemas import ContextoRequest, ContextoResponse, EstadoInferido
from agents.contexto_vida import construir_contexto_sistema
from agents.patrones import inferir_estado
from db.sesiones import guardar_sesion, guardar_eventos_señales

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/contexto", tags=["contexto"])


@router.post("", response_model=ContextoResponse)
async def analizar_contexto(request: ContextoRequest) -> ContextoResponse:
    """
    Analiza el contexto y patrones del usuario para generar recomendaciones
    
    Args:
        request: Datos del perfil del usuario y señales de comportamiento
        
    Returns:
        ContextoResponse: Contexto para Claude, estado inferido y recomendaciones
        
    Raises:
        HTTPException: Si hay errores en el procesamiento
    """
    try:
        logger.info(f"Processing context request for user stage: {request.perfil.etapa}")
        
        # 1. Construir contexto de sistema usando el agente de contexto de vida
        contexto_sistema = construir_contexto_sistema(request.perfil)
        logger.debug(f"System context built, length: {len(contexto_sistema)} characters")
        
        # 2. Inferir estado usando el agente de patrones
        estado_inferido = inferir_estado(request.señales, request.perfil)
        logger.debug(f"State inferred: {estado_inferido.estado} (confidence: {estado_inferido.confianza})")
        
        # 3. Determinar recomendación para el orquestador
        recomendacion_orquestador = _determinar_recomendacion_orquestador(estado_inferido, request.señales)
        logger.debug(f"Orchestrator recommendation: {recomendacion_orquestador}")
        
        # 4. Guardar sesión en Supabase
        user_id = _generar_user_id(request.perfil)
        try:
            await guardar_sesion(user_id, request.señales)
            await guardar_eventos_señales(user_id, request.señales)
            logger.info(f"Session and events saved for user: {user_id}")
        except Exception as db_error:
            logger.warning(f"Failed to save session data: {db_error}")
            # Continuamos sin fallar si hay problemas de BD
        
        # 5. Construir respuesta
        response = ContextoResponse(
            contexto_sistema=contexto_sistema,
            estado_inferido=estado_inferido,
            recomendacion_orquestador=recomendacion_orquestador
        )
        
        logger.info(f"Context analysis completed successfully for {request.perfil.etapa} user")
        return response
        
    except ValueError as ve:
        logger.error(f"Validation error in context analysis: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request data: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in context analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during context analysis"
        )


def _determinar_recomendacion_orquestador(estado_inferido: EstadoInferido, señales) -> str:
    """
    Determina la recomendación específica para el orquestador basada en el estado inferido
    
    Args:
        estado_inferido: Estado inferido del usuario
        señales: Señales de comportamiento para contexto adicional
        
    Returns:
        str: Recomendación para el orquestador
    """
    # Estados preocupantes requieren contacto suave
    if estado_inferido.estado in ["aislamiento", "ansiedad", "cansancio", "desconexion"]:
        return "contacto_suave"
    
    # Estado estable - decidir entre rutina, esperar, o silencio
    if estado_inferido.estado == "estable":
        # Si es muy tarde o muy temprano, silencio
        if _es_hora_silencio(señales.hora_acceso):
            return "silencio"
        # Si es hora apropiada para rutinas
        elif _es_hora_rutina(señales.hora_acceso):
            return "rutina"
        else:
            return "esperar"
    
    # Default fallback
    return "esperar"


def _es_hora_silencio(hora_acceso: str) -> bool:
    """
    Determina si es hora de silencio (no molestar)
    
    Args:
        hora_acceso: Hora en formato HH:MM
        
    Returns:
        bool: True si es hora de silencio
    """
    try:
        hora, minuto = map(int, hora_acceso.split(':'))
        hora_decimal = hora + minuto / 60
        
        # Horas de silencio: muy tarde (22:00-06:00) o hora de comida (13:30-15:30)
        return (hora_decimal >= 22 or hora_decimal <= 6) or (13.5 <= hora_decimal <= 15.5)
        
    except ValueError:
        return False


def _es_hora_rutina(hora_acceso: str) -> bool:
    """
    Determina si es hora apropiada para sugerir rutinas
    
    Args:
        hora_acceso: Hora en formato HH:MM
        
    Returns:
        bool: True si es hora apropiada para rutinas
    """
    try:
        hora, minuto = map(int, hora_acceso.split(':'))
        hora_decimal = hora + minuto / 60
        
        # Horarios apropiados: mañana (8:00-12:00) y primera tarde (16:00-19:00)
        return (8 <= hora_decimal <= 12) or (16 <= hora_decimal <= 19)
        
    except ValueError:
        return False


def _generar_user_id(perfil) -> str:
    """
    Genera un user_id basado en el perfil del usuario
    
    Args:
        perfil: Perfil del usuario
        
    Returns:
        str: User ID único
    """
    # En producción, esto vendría de un sistema de autenticación
    # Para desarrollo, generamos uno basado en nombre y etapa
    base_string = f"{perfil.nombre}_{perfil.etapa}_{perfil.zona_horaria}"
    return f"user_{abs(hash(base_string)) % 1000000}"


@router.get("/health")
async def health_check():
    """Health check específico para el router de contexto"""
    return {
        "status": "ok",
        "service": "contexto-router",
        "endpoints": ["/contexto"]
    }