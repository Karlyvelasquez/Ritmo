"""
Handlers del bot RITMO â€” versiÃ³n con arquitectura de agentes LLM.

Cada handler es una capa delgada que:
  1. Obtiene o crea el usuario en memoria/DB.
  2. Delega la lÃ³gica al RitmoOrchestrator (que decide quÃ© agente actÃºa).
  3. EnvÃ­a la respuesta al usuario en Telegram.
"""

import logging
import traceback
from datetime import datetime

from telegram import Update
from telegram.ext import ContextTypes
from telegram.constants import ParseMode

from models import UsuarioTelegram, EstadoUsuario

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

async def _get_user(update: Update) -> "UsuarioTelegram":
    """Obtiene o crea el usuario desde el bot global."""
    from bot import ritmo_bot
    return await ritmo_bot.obtener_o_crear_usuario(update.effective_user)


async def _send(update: Update, text: str, markdown: bool = False):
    """EnvÃ­a un texto al usuario, con fallback si el Markdown falla."""
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
    from bot import ritmo_bot
    usuario = await _get_user(update)
    respuesta = await ritmo_bot.orchestrator.handle_start(usuario)
    await _send(update, respuesta)


async def comando_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /help"""
    from bot import ritmo_bot
    respuesta = await ritmo_bot.orchestrator.handle_help()
    await _send(update, respuesta, markdown=True)


async def comando_perfil(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /perfil"""
    from bot import ritmo_bot
    usuario = await _get_user(update)
    respuesta = await ritmo_bot.orchestrator.handle_perfil(usuario)
    await _send(update, respuesta, markdown=True)


async def comando_estado(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para /estado"""
    from bot import ritmo_bot
    usuario = await _get_user(update)
    respuesta = await ritmo_bot.orchestrator.handle_estado(usuario)
    await _send(update, respuesta, markdown=True)


# ---------------------------------------------------------------------------
# Mensajes de texto
# ---------------------------------------------------------------------------

async def procesar_mensaje_texto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para cualquier mensaje de texto libre."""
    from bot import ritmo_bot

    usuario = await _get_user(update)
    text = update.message.text or ""

    if not text.strip():
        return

    # Indicador "escribiendo..." mientras el LLM procesa
    await update.effective_chat.send_action("typing")

    try:
        respuesta = await ritmo_bot.orchestrator.process_message(usuario, text)
        await _send(update, respuesta)

    except Exception as e:
        logger.error(f"[Handler] Error procesando mensaje: {e}")
        await _send(
            update,
            "Disculpa, he tenido un problema tÃ©cnico. IntÃ©ntalo de nuevo en un momento.",
        )


# ---------------------------------------------------------------------------
# Mensajes de audio / voz
# ---------------------------------------------------------------------------

async def procesar_mensaje_audio(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para mensajes de voz o audio."""
    usuario = await _get_user(update)
    perfil = usuario.perfil

    if perfil and perfil.etapa == "discapacidad_visual":
        msg = (
            "He recibido tu mensaje de voz. "
            "De momento proceso mejor el texto; si puedes escribirlo te ayudarÃ© mejor."
        )
    else:
        msg = (
            "He recibido tu audio. "
            "Por ahora respondo mejor a mensajes de texto. "
            "Â¿Puedes escribirme lo que quieres contarme?"
        )

    await _send(update, msg)


# ---------------------------------------------------------------------------
# Mensajes multimedia
# ---------------------------------------------------------------------------

async def procesar_mensaje_multimedia(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler para fotos, stickers y documentos."""
    msg = update.message
    if msg.photo:
        texto = "He recibido tu imagen. Si quieres comentarme algo sobre ella, escrÃ­belo."
    elif msg.sticker:
        texto = "He recibido tu sticker ðŸ˜Š. Â¿CÃ³mo te sientes hoy?"
    elif msg.document:
        texto = "He recibido tu documento. Si necesitas hablar sobre algo, escrÃ­beme."
    else:
        texto = "He recibido tu mensaje. Â¿Hay algo en lo que pueda acompaÃ±arte?"

    await _send(update, texto)


# ---------------------------------------------------------------------------
# Error handler global
# ---------------------------------------------------------------------------

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handler global de errores no capturados."""
    logger.error("ExcepciÃ³n no capturada en handler:", exc_info=context.error)

    if update and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "Disculpa, ha ocurrido un error inesperado. IntÃ©ntalo de nuevo."
            )
        except Exception:
            pass

    tb = "".join(traceback.format_exception(None, context.error, context.error.__traceback__))
    logger.error(f"Traceback completo:\n{tb}")

