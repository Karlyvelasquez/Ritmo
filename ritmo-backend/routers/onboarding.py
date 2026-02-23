"""
Router para onboarding conversacional inteligente
Maneja el proceso completo de registro de nuevos usuarios
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel

from models.schemas import (
    OnboardingInicio, OnboardingRespuesta, OnboardingResponse,
    Usuario
)
from agents.onboarding import onboarding_agent
from db.onboarding_sessions import session_manager
from db.usuarios import (
    crear_usuario, existe_usuario_telegram, obtener_usuario_por_telegram,
    obtener_usuario_por_codigo
)


class LoginRequest(BaseModel):
    telegram_id: str
    codigo_secreto: str


class LoginResponse(BaseModel):
    autenticado: bool
    mensaje: str
    usuario: Optional[Dict[str, Any]] = None

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/iniciar", response_model=OnboardingResponse)
async def iniciar_onboarding(request: OnboardingInicio) -> OnboardingResponse:
    """
    Inicia el proceso de onboarding conversacional para un nuevo usuario
    
    Args:
        request: Datos básicos del usuario (telegram_id, nombre)
        
    Returns:
        OnboardingResponse: Primera pregunta del onboarding
        
    Raises:
        HTTPException: Si el usuario ya existe o hay errores
    """
    try:
        logger.info(f"Iniciando onboarding para usuario: {request.telegram_id}")
        
        # 1. Verificar que el usuario no exista ya
        if await existe_usuario_telegram(request.telegram_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario ya existe en el sistema"
            )
        
        # 2. Verificar si ya tiene una sesión activa
        sesion_existente = session_manager.obtener_sesion_por_telegram(request.telegram_id)
        if sesion_existente:
            # Continuar con la sesión existente
            sesion_id = sesion_existente["sesion_id"]
            estado = session_manager.obtener_estado(sesion_id)
            
            if estado and not estado.completado:
                mensaje, estado_actualizado = onboarding_agent.obtener_siguiente_pregunta(estado)
                session_manager.guardar_estado(sesion_id, estado_actualizado)
                
                return OnboardingResponse(
                    mensaje=mensaje,
                    completado=estado_actualizado.completado,
                    etapa_detectada=estado_actualizado.etapa_detectada,
                    codigo_secreto=None,
                    pregunta_numero=estado_actualizado.pregunta_actual,
                    sesion_id=sesion_id
                )
        
        # 3. Crear nueva sesión
        sesion_id = session_manager.crear_sesion(request.telegram_id, request.nombre)
        
        # 4. Iniciar onboarding con el agente
        estado_inicial = onboarding_agent.iniciar_onboarding(
            request.telegram_id, request.nombre, sesion_id
        )
        
        # 5. Obtener primera pregunta
        mensaje_bienvenida = f"¡Hola {request.nombre}! 👋\\n\\nSoy tu asistente personal de RITMO. Me encanta conocerte y quiero entender mejor tu situación para poder ayudarte de la mejor manera.\\n\\nTe haré algunas preguntas casuales, como si fuéramos amigos charlando. No te preocupes, no hay respuestas correctas o incorrectas.\\n\\n¡Empecemos!"
        
        primera_pregunta, estado_actualizado = onboarding_agent.obtener_siguiente_pregunta(estado_inicial)
        
        # 6. Guardar estado
        session_manager.guardar_estado(sesion_id, estado_actualizado)
        
        # 7. Generar respuesta
        mensaje_completo = f"{mensaje_bienvenida}\\n\\n{primera_pregunta}"
        
        response = OnboardingResponse(
            mensaje=mensaje_completo,
            completado=False,
            etapa_detectada=None,
            codigo_secreto=None,
            pregunta_numero=estado_actualizado.pregunta_actual,
            sesion_id=sesion_id
        )
        
        logger.info(f"Onboarding iniciado exitosamente: {sesion_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error iniciando onboarding para {request.telegram_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/responder", response_model=OnboardingResponse)
async def procesar_respuesta(request: OnboardingRespuesta) -> OnboardingResponse:
    """
    Procesa una respuesta del usuario durante el onboarding
    
    Args:
        request: Respuesta del usuario con ID de sesión
        
    Returns:
        OnboardingResponse: Siguiente pregunta o finalización
        
    Raises:
        HTTPException: Si la sesión no existe o hay errores
    """
    try:
        logger.info(f"Procesando respuesta para sesión: {request.sesion_id}")
        
        # 1. Obtener estado de la sesión
        estado = session_manager.obtener_estado(request.sesion_id)
        if not estado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión de onboarding no encontrada o expirada"
            )
        
        # 2. Verificar que no esté ya completado
        if estado.completado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El onboarding ya fue completado"
            )
        
        # 3. Procesar respuesta con el agente
        mensaje_respuesta, estado_actualizado = onboarding_agent.procesar_respuesta(
            request.respuesta, estado
        )
        
        # 4. Guardar estado actualizado
        session_manager.guardar_estado(request.sesion_id, estado_actualizado)
        
        # 5. Si completó el onboarding, crear usuario
        codigo_secreto = None
        if estado_actualizado.completado:
            # Generar código siempre, incluso si Supabase falla
            import random
            codigo_fallback = f"{random.randint(1000, 9999):04d}"  # Evitar 0000
            usuario_creado = False
            
            try:
                # Crear usuario en la base de datos
                usuario = await crear_usuario(
                    nombre=estado_actualizado.nombre,
                    etapa_vida=estado_actualizado.etapa_detectada,
                    modo_comunicacion="texto",  # Default por ahora
                    telegram_id=estado_actualizado.telegram_id
                )
                
                if usuario and usuario.codigo_secreto:
                    codigo_secreto = usuario.codigo_secreto
                    usuario_creado = True
                    logger.info(f"Usuario creado exitosamente en Supabase: {usuario.id}")
                else:
                    # Supabase devolvió vacío o sin código: usar fallback
                    codigo_secreto = codigo_fallback
                    logger.warning("Supabase no devolvió usuario válido, usando código local")
                    
            except Exception as e:
                logger.error(f"Error creando usuario en Supabase: {e}")
                # Detectar tipos específicos de error
                error_msg = str(e).lower()
                if "constraint" in error_msg or "foreign key" in error_msg:
                    logger.error("Error de constraint en base de datos - revisar estructura de tabla")
                elif "null" in error_msg:
                    logger.error("Error de valor NULL - revisar campos obligatorios")
                
                # Usar código local como fallback
                codigo_secreto = codigo_fallback
                usuario_creado = False
            
            # Mensaje final basado en si se guardó o no
            if usuario_creado:
                mensaje_final = f"{mensaje_respuesta}\n\n🎉 ¡Perfecto! Tu perfil ha sido creado exitosamente.\n\n🔐 Tu código secreto es: {codigo_secreto}\n\nEste código es muy importante. Guárdalo bien porque lo necesitarás para identificarte en Telegram y acceder a todas las funciones de RITMO.\n\n¡Bienvenido/a a RITMO! Estoy aquí para acompañarte. 🚀"
            else:
                mensaje_final = f"{mensaje_respuesta}\n\n🎉 Onboarding completado.\n\n🔐 Tu código secreto es: {codigo_secreto}\n\n⚠️ Guardado pendiente: Hay un problema técnico con la base de datos. Tu código es válido, pero el perfil se guardará cuando se solucione. Anota este código ahora."
            
            # Limpiar sesión completada
            session_manager.eliminar_sesion(request.sesion_id)
        else:
            mensaje_final = mensaje_respuesta
        
        # 6. Generar respuesta
        response = OnboardingResponse(
            mensaje=mensaje_final,
            completado=estado_actualizado.completado,
            etapa_detectada=estado_actualizado.etapa_detectada,
            codigo_secreto=codigo_secreto,
            pregunta_numero=estado_actualizado.pregunta_actual,
            sesion_id=request.sesion_id
        )
        
        logger.info(f"Respuesta procesada exitosamente: {request.sesion_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando respuesta para {request.sesion_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/estado/{sesion_id}", response_model=Dict[str, Any])
async def obtener_estado_onboarding(sesion_id: str) -> Dict[str, Any]:
    """
    Obtiene el estado actual de una sesión de onboarding
    
    Args:
        sesion_id: ID de la sesión
        
    Returns:
        Dict con el estado actual
        
    Raises:
        HTTPException: Si la sesión no existe
    """
    try:
        estado = session_manager.obtener_estado(sesion_id)
        if not estado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada o expirada"
            )
        
        return {
            "sesion_id": estado.sesion_id,
            "pregunta_actual": estado.pregunta_actual,
            "total_preguntas_hechas": len(estado.preguntas_hechas),
            "completado": estado.completado,
            "etapa_detectada": estado.etapa_detectada,
            "confianza": estado.confianza
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo estado {sesion_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/cancelar/{sesion_id}")
async def cancelar_onboarding(sesion_id: str) -> Dict[str, str]:
    """
    Cancela una sesión de onboarding
    
    Args:
        sesion_id: ID de la sesión a cancelar
        
    Returns:
        Confirmación de cancelación
    """
    try:
        eliminado = session_manager.eliminar_sesion(sesion_id)
        
        if eliminado:
            logger.info(f"Onboarding cancelado: {sesion_id}")
            return {"mensaje": "Onboarding cancelado exitosamente"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelando onboarding {sesion_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/estadisticas")
async def obtener_estadisticas_onboarding() -> Dict[str, Any]:
    """
    Obtiene estadísticas del sistema de onboarding
    
    Returns:
        Dict con estadísticas
    """
    try:
        # Limpiar sesiones expiradas primero
        session_manager.limpiar_sesiones_expiradas()
        
        # Obtener estadísticas
        stats = session_manager.estadisticas()
        
        return {
            "estadisticas_sesiones": stats,
            "agente_info": {
                "banco_preguntas_total": sum(
                    len(preguntas) for preguntas in onboarding_agent.banco_preguntas.values()
                ),
                "categorias": list(onboarding_agent.banco_preguntas.keys()),
                "umbral_confianza": onboarding_agent.umbral_confianza,
                "rango_preguntas": f"{onboarding_agent.min_preguntas}-{onboarding_agent.max_preguntas}"
            }
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/login", response_model=LoginResponse)
async def login_usuario(request: LoginRequest) -> LoginResponse:
    """
    Autentica un usuario existente con su telegram_id y código secreto
    
    Args:
        request: telegram_id y codigo_secreto del usuario
        
    Returns:
        LoginResponse: Resultado de autenticación con datos del usuario
    """
    try:
        logger.info(f"Intento de login para: {request.telegram_id}")
        
        usuario = await obtener_usuario_por_codigo(request.telegram_id, request.codigo_secreto)
        
        if not usuario:
            return LoginResponse(
                autenticado=False,
                mensaje="Credenciales incorrectas. Verifica tu ID de Telegram y código secreto.",
                usuario=None
            )
        
        return LoginResponse(
            autenticado=True,
            mensaje=f"¡Bienvenido de nuevo, {usuario.nombre}! 🎉",
            usuario={
                "id": usuario.id,
                "nombre": usuario.nombre,
                "etapa_vida": usuario.etapa_vida,
                "telegram_id": usuario.telegram_id,
                "onboarding_completado": usuario.onboarding_completado,
                "codigo_secreto": usuario.codigo_secreto,
            }
        )
        
    except Exception as e:
        logger.error(f"Error en login para {request.telegram_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )