"""
Servicio de administradores para base de datos Supabase
Maneja operaciones CRUD para la tabla admins
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

from db.supabase_client import SupabaseClient

# Configurar logging
logger = logging.getLogger(__name__)


def get_supabase_client():
    """Obtener cliente Supabase"""
    return SupabaseClient().client


async def obtener_admin_por_codigo(telegram_id: str, codigo_secreto: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un administrador por telegram_id y código secreto
    
    Args:
        telegram_id: ID de Telegram del admin
        codigo_secreto: Código secreto del admin
        
    Returns:
        Dict con datos del admin o None si no existe/no coincide
    """
    try:
        client = get_supabase_client()
        
        logger.info(f"Buscando admin - telegram_id: {telegram_id}, codigo: {codigo_secreto}")
        
        # Primero verificar si existe el admin con ese telegram_id
        response_check = client.table('admins')\
            .select('*')\
            .eq('telegram_id', telegram_id)\
            .execute()
        
        logger.info(f"Admins encontrados con telegram_id {telegram_id}: {len(response_check.data) if response_check.data else 0}")
        
        if response_check.data:
            logger.info(f"Admin encontrado: {response_check.data[0]}")
        
        response = client.table('admins')\
            .select('*')\
            .eq('telegram_id', telegram_id)\
            .eq('codigo_secreto', codigo_secreto)\
            .eq('activo', True)\
            .execute()
        
        logger.info(f"Respuesta de autenticación: {response.data}")
        
        if response.data and len(response.data) > 0:
            admin_data = response.data[0]
            
            # Actualizar último acceso
            await actualizar_ultimo_acceso(admin_data['id'])
            
            logger.info(f"Admin autenticado exitosamente: {telegram_id}")
            return admin_data
        
        logger.warning(f"Intento de login fallido para admin: {telegram_id}")
        return None
        
    except Exception as e:
        logger.error(f"Error obteniendo admin {telegram_id}: {e}")
        return None


async def actualizar_ultimo_acceso(admin_id: str) -> None:
    """
    Actualiza el campo ultimo_acceso del administrador
    
    Args:
        admin_id: ID del administrador
    """
    try:
        client = get_supabase_client()
        
        client.table('admins')\
            .update({'ultimo_acceso': datetime.now().isoformat()})\
            .eq('id', admin_id)\
            .execute()
            
    except Exception as e:
        logger.error(f"Error actualizando último acceso del admin {admin_id}: {e}")


async def existe_admin_telegram(telegram_id: str) -> bool:
    """
    Verifica si existe un admin con el telegram_id dado
    
    Args:
        telegram_id: ID de Telegram a verificar
        
    Returns:
        bool: True si existe, False en caso contrario
    """
    try:
        client = get_supabase_client()
        
        response = client.table('admins')\
            .select('id')\
            .eq('telegram_id', telegram_id)\
            .eq('activo', True)\
            .execute()
        
        return bool(response.data and len(response.data) > 0)
        
    except Exception as e:
        logger.error(f"Error verificando existencia de admin {telegram_id}: {e}")
        return False


async def obtener_admin_por_id(admin_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un administrador por su ID
    
    Args:
        admin_id: ID del administrador
        
    Returns:
        Dict con datos del admin o None si no existe
    """
    try:
        client = get_supabase_client()
        
        response = client.table('admins')\
            .select('*')\
            .eq('id', admin_id)\
            .eq('activo', True)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error obteniendo admin por ID {admin_id}: {e}")
        return None


async def listar_todos_los_admins() -> List[Dict[str, Any]]:
    """
    Lista todos los administradores (para debugging)
    
    Returns:
        List de diccionarios con datos de todos los admins
    """
    try:
        client = get_supabase_client()
        
        response = client.table('admins')\
            .select('*')\
            .execute()
        
        logger.info(f"Total de admins en BD: {len(response.data) if response.data else 0}")
        return response.data or []
        
    except Exception as e:
        logger.error(f"Error listando admins: {e}")
        return []