"""
Router para endpoints de chat y mensajes proactivos
Maneja la interacción conversacional del usuario con RITMO
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime

from models.schemas import (
    ChatRequest, ChatResponse, ProactivoRequest, ProactivoResponse,
    EstadoInferido, PrediccionRiesgo
)
from agents.conversacional import generar_respuesta_chat
from agents.habitos import generar_mensaje_habito
from agents.prediccion_ml import predecir_riesgo
from agents.orquestador import OrquestadorCentral
from db.sesiones import guardar_mensaje, obtener_historial_chat

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/chat", tags=["chat"])

# Inicializar orquestador central
orquestador = OrquestadorCentral()


@router.post("/", response_model=ChatResponse)
async def procesar_mensaje_chat(request: ChatRequest) -> ChatResponse:
    """
    Procesa un mensaje del usuario y genera una respuesta empática usando Claude
    
    Args:
        request: Mensaje del usuario con contexto
        
    Returns:
        ChatResponse: Respuesta generada con tono apropiado
        
    Raises:
        HTTPException: Si hay errores en el procesamiento
    """
    try:
        logger.info(f"Processing chat message for user: {request.user_id}")
        
        # 1. Obtener historial reciente si no se proporciona contexto
        if not request.contexto_previo:
            request.contexto_previo = await obtener_historial_chat(
                request.user_id, limit=5
            )
        
        # 2. Analizar tono del mensaje usuario
        tono_usuario = _analizar_tono_mensaje(request.mensaje)
        logger.debug(f"User tone detected: {tono_usuario}")
        
        # 3. Generar predicción ML de riesgo
        prediccion_riesgo = await predecir_riesgo(
            request.user_id, request.mensaje, request.perfil
        )
        
        # 4. Decidir estrategia de respuesta con orquestador
        estrategia = orquestador.decidir_estrategia_chat(
            mensaje=request.mensaje,
            tono_usuario=tono_usuario,
            prediccion_riesgo=prediccion_riesgo,
            perfil=request.perfil,
            contexto_previo=request.contexto_previo
        )
        
        # 5. Generar respuesta usando agente conversacional
        respuesta_chat = await generar_respuesta_chat(
            mensaje=request.mensaje,
            estrategia=estrategia,
            perfil=request.perfil,
            contexto_previo=request.contexto_previo,
            prediccion_riesgo=prediccion_riesgo
        )
        
        # 6. Guardar intercambio en base de datos
        await guardar_mensaje(
            user_id=request.user_id,
            mensaje_usuario=request.mensaje,
            respuesta_sistema=respuesta_chat.respuesta,
            tono=respuesta_chat.tono
        )
        
        logger.info(f"Chat response generated successfully for user: {request.user_id}")
        return respuesta_chat
        
    except ValueError as ve:
        logger.error(f"Validation error in chat processing: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid message data: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat processing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during chat processing"
        )


@router.post("/proactivo", response_model=ProactivoResponse)
async def generar_mensaje_proactivo(request: ProactivoRequest) -> ProactivoResponse:
    """
    Genera mensaje proactivo basado en el estado del usuario y patrones detectados
    
    Args:
        request: Datos del usuario y tipo de mensaje proactivo
        
    Returns:
        ProactivoResponse: Mensaje proactivo con características de envío
        
    Raises:
        HTTPException: Si hay errores en el procesamiento
    """
    try:
        logger.info(f"Generating proactive message for user: {request.user_id}")
        
        # 1. Decidir si debe enviar mensaje proactivo
        debe_enviar = orquestador.debe_enviar_proactivo(
            estado=request.estado_actual,
            dias_sin_actividad=request.dias_sin_actividad,
            perfil=request.perfil
        )
        
        if not debe_enviar:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No proactive message needed at this time"
            )
        
        # 2. Generar contenido según el tipo
        if request.tipo_mensaje == "habito" and request.estado_actual.estado == "estable":
            # Usar agente de hábitos para usuarios estables
            mensaje_respuesta = await generar_mensaje_habito(
                perfil=request.perfil,
                dias_sin_actividad=request.dias_sin_actividad
            )
        else:
            # Usar agente conversacional para otros casos
            mensaje_respuesta = await generar_respuesta_chat(
                mensaje="",  # Mensaje vacío para modo proactivo
                estrategia={"tipo": "proactivo", "subtipo": request.tipo_mensaje},
                perfil=request.perfil,
                contexto_previo=[],
                prediccion_riesgo=None,
                modo_proactivo=True
            )
        
        # 3. Determinar canal y timing optimal
        canal_recomendado = _determinar_canal_optimo(request.estado_actual, request.perfil)
        momento_optimo = _calcular_momento_optimo(request.perfil)
        prioridad = _calcular_prioridad(request.estado_actual, request.dias_sin_actividad)
        
        respuesta = ProactivoResponse(
            mensaje=mensaje_respuesta.respuesta,
            canal_recomendado=canal_recomendado,
            momento_optimo=momento_optimo,
            prioridad=prioridad
        )
        
        # 4. Registrar mensaje proactivo generado
        await guardar_mensaje(
            user_id=request.user_id,
            mensaje_usuario="[PROACTIVO]",
            respuesta_sistema=respuesta.mensaje,
            tono="proactivo"
        )
        
        logger.info(f"Proactive message generated successfully for user: {request.user_id}")
        return respuesta
        
    except HTTPException:
        raise  # Re-lanzar HTTPExceptions
    except Exception as e:
        logger.error(f"Unexpected error in proactive message generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during proactive message generation"
        )


def _analizar_tono_mensaje(mensaje: str) -> str:
    """
    Analiza el tono emocional del mensaje del usuario
    
    Args:
        mensaje: Texto del mensaje
        
    Returns:
        str: Tono detectado (positivo, neutral, negativo, urgente)
    """
    mensaje_lower = mensaje.lower()
    
    # Palabras que indican urgencia o crisis
    palabras_urgentes = ["ayuda", "mal", "terrible", "no puedo", "desesperado", 
                        "suicidio", "morir", "acabar", "insoportable"]
    
    # Palabras positivas
    palabras_positivas = ["bien", "genial", "mejor", "feliz", "contento", 
                         "gracias", "perfecto", "excelente", "logré"]
    
    # Palabras negativas pero no urgentes
    palabras_negativas = ["triste", "cansado", "difícil", "complicado", 
                         "preocupado", "nervioso", "ansioso"]
    
    if any(palabra in mensaje_lower for palabra in palabras_urgentes):
        return "urgente"
    elif any(palabra in mensaje_lower for palabra in palabras_positivas):
        return "positivo"
    elif any(palabra in mensaje_lower for palabra in palabras_negativas):
        return "negativo"
    else:
        return "neutral"


def _determinar_canal_optimo(estado: EstadoInferido, perfil) -> str:
    """Determina el canal óptimo para el mensaje proactivo"""
    if estado.estado in ["ansiedad", "aislamiento"]:
        return "notificacion"  # Menos intrusivo
    elif perfil.modo_comunicacion == "audio":
        return "chat"  # Puede usar audio
    else:
        return "chat"  # Default


def _calcular_momento_optimo(perfil) -> str:
    """Calcula el momento óptimo para enviar el mensaje"""
    # Simplificado: horario de tarde para la mayoría de perfiles
    horarios_por_etapa = {
        "mayor_70": "16:00",
        "adulto_activo": "18:00", 
        "joven": "19:00",
        "migrante": "17:00",
        "discapacidad_visual": "15:00"
    }
    return horarios_por_etapa.get(perfil.etapa, "17:00")


def _calcular_prioridad(estado: EstadoInferido, dias_sin_actividad: int) -> str:
    """Calcula la prioridad del mensaje proactivo"""
    if estado.estado in ["ansiedad", "aislamiento"] or dias_sin_actividad > 3:
        return "alta"
    elif estado.estado == "cansancio" or dias_sin_actividad > 1:
        return "media"
    else:
        return "baja"


@router.get("/health")
async def health_check():
    """Health check específico para el router de chat"""
    return {
        "status": "ok", 
        "service": "chat-router",
        "endpoints": ["/chat/", "/chat/proactivo"]
    }