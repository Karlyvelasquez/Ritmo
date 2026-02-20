import logging
from datetime import datetime
from typing import Dict, Any, Optional
from db.supabase_client import get_supabase_client
from models.schemas import SenalesWeb

# Configurar logging
logger = logging.getLogger(__name__)


async def guardar_sesion(user_id: str, señales: SenalesWeb) -> Optional[Dict[str, Any]]:
    """
    Guarda una sesión web en la tabla sesiones_web
    
    Args:
        user_id: ID del usuario
        señales: Objeto SenalesWeb con la información de la sesión
        
    Returns:
        Dict con los datos guardados o None si hubo error
        
    Raises:
        Exception: Si hay error en la inserción
    """
    try:
        client = get_supabase_client()
        
        # Preparar datos para inserción
        session_data = {
            'user_id': user_id,
            'hora_inicio': datetime.utcnow().isoformat(),
            'hora_fin': None,  # Se actualizará cuando termine la sesión
            'duracion_seg': señales.duracion_sesion_anterior_seg,
            'hora_local': señales.hora_acceso,
            'dia_semana': señales.dia_semana,
            'es_madrugada': señales.es_madrugada,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insertar en Supabase
        response = client.table('sesiones_web').insert(session_data).execute()
        
        if response.data:
            logger.info(f"Session saved successfully for user {user_id}")
            return response.data[0]
        else:
            logger.error(f"Failed to save session for user {user_id}: No data returned")
            return None
            
    except Exception as e:
        logger.error(f"Error saving session for user {user_id}: {e}")
        raise


async def guardar_evento(user_id: str, tipo_evento: str, valor: str) -> Optional[Dict[str, Any]]:
    """
    Guarda un evento de comportamiento en la tabla eventos_comportamiento
    
    Args:
        user_id: ID del usuario
        tipo_evento: Tipo del evento (ej: "acceso_madrugada", "tiempo_respuesta_alto")
        valor: Valor del evento (ej: "03:14", "120")
        
    Returns:
        Dict con los datos guardados o None si hubo error
        
    Raises:
        Exception: Si hay error en la inserción
    """
    try:
        client = get_supabase_client()
        
        # Preparar datos para inserción
        event_data = {
            'user_id': user_id,
            'tipo_evento': tipo_evento,
            'valor': valor,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Insertar en Supabase
        response = client.table('eventos_comportamiento').insert(event_data).execute()
        
        if response.data:
            logger.info(f"Event saved successfully: {tipo_evento} for user {user_id}")
            return response.data[0]
        else:
            logger.error(f"Failed to save event {tipo_evento} for user {user_id}: No data returned")
            return None
            
    except Exception as e:
        logger.error(f"Error saving event {tipo_evento} for user {user_id}: {e}")
        raise


async def guardar_eventos_señales(user_id: str, señales: SenalesWeb) -> bool:
    """
    Guarda múltiples eventos basados en las señales detectadas
    
    Args:
        user_id: ID del usuario
        señales: Objeto SenalesWeb con todas las señales
        
    Returns:
        bool: True si todos los eventos se guardaron correctamente
    """
    try:
        eventos_guardados = 0
        
        # Evento de acceso en madrugada
        if señales.es_madrugada:
            await guardar_evento(user_id, "acceso_madrugada", señales.hora_acceso)
            eventos_guardados += 1
        
        # Evento de tiempo de respuesta alto
        if señales.tiempo_respuesta_usuario_seg > 300:
            await guardar_evento(user_id, "tiempo_respuesta_alto", str(señales.tiempo_respuesta_usuario_seg))
            eventos_guardados += 1
        
        # Evento de días sin registrar
        if señales.dias_sin_registrar > 0:
            await guardar_evento(user_id, "dias_sin_actividad", str(señales.dias_sin_registrar))
            eventos_guardados += 1
        
        # Evento de sesión corta
        if señales.duracion_sesion_anterior_seg < 30:
            await guardar_evento(user_id, "sesion_corta", str(señales.duracion_sesion_anterior_seg))
            eventos_guardados += 1
        
        # Evento de frecuencia alta de accesos
        if señales.frecuencia_accesos_hoy > 10:
            await guardar_evento(user_id, "accesos_frecuentes", str(señales.frecuencia_accesos_hoy))
            eventos_guardados += 1
        
        # Evento de checkin emocional
        if señales.checkin_emocional:
            await guardar_evento(user_id, "checkin_emocional", señales.checkin_emocional)
            eventos_guardados += 1
        
        logger.info(f"Saved {eventos_guardados} behavioral events for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving behavioral events for user {user_id}: {e}")
        return False