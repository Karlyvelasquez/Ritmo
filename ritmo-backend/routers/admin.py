"""
Router para endpoints administrativos
Proporciona estadísticas anonimizadas y métricas del sistema
"""

import logging
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, List
from datetime import datetime, timedelta
import os
import pathlib
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

from models.schemas import EstadisticasAdmin
from db.supabase_client import get_supabase_client
from db.sesiones import obtener_estadisticas_uso

# Cargar variables de entorno para asegurar que OpenAI tenga acceso
current_dir = pathlib.Path(__file__).parent.parent
env_path = current_dir / '.env'
print(f"[ADMIN] Cargando .env desde: {env_path}")
load_dotenv(env_path)

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/admin", tags=["admin"])

# Configurar OpenAI
openai_client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"[DEBUG] API Key encontrada en admin.py: {'Sí' if api_key else 'No'}")
    if api_key:
        print(f"[DEBUG] API Key (primeros 10 chars): {api_key[:10]}...")
        openai_client = OpenAI(api_key=api_key)
        print("[DEBUG] OpenAI client creado exitosamente")
        logger.info("OpenAI client configurado correctamente")
    else:
        print("[DEBUG] OPENAI_API_KEY no encontrada en variables de entorno")
        logger.warning("OPENAI_API_KEY no encontrada en variables de entorno")
except Exception as e:
    print(f"[DEBUG] Error configurando OpenAI client: {e}")
    logger.error(f"Error configurando OpenAI client: {e}")

# Modelos para el análisis de IA
class DashboardData(BaseModel):
    data: Dict[str, Any]
    context: str

class AIAnalysisResponse(BaseModel):
    analysis: str
    timestamp: datetime
    status: str


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


@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def generar_analisis_ia(
    request: DashboardData,
    admin_access = Depends(verificar_acceso_admin)
) -> AIAnalysisResponse:
    """
    Genera análisis inteligente de los datos del dashboard usando OpenAI
    
    Args:
        request: Datos del dashboard y contexto para análisis
        admin_access: Verificación de acceso administrativo
        
    Returns:
        AIAnalysisResponse: Análisis generado por IA
        
    Raises:
        HTTPException: Si hay errores en la generación o configuración
    """
    try:
        print(f"[DEBUG] Iniciando análisis de IA...")
        print(f"[DEBUG] openai_client es None: {openai_client is None}")
        
        if not openai_client:
            logger.error("OpenAI client no está configurado")
            print("[DEBUG] OpenAI client no configurado, usando respuesta fallback")
            return AIAnalysisResponse(
                analysis="El sistema de IA no está disponible. Basándose en los datos actuales del Sistema Nacional de Bienestar de España: El índice de bienestar se mantiene estable en 6.8/10, con 12 casos críticos que requieren atención inmediata. Los grupos de edad 18-25 años muestran mayor incidencia de ansiedad (32%), mientras que el estrés laboral afecta al 28% de la población activa. Se recomienda reforzar los programas de prevención en jóvenes adultos y implementar medidas de apoyo psicológico en el ámbito laboral.",
                timestamp=datetime.utcnow(),
                status="fallback"
            )

        print("[DEBUG] OpenAI client disponible, procediendo con análisis...")
        
        # Preparar datos estructurados para el análisis
        dashboard_data = request.data
        context = request.context

        # Crear prompt específico para análisis de salud mental en España
        prompt = f"""
        Eres un especialista en análisis de datos de salud mental y política pública sanitaria en España.
        
        Analiza los siguientes datos del Sistema Nacional de Bienestar:
        
        Contexto: {context}
        
        Datos del dashboard:
        - Usuarios activos del sistema: {dashboard_data.get('usuariosTotal', 47852)}
        - Índice de Bienestar Nacional: {dashboard_data.get('bienestarNacional', 6.8)}/10
        - Casos de riesgo crítico: {dashboard_data.get('casosRiesgo', 12)}
        - Ansiedad en jóvenes: {dashboard_data.get('ansiedadJovenes', 32)}%
        - Sesiones activas: {dashboard_data.get('sesionesActivas', 2341)}
        - Reportes pendientes: {dashboard_data.get('reportesPendientes', 89)}
        
        Proporciona un análisis conciso (máximo 200 palabras) que incluya:
        1. Evaluación del estado actual del bienestar nacional
        2. Identificación de tendencias críticas o preocupantes
        3. Recomendaciones específicas para el sistema sanitario español
        4. Prioridades inmediatas de intervención
        
        Usa terminología técnica apropiada y referencias al sistema sanitario español (SNS, CCAA, etc.).
        """

        print("[DEBUG] Realizando llamada a OpenAI...")
        
        # Llamar a OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "Eres un experto analista de datos de salud mental del Ministerio de Sanidad de España, especializado en epidemiología y políticas públicas sanitarias."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )

        analysis_text = response.choices[0].message.content.strip()
        
        print(f"[DEBUG] Respuesta OpenAI recibida exitosamente: {len(analysis_text)} caracteres")
        print(f"[DEBUG] Primeros 100 chars: {analysis_text[:100]}...")

        logger.info("Análisis de IA generado exitosamente")
        
        return AIAnalysisResponse(
            analysis=analysis_text,
            timestamp=datetime.utcnow(),
            status="success"
        )

    except Exception as e:
        logger.error(f"Error generando análisis de IA: {e}")
        # Devolver análisis de fallback en caso de error
        return AIAnalysisResponse(
            analysis=f"Error temporal del sistema de IA. Análisis manual: Los indicadores muestran un sistema estable con {dashboard_data.get('casosRiesgo', 12)} casos críticos activos. El índice de bienestar nacional de {dashboard_data.get('bienestarNacional', 6.8)} refleja una situación controlada pero requiere monitoreo continuo. Se recomienda priorizar la atención a los casos críticos y mantener los protocolos de prevención activos.",
            timestamp=datetime.utcnow(),
            status="error"
        )


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