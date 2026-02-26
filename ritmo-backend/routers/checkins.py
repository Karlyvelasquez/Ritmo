"""
Router para endpoints de checkins emocionales - Mi ánimo
Maneja la captura y recuperación de estados emocionales desde la interfaz de galaxia
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime

from models.schemas import (
    CheckinEmocionalRequest, CheckinEmocionalResponse, CheckinDiario
)
from db.sesiones import (
    guardar_checkin_emocional, obtener_checkins_usuario, 
    obtener_ultimo_checkin_usuario
)

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/checkins", tags=["checkins_emocionales"])


@router.post("/emocional", response_model=CheckinEmocionalResponse)
async def crear_checkin_emocional(request: CheckinEmocionalRequest):
    """
    Guarda un checkin emocional desde la interfaz 'Mi ánimo'
    
    Args:
        request: Datos del checkin emocional
        
    Returns:
        CheckinEmocionalResponse: Confirmación del checkin guardado
        
    Raises:
        HTTPException: Si hay error al guardar
    """
    try:
        logger.info(f"Recibido checkin emocional para usuario {request.user_id}: {request.estado_emocional}")
        
        # Guardar en base de datos
        resultado = await guardar_checkin_emocional(
            user_id=request.user_id,
            estado_emocional=request.estado_emocional,
            telegram_id=request.telegram_id,
            metodo=request.metodo,
            mensaje_contexto=request.mensaje_contexto
        )
        
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno: No se pudo guardar el checkin emocional"
            )
        
        # Preparar respuesta
        response = CheckinEmocionalResponse(
            id=resultado['id'],
            estado_emocional=resultado['estado_emocional'],
            fecha=resultado['fecha'],
            hora_respuesta=resultado['hora_respuesta'],
            mensaje=f"✨ {request.estado_emocional.capitalize()} guardado en tu universo emocional",
            created_at=datetime.fromisoformat(resultado['created_at'])
        )
        
        logger.info(f"Checkin emocional guardado exitosamente para usuario {request.user_id}")
        return response
        
    except Exception as e:
        error_msg = f"Error al crear checkin emocional para usuario {request.user_id}: {e}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@router.get("/usuario/{user_id}/historial")
async def obtener_historial_checkins(user_id: str, dias_atras: int = 7):
    """
    Obtiene el historial de checkins emocionales de un usuario
    
    Args:
        user_id: ID del usuario
        dias_atras: Número de días hacia atrás (default: 7)
        
    Returns:
        Dict con lista de checkins emocionales
    """
    try:
        logger.info(f"Obteniendo historial de checkins para usuario {user_id} ({dias_atras} días)")
        
        checkins = await obtener_checkins_usuario(user_id, dias_atras)
        
        return {
            "user_id": user_id,
            "periodo_dias": dias_atras,
            "total_checkins": len(checkins),
            "checkins": checkins
        }
        
    except Exception as e:
        logger.error(f"Error al obtener historial de checkins para usuario {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@router.get("/usuario/{user_id}/ultimo")
async def obtener_ultimo_checkin(user_id: str):
    """
    Obtiene el último checkin emocional de un usuario
    
    Args:
        user_id: ID del usuario
        
    Returns:
        Dict con el último checkin o None si no existe
    """
    try:
        logger.info(f"Obteniendo último checkin para usuario {user_id}")
        
        ultimo_checkin = await obtener_ultimo_checkin_usuario(user_id)
        
        if ultimo_checkin:
            return {
                "user_id": user_id,
                "tiene_checkin": True,
                "checkin": ultimo_checkin
            }
        else:
            return {
                "user_id": user_id,
                "tiene_checkin": False,
                "checkin": None,
                "mensaje": "No se encontraron checkins previos"
            }
        
    except Exception as e:
        logger.error(f"Error al obtener último checkin para usuario {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@router.get("/estados-disponibles")
async def obtener_estados_emocionales():
    """
    Obtiene la lista de estados emocionales disponibles en la galaxia
    
    Returns:
        Dict con información de los estados emocionales disponibles
    """
    estados_emocionales = {
        "estados": [
            {
                "id": "sereno",
                "nombre": "Sereno",
                "descripcion": "Como una superficie de agua calma",
                "color": "#4A90E2",
                "categoria": "positivo"
            },
            {
                "id": "radiante", 
                "nombre": "Radiante",
                "descripcion": "Energía que brilla desde dentro",
                "color": "#F5A623",
                "categoria": "muy_positivo"
            },
            {
                "id": "esperanzado",
                "nombre": "Esperanzado",
                "descripcion": "Mirando hacia un futuro brillante",
                "color": "#7ED321",
                "categoria": "positivo"
            },
            {
                "id": "creativo",
                "nombre": "Creativo",
                "descripcion": "Ideas fluyendo como estrellas",
                "color": "#9013FE",
                "categoria": "positivo"
            },
            {
                "id": "conectado",
                "nombre": "Conectado",
                "descripcion": "En sintonía con el universo",
                "color": "#50E3C2",
                "categoria": "muy_positivo"
            },
            {
                "id": "reflexivo",
                "nombre": "Reflexivo",
                "descripcion": "Contemplando las profundidades",
                "color": "#BD10E0",
                "categoria": "neutral"
            },
            {
                "id": "nostalgico",
                "nombre": "Nostálgico",
                "descripcion": "Conectado con memorias del pasado",
                "color": "#B8E986",
                "categoria": "neutral"
            },
            {
                "id": "ansioso",
                "nombre": "Ansioso",
                "descripcion": "Como estrellas que titilan inquietas",
                "color": "#F8E71C",
                "categoria": "negativo"
            },
            {
                "id": "confundido",
                "nombre": "Confundido",
                "descripción": "Entre nebulosas de incertidumbre",
                "color": "#8B572A",
                "categoria": "negativo"
            },
            {
                "id": "abrumado",
                "nombre": "Abrumado",
                "descripcion": "Bajo el peso de galaxias",
                "color": "#D0021B",
                "categoria": "muy_negativo"
            }
        ],
        "total_estados": 10,
        "categorias": ["muy_positivo", "positivo", "neutral", "negativo", "muy_negativo"]
    }
    
    return estados_emocionales