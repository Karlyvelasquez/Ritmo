"""
Handlers del bot RITMO — versión con arquitectura de agentes LLM.

Cada handler es una capa delgada que:
  1. Obtiene o crea el usuario en memoria/DB.
  2. Delega la lógica al RitmoOrchestrator (que decide qué agente actúa).
  3. Envía la respuesta al usuario en Telegram.
"""

import logging
import traceback
from datetime import datetime

from telegram import Update
from telegram.ext import ContextTypes
from telegram.constants import ParseMode

from models import UsuarioTelegram, EstadoUsuario
from motor_analisis import MotorAnalisisContextual, formatear_metricas_para_usuario, formatear_alertas_para_usuario
from generador_respuestas import generar_respuesta_analisis_adaptativa
from generador_respuestas import generar_respuesta_analisis_adaptativa

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

async def _get_user(update: Update) -> "UsuarioTelegram":
    """Obtiene o crea el usuario desde el bot global."""
    try:
        from bot import ritmo_bot
        return await ritmo_bot.obtener_o_crear_usuario(update.effective_user)
    except Exception as e:
        logger.error(f"Error obteniendo usuario: {e}")
        # Crear usuario básico como fallback
        telegram_user = update.effective_user
        return UsuarioTelegram(
            telegram_id=telegram_user.id,
            first_name=telegram_user.first_name or "Amigo",
            estado=EstadoUsuario.IDENTIFICANDO,
            ultima_interaccion=datetime.utcnow(),
        )


async def _send(update: Update, text: str, markdown: bool = False):
    """Envía un texto al usuario, con fallback si el Markdown falla."""
    try:
        await update.effective_message.reply_text(
            text,
            parse_mode=ParseMode.MARKDOWN if markdown else None,
        )
    except Exception:
        await update.effective_message.reply_text(text)


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

async def comando_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /start"""
    try:
        from bot import ritmo_bot
        usuario = await _get_user(update)
        
        if hasattr(ritmo_bot, 'orchestrator') and ritmo_bot.orchestrator:
            respuesta = await ritmo_bot.orchestrator.handle_start(usuario)
        else:
            nombre = usuario.first_name if usuario.first_name else "amigo"
            respuesta = (
                f"¡Hola {nombre}! 👋\n\n"
                "Soy RITMO, tu compañero de acompañamiento 💙\n\n"
                "Dime tu nombre, tal como te registraste en la app, "
                "para poder reconocerte 😊"
            )
        
        await _send(update, respuesta)
        
    except Exception as e:
        logger.error(f"Error en comando_start: {e}")
        await _send(update, "¡Hola! Soy RITMO, tu compañero de acompañamiento 💙")


async def comando_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /help"""
    try:
        from bot import ritmo_bot
        
        if hasattr(ritmo_bot, 'orchestrator') and ritmo_bot.orchestrator:
            respuesta = await ritmo_bot.orchestrator.handle_help()
        else:
            respuesta = (
                "🤖 *RITMO — Cómo funciono*\n\n"
                "Soy un asistente de acompañamiento personal. Puedes:\n\n"
                "• Contarme cómo te sientes\n"
                "• Pedir consejo o simplemente hablar\n"
                "• Usar los comandos:\n\n"
                "**Básicos:**\n"
                "  /start — Identificarte o reiniciar\n"
                "  /perfil — Ver tu perfil\n"
                "  /estado — Ver tu estado\n\n"
                "**Check-ins:**\n"
                "  /checkin_test — Probar check-in emocional 🧪\n\n"
                "**Análisis:**\n"
                "  /analisis — Tu análisis personal (7 días)\n"
                "  /analisis_14d — Análisis extendido (14 días)\n\n"
                "**Admin:**\n"
                "  /debug_usuarios — Ver usuarios en BD 🔍\n"
                "  /reporte_admin — Reporte masivo 📊\n\n"
                "💙 Estoy aquí para acompañarte sin juzgar"
            )
        
        await _send(update, respuesta, markdown=True)
        
    except Exception as e:
        logger.error(f"Error en comando_help: {e}")
        await _send(update, "Soy RITMO, tu compañero de acompañamiento 💙")


async def comando_perfil(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /perfil"""
    try:
        from bot import ritmo_bot
        usuario = await _get_user(update)
        
        if hasattr(ritmo_bot, 'orchestrator') and ritmo_bot.orchestrator:
            respuesta = await ritmo_bot.orchestrator.handle_perfil(usuario)
        else:
            respuesta = "🔧 Esta función estará disponible pronto. Por ahora puedes hablar conmigo libremente 💙"
        
        await _send(update, respuesta, markdown=True)
        
    except Exception as e:
        logger.error(f"Error en comando_perfil: {e}")
        await _send(update, "🔧 Esta función estará disponible pronto 💙")


async def comando_estado(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /estado"""
    try:
        from bot import ritmo_bot
        usuario = await _get_user(update)
        
        if hasattr(ritmo_bot, 'orchestrator') and ritmo_bot.orchestrator:
            respuesta = await ritmo_bot.orchestrator.handle_estado(usuario)
        else:
            respuesta = "📊 Esta función estará disponible pronto. ¿Cómo te sientes hoy? 💙"
        
        await _send(update, respuesta, markdown=True)
        
    except Exception as e:
        logger.error(f"Error en comando_estado: {e}")
        await _send(update, "📊 ¿Cómo te sientes hoy? 💙")


async def comando_debug_usuarios(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando para debug: mostrar usuarios en BD"""
    try:
        telegram_id = update.effective_user.id
        
        # Solo permitir a usuarios autorizados (o todos para testing)
        db_manager = context.bot_data["db_manager"]
        
        # Consultar usuarios en BD
        result = db_manager.client.table("usuarios").select("*").execute()
        
        if not result.data:
            await update.message.reply_text("❌ No hay usuarios en la BD")
            return
        
        mensaje = f"👥 **Usuarios en BD ({len(result.data)})**\\n\\n"
        
        for i, usuario in enumerate(result.data[:10], 1):  # Máximo 10 usuarios
            user_id = usuario.get("id", "N/A")
            nombre = usuario.get("nombre", "Sin nombre")
            telegram_id_db = usuario.get("telegram_id", "N/A")
            created = usuario.get("created_at", "N/A")[:10] if usuario.get("created_at") else "N/A"
            
            mensaje += f"{i}. **{nombre}**\\n"
            mensaje += f"   • ID: `{user_id}`\\n"
            mensaje += f"   • Telegram: `{telegram_id_db}`\\n"
            mensaje += f"   • Creado: {created}\\n\\n"
        
        if len(result.data) > 10:
            mensaje += f"... y {len(result.data) - 10} más\\n"
        
        await update.message.reply_text(mensaje, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error en comando_debug_usuarios: {e}")
        await update.message.reply_text(f"❌ Error: {str(e)}")


async def comando_checkin_test(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /checkin_test - Para probar el sistema de check-in manualmente"""
    try:
        from bot import ritmo_bot
        
        telegram_user = update.effective_user
        
        # Buscar usuario en BD
        user_db = await ritmo_bot.db_manager.buscar_usuario_por_telegram_id(telegram_user.id)
        
        if not user_db:
            await _send(update, "❌ No tienes perfil vinculado. Necesitas registrarte en la app primero.")
            return
        
        user_id = user_db.get("id")
        nombre = user_db.get("nombre", telegram_user.first_name)
        
        # Verificar si ya hizo check-in hoy 
        ya_hizo_checkin = await ritmo_bot.db_manager.verificar_checkin_hoy(user_id)
        
        if ya_hizo_checkin:
            await _send(update, f"✅ ¡Ya hiciste tu check-in hoy, {nombre}! Gracias 💙")
            return
        
        # Enviar check-in manual
        from telegram import InlineKeyboardButton, InlineKeyboardMarkup
        
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("😊 Bien", callback_data=f"checkin_bien_{user_id}"),
                InlineKeyboardButton("😐 Normal", callback_data=f"checkin_normal_{user_id}"),
                InlineKeyboardButton("😔 Difícil", callback_data=f"checkin_dificil_{user_id}")
            ]
        ])
        
        mensaje = f"Hola {nombre} 💙\n\n¿Cómo te sientes hoy?"
        
        await update.effective_message.reply_text(
            mensaje,
            reply_markup=keyboard
        )
        
        logger.info(f"✅ Check-in manual enviado a {nombre} ({telegram_user.id})")
        
    except Exception as e:
        logger.error(f"Error en comando_checkin_test: {e}")
        await _send(update, "❌ Error enviando check-in de prueba")


# ---------------------------------------------------------------------------
# Mensajes de texto
# ---------------------------------------------------------------------------

async def procesar_mensaje_texto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para cualquier mensaje de texto libre."""
    try:
        from bot import ritmo_bot

        usuario = await _get_user(update)
        text = update.message.text or ""

        if not text.strip():
            return

        logger.info(f"Procesando mensaje de {usuario.telegram_id}: {text[:50]}...")

        # Indicador "escribiendo..." mientras el LLM procesa
        await update.effective_chat.send_action("typing")

        # Verificar que el orquestador esté disponible
        if not hasattr(ritmo_bot, 'orchestrator') or ritmo_bot.orchestrator is None:
            logger.warning("Orquestador no disponible, usando respuesta básica")
            respuesta = _generar_respuesta_basica(text, usuario)
        else:
            try:
                respuesta = await ritmo_bot.orchestrator.process_message(usuario, text)
                if not respuesta:  # Si el orquestador retorna None (check-in enviado por separado)
                    return
            except Exception as orch_error:
                logger.error(f"Error en orquestador: {orch_error}")
                respuesta = _generar_respuesta_basica(text, usuario)

        await _send(update, respuesta)

    except Exception as e:
        logger.error(f"[Handler] Error procesando mensaje: {e}")
        await _send(
            update,
            "Disculpa, he tenido un problema técnico. Inténtalo de nuevo en un momento.",
        )


def _generar_respuesta_basica(text: str, usuario) -> str:
    """Genera una respuesta básica cuando el orquestador no está disponible"""
    text_lower = text.lower()
    nombre = usuario.first_name if usuario.first_name else "amigo"
    
    if any(palabra in text_lower for palabra in ["bien", "genial", "perfecto", "feliz"]):
        return f"¡Me alegra saber que estás bien, {nombre}! 😊✨"
    elif any(palabra in text_lower for palabra in ["mal", "triste", "difícil", "cansado"]):
        return f"Lo siento, sé que no es fácil 💙\nGracias por confiar en mí para contármelo, {nombre}"
    elif any(palabra in text_lower for palabra in ["hola", "hello", "hi", "buenos días", "buenas tardes"]):
        return f"¡Hola {nombre}! 👋💙\n¿Cómo te sientes hoy?"
    else:
        return f"Gracias por compartir eso conmigo, {nombre} 💙\n\nEstoy aquí para acompañarte."


# ---------------------------------------------------------------------------
# Mensajes de audio / voz
# ---------------------------------------------------------------------------

async def procesar_mensaje_audio(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para mensajes de voz o audio."""
    try:
        usuario = await _get_user(update)
        perfil = usuario.perfil

        if perfil and perfil.etapa == "discapacidad_visual":
            msg = (
                "He recibido tu mensaje de voz. "
                "De momento proceso mejor el texto; si puedes escribirlo te ayudaré mejor."
            )
        else:
            msg = (
                "He recibido tu audio. "
                "Por ahora respondo mejor a mensajes de texto. "
                "¿Puedes escribirme lo que quieres contarme?"
            )

        await _send(update, msg)
        
    except Exception as e:
        logger.error(f"Error en procesar_mensaje_audio: {e}")
        await _send(update, "He recibido tu audio 🎵\nPor ahora respondo mejor a mensajes de texto 💙")


# ---------------------------------------------------------------------------
# Mensajes multimedia
# ---------------------------------------------------------------------------

async def procesar_mensaje_multimedia(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para fotos, stickers y documentos."""
    try:
        msg = update.message
        if msg.photo:
            texto = "He recibido tu imagen. Si quieres comentarme algo sobre ella, escríbelo."
        elif msg.sticker:
            texto = "He recibido tu sticker 😊. ¿Cómo te sientes hoy?"
        elif msg.document:
            texto = "He recibido tu documento. Si necesitas hablar sobre algo, escríbeme."
        else:
            texto = "He recibido tu mensaje. ¿Hay algo en lo que pueda acompañarte?"

        await _send(update, texto)
        
    except Exception as e:
        logger.error(f"Error en procesar_mensaje_multimedia: {e}")
        await _send(update, "He recibido tu mensaje 💙. ¿Hay algo en lo que pueda acompañarte?")


# ---------------------------------------------------------------------------
# Callback queries (botones inline)
# ---------------------------------------------------------------------------

async def procesar_callback_checkin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para respuestas de check-in via callback queries."""
    try:
        query = update.callback_query
        await query.answer()  # Confirmar que recibimos el callback
        
        callback_data = query.data
        logger.info(f"📞 Callback recibido: {callback_data}")
        
        # Parsear callback: formato "checkin_{estado}_{user_id}"
        partes = callback_data.split("_")
        if len(partes) < 3 or partes[0] != "checkin":
            await query.edit_message_text("Error procesando respuesta.")
            return
        
        accion = partes[1]  # bien, normal, dificil, postpone
        user_id = partes[2]
        
        usuario = await _get_user(update)
        
        # Importar sistema de check-in
        from bot import ritmo_bot
        checkin_system = ritmo_bot.checkin_system
        
        if accion == "postpone":
            # Usuario pospone el check-in
            await query.edit_message_text(
                "Está bien, no hay prisa 💙\n"  
                "Puedes contarme cómo te sientes cuando quieras."
            )
            return
        
        # Procesar respuesta emocional
        if accion in ["bien", "normal", "dificil"]:
            resp_msg = await checkin_system.procesar_respuesta_checkin(
                user_id=user_id,
                telegram_id=usuario.telegram_id,
                estado_emocional=accion,
                metodo="proactivo" if callback_data.startswith("checkin") else "reactivo"
            )
            
            await query.edit_message_text(resp_msg)
            
            # Opcionalmente, continuar conversación según el estado
            if accion == "dificil":
                await context.bot.send_message(
                    chat_id=usuario.telegram_id,
                    text="¿Te gustaría contarme qué está siendo difícil hoy? Solo si quieres 💙"
                )
        
    except Exception as e:
        logger.error(f"Error procesando callback de check-in: {e}")
        try:
            await query.edit_message_text("Hubo un problema. ¿Puedes intentar de nuevo?")
        except:
            pass


# ---------------------------------------------------------------------------
# Comandos de análisis del motor contextual  
# ---------------------------------------------------------------------------

async def comando_analisis_personal(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /analisis - Muestra análisis personal del usuario"""
    try:
        telegram_id = update.effective_user.id
        db_manager = context.bot_data["db_manager"]
        
        # Buscar usuario en BD
        user_db = await db_manager.buscar_usuario_por_telegram_id(telegram_id)
        if not user_db:
            await update.message.reply_text(
                "❌ No estás registrado en el sistema.\n"
                "Usa /start para crear tu perfil primero."
            )
            return
        
        user_id = user_db["id"]
        nombre = user_db.get("nombre", "Usuario")
        
        # Crear motor de análisis
        motor = MotorAnalisisContextual(db_manager)
        
        await update.message.reply_text("🔍 Generando tu análisis personal...")
        
        # Realizar análisis de 7 días
        analisis = await motor.analizar_usuario_completo(user_id, 7)
        
        if "error" in analisis:
            await update.message.reply_text(f"❌ Error generando análisis: {analisis['error']}")
            return
        
        # Generar respuesta adaptativa completa
        try:
            # Respuesta adaptativa principal
            respuesta_adaptativa = generar_respuesta_analisis_adaptativa(
                user_id=user_id,
                nombre=nombre,
                metricas=analisis["metricas"],
                alertas=analisis["alertas"],
                ml_prediccion=analisis.get("ml_prediccion", {}),
                puntuacion_riesgo=analisis["puntuacion_riesgo"]
            )
            
            # Agregar detalles técnicos del análisis
            metricas = analisis["metricas"]
            ml_pred = analisis.get("ml_prediccion", {})
            
            mensaje = f"📊 **Análisis Personal - {nombre}**\n"
            mensaje += f"📅 Últimos 7 días\n\n"
            
            # Respuesta adaptativa personalizada
            mensaje += f"💙 **Reflexión personal:**\n{respuesta_adaptativa}\n\n"
            
            # Métricas técnicas
            mensaje += "📈 **Detalles del análisis:**\n"
            mensaje += formatear_metricas_para_usuario(metricas)
            
            # Predicción ML si está disponible
            if ml_pred and ml_pred.get("probabilidad") is not None:
                mensaje += f"\n🤖 *Predicción ML de riesgo:*\n"
                mensaje += f"• Probabilidad: {ml_pred['probabilidad']:.2f}\n"
                mensaje += f"• Categoría: {ml_pred['categoria']}\n"
        
        except Exception as e:
            logger.error(f"Error generando respuesta adaptativa en análisis: {e}")
            # Fallback a formato original
            metricas = analisis["metricas"]
            alertas = analisis["alertas"]
            recomendaciones = analisis["recomendaciones"]
            ml_pred = analisis.get("ml_prediccion", {})
            
            mensaje = f"📊 **Análisis Personal - {nombre}**\n"
            mensaje += f"📅 Últimos 7 días\n\n"
            mensaje += formatear_metricas_para_usuario(metricas)
            mensaje += "\n"
            mensaje += formatear_alertas_para_usuario(alertas)
            
            if recomendaciones:
                mensaje += "**💡 Recomendaciones:**\n"
                for rec in recomendaciones[:3]:
                    mensaje += f"• {rec}\n"
            
            if ml_pred and ml_pred.get("probabilidad") is not None:
                mensaje += (f"\n\n🤖 *Predicción ML:*\n"
                            f"• Probabilidad: {ml_pred['probabilidad']:.2f}\n"
                            f"• Categoría: {ml_pred['categoria']}")
        
        await update.message.reply_text(mensaje, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error en comando_analisis_personal: {e}")
        await update.message.reply_text("❌ Error generando tu análisis. Inténtalo más tarde.")


async def comando_analisis_semanal(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /analisis_14d - Análisis de 14 días"""
    try:
        telegram_id = update.effective_user.id
        db_manager = context.bot_data["db_manager"]
        
        # Buscar usuario en BD
        user_db = await db_manager.buscar_usuario_por_telegram_id(telegram_id)
        if not user_db:
            await update.message.reply_text("❌ No estás registrado. Usa /start primero.")
            return
        
        user_id = user_db["id"]
        nombre = user_db.get("nombre", "Usuario")
        
        # Crear motor de análisis
        motor = MotorAnalisisContextual(db_manager)
        
        await update.message.reply_text("🔍 Generando análisis de 14 días...")
        
        # Realizar análisis de 14 días
        analisis = await motor.analizar_usuario_completo(user_id, 14)
        
        if "error" in analisis:
            await update.message.reply_text(f"❌ Error: {analisis['error']}")
            return
        
        # Respuesta condensada para período largo
        metricas = analisis["metricas"]
        resumen = analisis["resumen"]
        riesgo = analisis["puntuacion_riesgo"]
        ml_pred = analisis.get("ml_prediccion", {})
        
        mensaje = f"📈 **Análisis 14 días - {nombre}**\n\n"
        mensaje += f"📋 **Resumen:** {resumen}\n\n"
        
        mensaje += f"📊 **Métricas:**\n"
        mensaje += f"• Check-ins: {metricas.total_checkins}/14 ({metricas.cumplimiento_porcentaje:.0f}%)\n"
        mensaje += f"• Días positivos: {metricas.dias_bien}\n"
        mensaje += f"• Días difíciles: {metricas.dias_dificil}\n"
        mensaje += f"• Tendencia: {metricas.tendencia}\n\n"
        
        if riesgo["categoria"] != "MINIMO":
            mensaje += f"🎯 **Nivel atención:** {riesgo['categoria']}\n\n"
        
        # Predicción ML
        if ml_pred and ml_pred.get("probabilidad") is not None:
            mensaje += (f"🤖 *Predicción ML de riesgo de abandono:*\n"
                        f"• Probabilidad: {ml_pred['probabilidad']:.2f}\n"
                        f"• Categoría: {ml_pred['categoria']}\n\n")
        
        # Solo alertas críticas para vista de 14 días
        alertas_criticas = [a for a in analisis["alertas"] if a.nivel.value == "critico"]
        if alertas_criticas:
            mensaje += "🚨 **Alertas críticas:**\n"
            for alerta in alertas_criticas[:2]:
                mensaje += f"• {alerta.mensaje}\n"
        
        await update.message.reply_text(mensaje, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error en comando_analisis_semanal: {e}")
        await update.message.reply_text("❌ Error en análisis de 14 días.")


async def comando_reporte_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /reporte_admin - Reporte masivo para administradores"""
    try:
        telegram_id = update.effective_user.id
        
        # Lista de administradores (puedes configurar esto desde config o BD)
        ADMIN_IDS = [8519120077]  # Agregar más IDs de admin según sea necesario
        
        if telegram_id not in ADMIN_IDS:
            await update.message.reply_text("❌ Comando solo disponible para administradores.")
            return
        
        db_manager = context.bot_data["db_manager"]
        motor = MotorAnalisisContextual(db_manager)
        
        await update.message.reply_text("📊 Generando reporte masivo...")
        
        # Generar reporte de todos los usuarios
        reporte = await motor.generar_reporte_masivo(7)
        
        if "error" in reporte:
            await update.message.reply_text(f"❌ Error generando reporte: {reporte['error']}")
            return
        
        # Formatear reporte para admin
        alertas = reporte["alertas_globales"]
        
        mensaje = f"📋 **Reporte Administrativo**\n"
        mensaje += f"📅 Período: {reporte['periodo_dias']} días\n"
        mensaje += f"👥 Usuarios analizados: {reporte['total_usuarios_analizados']}\n\n"
        
        mensaje += f"🚨 **Alertas Globales:**\n"
        mensaje += f"• Críticas: {alertas['criticas']}\n"
        mensaje += f"• Preocupantes: {alertas['preocupantes']}\n" 
        mensaje += f"• Atención: {alertas['atencion']}\n\n"
        
        mensaje += f"📊 **Estadísticas:**\n"
        mensaje += f"• Cumplimiento promedio: {reporte['cumplimiento_promedio']:.1f}%\n"
        mensaje += f"• Usuarios con alertas críticas: {reporte['usuarios_con_alertas_criticas']}\n\n"
        
        # Usuarios con alertas críticas
        usuarios_criticos = []
        for reporte_individual in reporte["reportes_individuales"]:
            alertas_criticas = [a for a in reporte_individual.get("alertas", []) 
                              if a.nivel.value == "critico"]
            if alertas_criticas:
                nombre = reporte_individual.get("nombre", "Usuario")
                usuarios_criticos.append(f"• {nombre}: {len(alertas_criticas)} alerta(s)")
        
        if usuarios_criticos:
            mensaje += "⚠️ **Usuarios que requieren atención:**\n"
            for usuario in usuarios_criticos[:5]:  # Máximo 5 para no abrumar
                mensaje += f"{usuario}\n"
            
            if len(usuarios_criticos) > 5:
                mensaje += f"... y {len(usuarios_criticos) - 5} más\n"
        
        await update.message.reply_text(mensaje, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error en comando_reporte_admin: {e}")
        await update.message.reply_text("❌ Error generando reporte administrativo.")


# ---------------------------------------------------------------------------
# Error handler global
# ---------------------------------------------------------------------------

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handler global de errores no capturados."""
    logger.error("Excepción no capturada en handler:", exc_info=context.error)

    if update and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "Disculpa, ha ocurrido un error inesperado. Inténtalo de nuevo."
            )
        except Exception:
            pass

    tb = "".join(traceback.format_exception(None, context.error, context.error.__traceback__))
    logger.error(f"Traceback completo:\n{tb}")

