"""
Servicio de usuarios para base de datos Supabase
Maneja operaciones CRUD para usuarios y generación de códigos secretos
"""

import logging
import random
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from db.supabase_client import SupabaseClient
from models.schemas import Usuario

# Configurar logging
logger = logging.getLogger(__name__)


def get_supabase_client():
    """Obtener cliente Supabase"""
    return SupabaseClient().client


async def generar_codigo_secreto_unico() -> str:
    """
    Genera un código secreto único de 4 dígitos
    
    Returns:
        str: Código de 4 dígitos único
        
    Raises:
        Exception: Si no puede generar un código único después de múltiples intentos
    """
    max_intentos = 100
    
    for intento in range(max_intentos):
        # Generar código de 4 dígitos
        codigo = f"{random.randint(0, 9999):04d}"
        
        try:
            client = get_supabase_client()
            
            # Verificar que no exista en la base de datos
            response = client.table('usuarios').select('id').eq('codigo_secreto', codigo).execute()
            
            if not response.data:
                logger.info(f"Código secreto único generado: {codigo}")
                return codigo
                
        except Exception as e:
            logger.error(f"Error verificando unicidad del código {codigo}: {e}")
            continue
    
    raise Exception(f"No se pudo generar un código único después de {max_intentos} intentos")


async def crear_usuario(
    nombre: str,
    etapa_vida: str,
    modo_comunicacion: str,
    telegram_id: str,
    zona_horaria: str = "Europe/Usuarios"
) -> Optional[Usuario]:
    """
    Crea un nuevo usuario en la base de datos
    
    Args:
        nombre: Nombre del usuario
        etapa_vida: Etapa de vida detectada
        modo_comunicacion: Modo de comunicación preferido
        telegram_id: ID de Telegram
        zona_horaria: Zona horaria del usuario
        
    Returns:
        Usuario: Usuario creado o None si hubo error
        
    Raises:
        Exception: Si hay error en la creación
    """
    try:
        client = get_supabase_client()
        
        # Generar código secreto único
        codigo_secreto = await generar_codigo_secreto_unico()
        
        # Preparar datos para inserción
        user_data = {
            'id': str(uuid.uuid4()),
            'nombre': nombre,
            'etapa_vida': etapa_vida,
            'modo_comunicacion': modo_comunicacion,
            'zona_horaria': zona_horaria,
            'telegram_id': telegram_id,
            'onboarding_completado': True,
            'codigo_secreto': codigo_secreto,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insertar en Supabase
        response = client.table('usuarios').insert(user_data).execute()
        
        if response.data:
            logger.info(f"Usuario creado exitosamente: {telegram_id}")
            return Usuario(**response.data[0])
        else:
            logger.error(f"Error creando usuario {telegram_id}: No data returned")
            return None
            
    except Exception as e:
        logger.error(f"Error creando usuario {telegram_id}: {e}")
        raise


async def obtener_usuario_por_telegram(telegram_id: str) -> Optional[Usuario]:
    """
    Obtiene un usuario por su ID de Telegram
    
    Args:
        telegram_id: ID de Telegram del usuario
        
    Returns:
        Usuario: Usuario encontrado o None si no existe
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').select('*').eq('telegram_id', telegram_id).execute()
        
        if response.data:
            return Usuario(**response.data[0])
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error obteniendo usuario {telegram_id}: {e}")
        return None


async def obtener_usuario_por_id(user_id: str) -> Optional[Usuario]:
    """
    Obtiene un usuario por su ID
    
    Args:
        user_id: ID del usuario
        
    Returns:
        Usuario: Usuario encontrado o None si no existe
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').select('*').eq('id', user_id).execute()
        
        if response.data:
            return Usuario(**response.data[0])
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error obteniendo usuario {user_id}: {e}")
        return None


async def verificar_codigo_secreto_unico(codigo: str) -> bool:
    """
    Verifica que un código secreto sea único en la base de datos
    
    Args:
        codigo: Código a verificar
        
    Returns:
        bool: True si es único, False si ya existe
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').select('id').eq('codigo_secreto', codigo).execute()
        
        return len(response.data) == 0
        
    except Exception as e:
        logger.error(f"Error verificando código {codigo}: {e}")
        return False


async def actualizar_onboarding_completado(user_id: str, completado: bool = True) -> bool:
    """
    Actualiza el estado de onboarding de un usuario
    
    Args:
        user_id: ID del usuario
        completado: Estado del onboarding
        
    Returns:
        bool: True si se actualizó exitosamente
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').update({
            'onboarding_completado': completado
        }).eq('id', user_id).execute()
        
        if response.data:
            logger.info(f"Onboarding actualizado para usuario {user_id}")
            return True
        else:
            return False
            
    except Exception as e:
        logger.error(f"Error actualizando onboarding para {user_id}: {e}")
        return False


async def listar_usuarios_activos(limite: int = 100) -> List[Usuario]:
    """
    Lista usuarios activos (con onboarding completado)
    
    Args:
        limite: Límite de usuarios a retornar
        
    Returns:
        List[Usuario]: Lista de usuarios activos
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').select('*').eq('onboarding_completado', True).limit(limite).execute()
        
        if response.data:
            return [Usuario(**user_data) for user_data in response.data]
        else:
            return []
            
    except Exception as e:
        logger.error(f"Error listando usuarios activos: {e}")
        return []


async def existe_usuario_telegram(telegram_id: str) -> bool:
    """
    Verifica si ya existe un usuario con ese ID de Telegram
    
    Args:
        telegram_id: ID de Telegram a verificar
        
    Returns:
        bool: True si existe, False si no existe
    """
    try:
        client = get_supabase_client()
        
        response = client.table('usuarios').select('id').eq('telegram_id', telegram_id).execute()
        
        return len(response.data) > 0
        
    except Exception as e:
        logger.error(f"Error verificando existencia de usuario {telegram_id}: {e}")
        return False


async def obtener_usuario_por_codigo(telegram_id: str, codigo_secreto: str) -> Optional[Usuario]:
    """
    Busca un usuario por su telegram_id y código secreto (login)
    
    Args:
        telegram_id: ID de Telegram del usuario
        codigo_secreto: Código secreto de 4 dígitos
        
    Returns:
        Usuario si existe y el código coincide, None si no
    """
    try:
        client = get_supabase_client()
        
        response = (
            client.table('usuarios')
            .select('*')
            .eq('telegram_id', telegram_id)
            .eq('codigo_secreto', codigo_secreto)
            .execute()
        )
        
        if response.data:
            logger.info(f"Login exitoso para usuario {telegram_id}")
            return Usuario(**response.data[0])
        
        logger.warning(f"Login fallido para usuario {telegram_id}: credenciales incorrectas")
        return None
        
    except Exception as e:
        logger.error(f"Error en login para {telegram_id}: {e}")
        return None


async def get_database_status() -> Dict[str, Any]:
    """
    Obtiene el estado actual de la conexión a Supabase
    
    Returns:
        Dict con información del estado de la base de datos
    """
    try:
        client = get_supabase_client()
        
        # Probar conexión con una consulta simple
        response = client.table('usuarios').select('id').limit(1).execute()
        
        return {
            "status": "connected",
            "database": "supabase",
            "connection_test": "success",
            "total_users": len(response.data) if response.data else 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error verificando estado de base de datos: {e}")
        return {
            "status": "error",
            "database": "supabase", 
            "connection_test": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }