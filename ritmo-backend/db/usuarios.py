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


# Mapeo de etapas internas a valores de BD
def mapear_etapa_a_bd(etapa_interna: str) -> str:
    """
    Mapea las etapas internas del onboarding a los valores aceptados por la BD
    
    CRÍTICO: Ahora el onboarding usa directamente los valores correctos:
    - 'migrante' (no 'inmigrante')  
    - 'mayor_70' (no 'adulto_mayor')
    
    Args:
        etapa_interna: Etapa detectada por el onboarding
        
    Returns:
        str: Valor válido para la base de datos
    """
    # Mapeo directo - los valores del onboarding ya son los correctos para la BD
    mapeo = {
        "joven": "joven",
        "adulto_activo": "adulto_activo", 
        "migrante": "migrante",              # CORREGIDO: directo, sin mapeo
        "mayor_70": "mayor_70",              # CORREGIDO: directo, sin mapeo
        "discapacidad_visual": "discapacidad_visual",
        # Mantener compatibilidad con valores antiguos por si acaso
        "inmigrante": "migrante",            # Por compatibilidad  
        "adulto_mayor": "mayor_70"           # Por compatibilidad
    }
    
    etapa_bd = mapeo.get(etapa_interna, "joven")  # Fallback cambiado a 'joven' (más neutral)
    
    if etapa_bd != etapa_interna:
        logger.info(f"Mapeando etapa '{etapa_interna}' -> '{etapa_bd}' para BD")
    
    return etapa_bd


def mapear_etapa_desde_bd(etapa_bd: str) -> str:
    """
    Mapea los valores de BD de vuelta a etapas internas del sistema
    
    Args:
        etapa_bd: Valor de la base de datos
        
    Returns:
        str: Etapa interna del sistema
    """
    # Los valores de BD y sistema ahora son idénticos, mapeo directo
    mapeo_inverso = {
        "joven": "joven",
        "adulto_activo": "adulto_activo",
        "migrante": "migrante",              # CORREGIDO: BD y sistema usan mismo valor
        "mayor_70": "mayor_70",              # CORREGIDO: BD y sistema usan mismo valor
        "discapacidad_visual": "discapacidad_visual",
        # Compatibilidad con valores antiguos en BD (por si quedaron registros viejos)
        "inmigrante": "migrante",            # Convertir valores antiguos
        "adulto_mayor": "mayor_70",          # Convertir valores antiguos
        "senior": "mayor_70"                 # Compatibilidad anterior
    }
    
    return mapeo_inverso.get(etapa_bd, etapa_bd)


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
    zona_horaria: str = "Europe/Madrid"
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
        logger.info(f"Iniciando creación de usuario: {telegram_id}")
        
        # Verificar conexión a Supabase
        client = get_supabase_client()
        logger.info("Cliente Supabase obtenido exitosamente")
        
        # Mapear etapa interna a valor de BD
        etapa_bd = mapear_etapa_a_bd(etapa_vida)
        logger.info(f"Etapa de vida mapeada: '{etapa_vida}' -> '{etapa_bd}'")
        
        # Generar código secreto único
        codigo_secreto = await generar_codigo_secreto_unico()
        logger.info(f"Código secreto generado: {codigo_secreto}")
        
        # Preparar datos para inserción
        user_data = {
            'id': str(uuid.uuid4()),
            'nombre': nombre,
            'etapa_vida': etapa_bd,  # Usar valor mapeado
            'modo_comunicacion': modo_comunicacion,
            'zona_horaria': zona_horaria,
            'telegram_id': telegram_id,
            'onboarding_completado': True,
            'codigo_secreto': codigo_secreto,
            'created_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Datos preparados para insertar: {user_data['id']}")
        
        # Insertar en Supabase
        response = client.table('usuarios').insert(user_data).execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"Usuario creado exitosamente en BD: {telegram_id} con ID {user_data['id']}")
            # Mapear etapa de vuelta para el objeto Usuario
            usuario_data = response.data[0].copy()
            usuario_data['etapa_vida'] = mapear_etapa_desde_bd(usuario_data['etapa_vida'])
            usuario_creado = Usuario(**usuario_data)
            logger.info(f"Usuario convertido a objeto: {usuario_creado.codigo_secreto}")
            return usuario_creado
        else:
            logger.error(f"Error: Supabase no devolvió datos para usuario {telegram_id}")
            logger.error(f"Response recibida: {response}")
            raise Exception("Supabase no devolvió datos después de la inserción")
            
    except Exception as e:
        logger.error(f"ERROR CRÍTICO creando usuario {telegram_id}: {str(e)}")
        logger.error(f"Tipo de error: {type(e).__name__}")
        raise  # Re-lanzar la excepción para que falle correctamente


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
            # Mapear etapa de BD a etapa interna
            usuario_data = response.data[0].copy()
            usuario_data['etapa_vida'] = mapear_etapa_desde_bd(usuario_data['etapa_vida'])
            return Usuario(**usuario_data)
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
            # Mapear etapa de BD a etapa interna
            usuario_data = response.data[0].copy()
            usuario_data['etapa_vida'] = mapear_etapa_desde_bd(usuario_data['etapa_vida'])
            return Usuario(**usuario_data)
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
            usuarios = []
            for user_data in response.data:
                # Mapear etapa de BD a etapa interna para cada usuario
                user_data_mapped = user_data.copy()
                user_data_mapped['etapa_vida'] = mapear_etapa_desde_bd(user_data['etapa_vida'])
                usuarios.append(Usuario(**user_data_mapped))
            return usuarios
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
            # Mapear etapa de BD a etapa interna
            usuario_data = response.data[0].copy()
            usuario_data['etapa_vida'] = mapear_etapa_desde_bd(usuario_data['etapa_vida'])
            return Usuario(**usuario_data)
        
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