"""
Orquestador RITMO: punto de entrada único para todas las interacciones.

Flujo:
  1. Usuario nuevo en Telegram → se le pide su nombre (como se registró en la app).
  2. Se busca en Supabase por nombre.
     - Encontrado → vincula telegram_id, saluda cálidamente, pasa a modo compañero.
     - No encontrado → le invita a registrarse en la app.
  3. Usuario ya vinculado → modo compañero directamente.
"""

import logging
from typing import Optional, Dict, Any

from models import UsuarioTelegram, EstadoUsuario, PerfilUsuario
from utils import backend_client
from database import DatabaseManager

from .memory_agent import MemoryAgent
from .companion_agent import CompanionAgent

logger = logging.getLogger(__name__)


class RitmoOrchestrator:
    """
    Orquestador principal del bot RITMO.
    No crea usuarios; solo identifica usuarios ya registrados en la app.
    """

    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.memory = MemoryAgent()
        self.companion = CompanionAgent(self.memory)

    # ------------------------------------------------------------------ #
    #  Método principal: procesar cualquier mensaje de texto               #
    # ------------------------------------------------------------------ #

    async def process_message(
        self,
        usuario: UsuarioTelegram,
        text: str,
    ) -> str:
        """
        Punto de entrada para todos los mensajes de texto.
        """
        # ── Usuario no identificado → interpretar texto como su nombre ──
        if usuario.estado == EstadoUsuario.IDENTIFICANDO:
            return await self._intentar_identificar(usuario, text.strip())

        # ── Usuario activo (ya vinculado) → modo compañero ──────────────
        if usuario.estado == EstadoUsuario.ACTIVO:
            # Verificar si necesita check-in reactivo  
            user_db = await self.db.buscar_usuario_por_telegram_id(usuario.telegram_id)
            if user_db:
                user_id = user_db.get("id")
                
                # Importar y verificar check-in (evitar import circular)
                from bot import ritmo_bot
                if hasattr(ritmo_bot, 'checkin_system') and ritmo_bot.checkin_system is not None:
                    # Ofrecer check-in reactivo si no lo ha hecho hoy
                    checkin_msg = await ritmo_bot.checkin_system.ofrecer_checkin_reactivo(
                        usuario.telegram_id, user_id
                    )
                    # Si se ofreció check-in, no continuar con respuesta normal
                    if checkin_msg:
                        return None  # El check-in ya se envió por separado
            
            # Respuesta normal del compañero
            perfil_dict = usuario.perfil.dict() if usuario.perfil else None
            ritmo_ctx = await self._fetch_ritmo_context(usuario)

            return await self.companion.respond(
                user_id=usuario.telegram_id,
                user_message=text,
                perfil=perfil_dict,
                ritmo_context=ritmo_ctx,
            )

        # ── Cualquier otro estado → pedir identificación ────────────────
        return self._pedir_nombre()

    # ------------------------------------------------------------------ #
    #  Identificación por nombre                                           #
    # ------------------------------------------------------------------ #

    async def _intentar_identificar(self, usuario: UsuarioTelegram, nombre: str) -> str:
        """Busca al usuario por nombre en la BD y lo vincula si existe."""
        if not nombre:
            return self._pedir_nombre()

        usuario_db = await self.db.buscar_usuario_por_nombre(nombre)

        if usuario_db:
            # ¡Lo encontramos! Vincular telegram_id
            db_id = usuario_db.get("id")
            await self.db.vincular_telegram(db_id, usuario.telegram_id)

            # Construir perfil desde la BD
            nombre_real = usuario_db.get("nombre", nombre)
            etapa = usuario_db.get("etapa_vida", "adulto_activo")
            modo = usuario_db.get("modo_comunicacion", "texto")
            zona = usuario_db.get("zona_horaria", "Europe/Madrid")

            usuario.perfil = PerfilUsuario(
                nombre=nombre_real,
                etapa=etapa,
                modo_comunicacion=modo,
                zona_horaria=zona,
            )
            usuario.estado = EstadoUsuario.ACTIVO
            usuario.configuracion_completada = True

            # Registrar usuario en sistema de check-ins
            try:
                from bot import ritmo_bot
                if hasattr(ritmo_bot, 'checkin_system'):
                    ritmo_bot.checkin_system.registrar_usuario_activo(usuario)
            except Exception as e:
                logger.warning(f"No se pudo registrar usuario en check-ins: {e}")

            logger.info(f"✅ Usuario identificado: {nombre_real} (TG: {usuario.telegram_id})")

            return (
                f"¡Holaaaaa {nombre_real}! 🎉\n\n"
                "¡Ya te conozco! Me alegra mucho verte por aquí.\n"
                "Seamos cercanos 💙 cuéntame, ¿cómo estás hoy?"
            )

        # No encontrado → invitar a registrarse
        return (
            f"Lo siento, no encontré a nadie con el nombre \"{nombre}\" 😔\n\n"
            "Quisiera conocerte, pero primero necesito que te registres "
            "en la app de RITMO.\n\n"
            "Una vez que estés registrado, vuelve aquí y dime tu nombre 💙"
        )

    @staticmethod
    def _pedir_nombre() -> str:
        return (
            "¡Hola! Soy RITMO, tu compañero de acompañamiento 💙\n\n"
            "Dime tu nombre, tal como te registraste en la app, "
            "para poder reconocerte 😊"
        )

    # ------------------------------------------------------------------ #
    #  Comandos                                                            #
    # ------------------------------------------------------------------ #

    async def handle_start(self, usuario: UsuarioTelegram) -> str:
        """Respuesta al comando /start."""
        if usuario.estado == EstadoUsuario.ACTIVO and usuario.perfil:
            nombre = usuario.perfil.nombre
            return (
                f"¡Hola de nuevo, {nombre}! 👋\n\n"
                "Estoy aquí para acompañarte. ¿Cómo te encuentras hoy?"
            )

        # Poner en modo identificación
        usuario.estado = EstadoUsuario.IDENTIFICANDO
        self.memory.clear(usuario.telegram_id)
        return self._pedir_nombre()

    async def handle_help(self) -> str:
        """Respuesta al comando /help."""
        return (
            "🤖 *RITMO — Cómo funciono*\n\n"
            "Soy un asistente de acompañamiento personal. Puedes:\n\n"
            "• Contarme cómo te sientes\n"
            "• Pedir consejo o simplemente hablar\n"
            "• Usar los comandos:\n"
            "  /start — Identificarte o reiniciar\n"
            "  /perfil — Ver tu perfil\n"
            "  /estado — Ver tu estado\n"
            "  /help — Esta ayuda\n\n"
            "🔒 Tus conversaciones son privadas y confidenciales."
        )

    async def handle_perfil(self, usuario: UsuarioTelegram) -> str:
        """Respuesta al comando /perfil."""
        if not usuario.perfil:
            return (
                "Aún no sé quién eres 😊\n"
                "Escribe /start y dime tu nombre para reconocerte."
            )
        p = usuario.perfil
        etapa_labels = {
            "mayor_70": "Mayor de 70 años",
            "adulto_activo": "Adulto activo",
            "joven": "Joven",
            "migrante": "Persona migrante",
            "discapacidad_visual": "Persona con discapacidad visual",
        }
        modo_labels = {
            "texto": "Texto",
            "audio": "Audio",
            "mixto": "Mixto (texto y audio)",
        }
        return (
            f"👤 *Tu perfil en RITMO*\n\n"
            f"• Nombre: {p.nombre}\n"
            f"• Etapa: {etapa_labels.get(p.etapa, p.etapa)}\n"
            f"• Comunicación: {modo_labels.get(p.modo_comunicacion, p.modo_comunicacion)}\n"
            f"• Zona horaria: {p.zona_horaria}\n"
        )

    async def handle_estado(self, usuario: UsuarioTelegram) -> str:
        """Respuesta al comando /estado."""
        if usuario.estado == EstadoUsuario.ACTIVO:
            return (
                "✅ *Estado: Activo*\n\n"
                "Estoy aquí y disponible para acompañarte. "
                "Puedes escribirme cuando quieras."
            )
        return (
            "Aún no te has identificado.\n"
            "Escribe /start y dime tu nombre como te registraste en la app."
        )

    # ------------------------------------------------------------------ #
    #  Helpers                                                              #
    # ------------------------------------------------------------------ #

    async def _fetch_ritmo_context(self, usuario: UsuarioTelegram) -> Optional[Dict[str, Any]]:
        """Intenta obtener contexto del backend RITMO."""
        if not usuario.perfil:
            return None
        try:
            from models import SenalesWeb
            from datetime import datetime
            import pytz

            tz = pytz.timezone(usuario.perfil.zona_horaria)
            hora_local = datetime.now(tz)

            senales = SenalesWeb(
                hora_acceso=hora_local.strftime("%H:%M"),
                dia_semana=hora_local.strftime("%A"),
                es_madrugada=hora_local.hour < 6,
                frecuencia_accesos_hoy=1,
                duracion_sesion_anterior_seg=0,
                tiempo_respuesta_usuario_seg=0,
                dias_sin_registrar=0,
            )

            return await backend_client.analizar_contexto(
                usuario.perfil.dict(),
                senales.dict(),
            )
        except Exception as e:
            logger.debug(f"[Orchestrator] Backend RITMO no disponible: {e}")
            return None
