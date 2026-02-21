"""
Router para endpoints administrativos
Proporciona estadísticas anonimizadas y métricas del sistema
"""

import logging
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, List
from datetime import datetime, timedelta

from models.schemas import EstadisticasAdmin
from db.supabase_client import get_supabase_client
from db.sesiones import obtener_estadisticas_uso

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/admin", tags=["admin"])


async def verificar_acceso_admin():
    """
    Middleware simple para verificar acceso administrativo
    En producción esto debería usar autenticación real
    """
    # TODO: Implementar verificación de token/credenciales admin
    pass


@router.get("/stats", response_model=EstadisticasAdmin)
async def obtener_estadisticas_sistema(
    dias_atras: int = 7,
    admin_access = Depends(verificar_acceso_admin)
) -> EstadisticasAdmin:
    """
    Obtiene estadísticas anonimizadas del sistema
    
    Args:
        dias_atras: Número de días hacia atrás para calcular estadísticas
        admin_access: Verificación de acceso administrativo
        
    Returns:
        EstadisticasAdmin: Estadísticas completas del sistema
        
    Raises:
        HTTPException: Si hay errores en la consulta
    """
    try:
        logger.info(f"Generating admin statistics for last {dias_atras} days")
        
        # 1. Obtener estadísticas básicas de uso
        stats_uso = await obtener_estadisticas_uso(dias_atras)
        
        # 2. Calcular usuarios activos
        usuarios_activos = await _contar_usuarios_activos(dias_atras)
        
        # 3. Obtener sesiones de hoy
        sesiones_hoy = await _contar_sesiones_hoy()
        
        # 4. Calcular duración promedio de sesión
        duracion_promedio = await _calcular_duracion_promedio_sesion(dias_atras)
        
        # 5. Obtener distribución de estados
        distribucion_estados = await _obtener_distribucion_estados(dias_atras)
        
        # 6. Obtener distribución por etapa de vida
        distribucion_etapas = await _obtener_distribucion_etapas(dias_atras)
        
        # 7. Contar alertas de riesgo activas
        alertas_activas = await _contar_alertas_riesgo_activas()
        
        # 8. Calcular tendencias semanales
        tendencias_semanales = await _calcular_tendencias_semanales()
        
        estadisticas = EstadisticasAdmin(
            total_usuarios_activos=usuarios_activos,
            sesiones_hoy=sesiones_hoy,
            promedio_duracion_sesion_min=duracion_promedio,
            distribucion_estados=distribucion_estados,
            distribucion_etapas_vida=distribucion_etapas,
            alertas_riesgo_activas=alertas_activas,
            tendencias_semanales=tendencias_semanales
        )
        
        logger.info("Admin statistics generated successfully")
        return estadisticas
        
    except Exception as e:
        logger.error(f"Error generating admin statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating system statistics"
        )


async def _contar_usuarios_activos(dias_atras: int) -> int:
    """Cuenta usuarios únicos activos en los últimos N días"""
    try:
        fecha_limite = datetime.utcnow() - timedelta(days=dias_atras)
        
        supabase = get_supabase_client()
        response = supabase.table("sesiones_web").select("user_id", count="exact") \
            .gte("hora_inicio", fecha_limite.isoformat()) \
            .execute()
        
        if response.data:
            # Contar usuarios únicos
            usuarios_unicos = len(set(sesion["user_id"] for sesion in response.data))
            return usuarios_unicos
        return 0
        
    except Exception as e:
        logger.error(f"Error counting active users: {e}")
        return 0


async def _contar_sesiones_hoy() -> int:
    """Cuenta sesiones iniciadas hoy"""
    try:
        hoy = datetime.utcnow().date()
        
        supabase = get_supabase_client()
        response = supabase.table("sesiones_web") \
            .select("*", count="exact") \
            .gte("hora_inicio", hoy.isoformat()) \
            .execute()
        
        return response.count if response.count else 0
    
    except Exception as e:
        logger.error(f"Error counting today's sessions: {e}")
        return 0


async def _calcular_duracion_promedio_sesion(dias_atras: int) -> float:
    """Calcula duración promedio de sesión en minutos"""
    try:
        fecha_limite = datetime.utcnow() - timedelta(days=dias_atras)
        
        supabase = get_supabase_client()
        response = supabase.table("sesiones_web") \
            .select("duracion_seg") \
            .gte("hora_inicio", fecha_limite.isoformat()) \
            .not_.is_("duracion_seg", "null") \
            .execute()
        
        if response.data:
            duraciones = [sesion["duracion_seg"] for sesion in response.data if sesion["duracion_seg"]]
            if duraciones:
                promedio_segundos = sum(duraciones) / len(duraciones)
                return round(promedio_segundos / 60, 2)  # Convertir a minutos
        return 0.0
        
    except Exception as e:
        logger.error(f"Error calculating average session duration: {e}")
        return 0.0


async def _obtener_distribucion_estados(dias_atras: int) -> Dict[str, int]:
    """Obtiene distribución de estados inferidos"""
    try:
        fecha_limite = datetime.utcnow() - timedelta(days=dias_atras)
        
        # Esta información vendría de una tabla de análisis de contexto
        # Por ahora simulamos datos realistas
        return {
            "estable": 45,
            "cansancio": 25,
            "ansiedad": 15,
            "aislamiento": 10,
            "desconexion": 5
        }
        
    except Exception as e:
        logger.error(f"Error getting state distribution: {e}")
        return {}


async def _obtener_distribucion_etapas(dias_atras: int) -> Dict[str, int]:
    """Obtiene distribución por etapa de vida"""
    try:
        # Esta información vendría del registro de usuarios
        # Por ahora simulamos datos realistas
        return {
            "mayor_70": 30,
            "adulto_activo": 40, 
            "joven": 20,
            "migrante": 8,
            "discapacidad_visual": 2
        }
    except Exception as e:
        logger.error(f"Error getting life stage distribution: {e}")
        return {}


async def _contar_alertas_riesgo_activas() -> int:
    """Cuenta alertas de riesgo activas"""
    try:
        # Esta información vendría de una tabla de alertas ML
        # Por ahora simulamos datos
        return 12  # Número simulado de alertas activas
        
    except Exception as e:
        logger.error(f"Error counting risk alerts: {e}")
        return 0


async def _calcular_tendencias_semanales() -> Dict[str, List[float]]:
    """Calcula tendencias de uso por día de la semana"""
    try:
        dias_semana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
        
        # Simulamos tendencias realistas
        # En producción esto vendría de consultas a la base de datos
        tendencias = {
            "sesiones_diarias": [85, 90, 88, 92, 87, 65, 70],  # Menos los fines de semana
            "tiempo_promedio_minutos": [35, 38, 40, 37, 36, 25, 28],
            "estados_negativos_pct": [15, 12, 18, 20, 16, 10, 8]  # Más estrés entre semana
        }
        
        return tendencias
        
    except Exception as e:
        logger.error(f"Error calculating weekly trends: {e}")
        return {}


@router.get("/health")
async def health_check():
    """Health check específico para el router admin"""
    return {
        "status": "ok",
        "service": "admin-router", 
        "endpoints": ["/admin/stats"]
    }


@router.get("/system-info")
async def obtener_info_sistema(admin_access = Depends(verificar_acceso_admin)):
    """Obtiene información general del sistema"""
    try:
        return {
            "version": "1.0.0",
            "ambiente": "desarrollo",  # TODO: obtener de variables de entorno
            "base_datos_conectada": True,  # TODO: verificar conexión real
            "servicios_externos": {
                "supabase": "conectado",
                "claude_api": "conectado"  # TODO: verificar conexión real
            },
            "uptime": "disponible",  # TODO: calcular uptime real
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"Error getting system info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving system information"
        )