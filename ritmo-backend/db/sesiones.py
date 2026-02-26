import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
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


# === NUEVAS FUNCIONES PARA CHAT Y ML ===

async def guardar_mensaje(
    user_id: str, 
    mensaje_usuario: str, 
    respuesta_sistema: str, 
    tono: str
) -> Optional[Dict[str, Any]]:
    """
    Guarda un intercambio de chat en la base de datos
    
    Args:
        user_id: ID del usuario
        mensaje_usuario: Mensaje del usuario
        respuesta_sistema: Respuesta generada por el sistema
        tono: Tono de la respuesta
        
    Returns:
        Dict con los datos guardados o None si hubo error
    """
    try:
        client = get_supabase_client()
        
        # Preparar datos para inserción
        chat_data = {
            'user_id': user_id,
            'mensaje_usuario': mensaje_usuario,
            'respuesta_sistema': respuesta_sistema,
            'tono': tono,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Insertar en Supabase
        response = client.table('historial_chat').insert(chat_data).execute()
        
        if response.data:
            logger.info(f"Chat message saved successfully for user {user_id}")
            return response.data[0]
        else:
            logger.error(f"Failed to save chat message for user {user_id}: No data returned")
            return None
            
    except Exception as e:
        logger.error(f"Error saving chat message for user {user_id}: {e}")
        return None


async def obtener_historial_chat(
    user_id: str, 
    limit: int = 10
) -> List[Dict[str, str]]:
    """
    Obtiene el historial reciente de chat del usuario
    
    Args:
        user_id: ID del usuario
        limit: Límite de mensajes a obtener
        
    Returns:
        Lista de diccionarios con el historial de chat
    """
    try:
        client = get_supabase_client()
        
        response = client.table('historial_chat') \
            .select('mensaje_usuario, respuesta_sistema, tono, timestamp') \
            .eq('user_id', user_id) \
            .order('timestamp', desc=True) \
            .limit(limit) \
            .execute()
        
        if response.data:
            logger.info(f"Retrieved {len(response.data)} chat messages for user {user_id}")
            # Invertir orden para tener el más antiguo primero
            return list(reversed(response.data))
        else:
            logger.info(f"No chat history found for user {user_id}")
            return []
            
    except Exception as e:
        logger.error(f"Error retrieving chat history for user {user_id}: {e}")
        return []


async def obtener_historial_usuario(
    user_id: str, 
    dias_atras: int = 30
) -> List[Dict[str, Any]]:
    """
    Obtiene el historial completo del usuario para análisis ML
    
    Args:
        user_id: ID del usuario
        dias_atras: Número de días hacia atrás
        
    Returns:
        Lista de diccionarios con todo el historial del usuario
    """
    try:
        from datetime import timedelta
        client = get_supabase_client()
        
        fecha_limite = datetime.utcnow() - timedelta(days=dias_atras)
        
        # Obtener sesiones
        sesiones_response = client.table('sesiones_web') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('hora_inicio', fecha_limite.isoformat()) \
            .order('hora_inicio', desc=True) \
            .execute()
        
        # Obtener mensajes de chat
        chat_response = client.table('historial_chat') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', fecha_limite.isoformat()) \
            .order('timestamp', desc=True) \
            .execute()
        
        # Obtener eventos de comportamiento
        eventos_response = client.table('eventos_comportamiento') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', fecha_limite.isoformat()) \
            .order('timestamp', desc=True) \
            .execute()
        
        historial = {
            'sesiones': sesiones_response.data if sesiones_response.data else [],
            'chat_messages': chat_response.data if chat_response.data else [],
            'eventos': eventos_response.data if eventos_response.data else []
        }
        
        logger.info(f"Retrieved complete history for user {user_id}: "
                   f"{len(historial['sesiones'])} sessions, "
                   f"{len(historial['chat_messages'])} messages, "
                   f"{len(historial['eventos'])} events")
        
        return historial
        
    except Exception as e:
        logger.error(f"Error retrieving user history for {user_id}: {e}")
        return {'sesiones': [], 'chat_messages': [], 'eventos': []}


async def obtener_estadisticas_uso(dias_atras: int = 7) -> Dict[str, Any]:
    """
    Obtiene estadísticas de uso del sistema para el panel admin
    
    Args:
        dias_atras: Número de días hacia atrás para calcular estadísticas
        
    Returns:
        Dict con estadísticas de uso
    """
    try:
        from datetime import timedelta
        client = get_supabase_client()
        
        fecha_limite = datetime.utcnow() - timedelta(days=dias_atras)
        
        # Contar sesiones totales
        sesiones_response = client.table('sesiones_web') \
            .select('*', count='exact') \
            .gte('hora_inicio', fecha_limite.isoformat()) \
            .execute()
        
        # Contar mensajes de chat
        chat_response = client.table('historial_chat') \
            .select('*', count='exact') \
            .gte('timestamp', fecha_limite.isoformat()) \
            .execute()
        
        # Contar usuarios únicos
        usuarios_response = client.table('sesiones_web') \
            .select('user_id') \
            .gte('hora_inicio', fecha_limite.isoformat()) \
            .execute()
        
        usuarios_unicos = len(set(sesion['user_id'] for sesion in usuarios_response.data)) if usuarios_response.data else 0
        
        estadisticas = {
            'total_sesiones': sesiones_response.count if sesiones_response.count else 0,
            'total_mensajes_chat': chat_response.count if chat_response.count else 0,
            'usuarios_unicos': usuarios_unicos,
            'periodo_dias': dias_atras
        }
        
        logger.info(f"Generated usage statistics for last {dias_atras} days: {estadisticas}")
        return estadisticas
        
    except Exception as e:
        logger.error(f"Error generating usage statistics: {e}")
        return {'total_sesiones': 0, 'total_mensajes_chat': 0, 'usuarios_unicos': 0, 'periodo_dias': dias_atras}


# === FUNCIONES PARA CHECKINS EMOCIONALES - MI ÁNIMO ===

async def guardar_checkin_emocional(
    user_id: str, 
    estado_emocional: str,
    telegram_id: Optional[str] = None,
    metodo: str = "web_galaxia",
    mensaje_contexto: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Guarda un checkin emocional en la tabla checkins_diarios
    
    Args:
        user_id: ID del usuario
        estado_emocional: Estado emocional seleccionado (ej: "sereno", "radiante")
        telegram_id: ID de Telegram (opcional)
        metodo: Método de captura (default: "web_galaxia")
        mensaje_contexto: Contexto adicional del usuario (opcional)
        
    Returns:
        Dict con los datos guardados o None si hubo error
        
    Raises:
        Exception: Si hay error en la inserción
    """
    try:
        client = get_supabase_client()
        
        now = datetime.now(timezone.utc)
        fecha_hoy = now.date().isoformat()
        
        # Mapear estados emocionales de galaxia a valores BD válidos
        mapeo_estados = {
            'sereno': 'normal',
            'radiante': 'bien',
            'esperanzado': 'bien',
            'creativo': 'bien',
            'conectado': 'bien',
            'reflexivo': 'normal',
            'nostalgico': 'normal',
            'ansioso': 'dificil',
            'confundido': 'dificil',
            'abrumado': 'dificil'
        }
        
        # Convertir estado emocional a valor válido
        estado_bd = mapeo_estados.get(estado_emocional, 'normal')
        
        # Generar telegram_id temporal si no se proporciona (BD lo requiere como NOT NULL)
        if not telegram_id:
            telegram_id = f"web-user-{user_id[-8:]}"  # Usar últimos 8 chars del user_id
        
        # Preparar datos para inserción
        checkin_data = {
            'user_id': user_id,
            'telegram_id': telegram_id,
            'fecha': fecha_hoy,
            'estado_emocional': estado_bd,  # Usar valor mapeado
            'hora_respuesta': now.isoformat(),  # Usar timestamp completo
            'metodo': 'proactivo',  # Siempre usar 'proactivo' para BD independientemente del frontend
            'mensaje_contexto': mensaje_contexto,
            'created_at': now.isoformat()
        }
        
        # Verificar si ya existe un checkin para hoy
        existing_response = client.table('checkins_diarios') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('fecha', fecha_hoy) \
            .execute()
        
        if existing_response.data and len(existing_response.data) > 0:
            # Actualizar registro existente
            record_id = existing_response.data[0]['id']
            response = client.table('checkins_diarios') \
                .update(checkin_data) \
                .eq('id', record_id) \
                .execute()
            
            if response.data:
                logger.info(f"Emotional checkin updated successfully: {estado_bd} for user {user_id}")
            else:
                logger.error(f"Failed to update emotional checkin for user {user_id}: No data returned")
        else:
            # Insertar nuevo registro
            response = client.table('checkins_diarios').insert(checkin_data).execute()
            
            if response.data:
                logger.info(f"Emotional checkin saved successfully: {estado_bd} for user {user_id}")
            else:
                logger.error(f"Failed to save emotional checkin for user {user_id}: No data returned")
        
        result = response.data[0] if response.data else None
        return result
            
    except Exception as e:
        error_msg = f"Error saving emotional checkin for user {user_id}: {e}"
        logger.error(error_msg)
        raise


async def obtener_checkins_usuario(
    user_id: str, 
    dias_atras: int = 7
) -> List[Dict[str, Any]]:
    """
    Obtiene los checkins emocionales de un usuario en los últimos días
    
    Args:
        user_id: ID del usuario
        dias_atras: Número de días hacia atrás (default: 7)
        
    Returns:
        Lista de checkins emocionales
    """
    try:
        client = get_supabase_client()
        
        # Calcular fecha límite
        fecha_limite = datetime.utcnow().date()
        if dias_atras > 0:
            from datetime import timedelta
            fecha_limite = fecha_limite - timedelta(days=dias_atras)
        
        # Consultar checkins ordenados por fecha/hora desc
        response = client.table('checkins_diarios') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('fecha', fecha_limite.isoformat()) \
            .order('fecha', desc=True) \
            .order('hora_respuesta', desc=True) \
            .execute()
        
        if response.data:
            logger.info(f"Retrieved {len(response.data)} checkins for user {user_id}")
            return response.data
        else:
            logger.info(f"No checkins found for user {user_id}")
            return []
            
    except Exception as e:
        logger.error(f"Error retrieving checkins for user {user_id}: {e}")
        return []


async def obtener_ultimo_checkin_usuario(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene el último checkin emocional de un usuario
    
    Args:
        user_id: ID del usuario
        
    Returns:
        Último checkin o None si no existe
    """
    try:
        client = get_supabase_client()
        
        # Consultar último checkin
        response = client.table('checkins_diarios') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"Retrieved last checkin for user {user_id}: {response.data[0]['estado_emocional']}")
            return response.data[0]
        else:
            logger.info(f"No checkins found for user {user_id}")
            return None
            
    except Exception as e:
        logger.error(f"Error retrieving last checkin for user {user_id}: {e}")
        return None