"""
RITMO Telegram Bot - Bot principal de acompañamiento 
Bot de IA para colectivos vulnerables con integración al backend RITMO
"""

import asyncio
import logging
import sys
from datetime import datetime
from typing import Dict, Any, Optional

from telegram import Bot, Update
from telegram.ext import (
    Application, CommandHandler, MessageHandler, CallbackQueryHandler,
    filters, ContextTypes
)

from config import config
from models import UsuarioTelegram, EstadoUsuario
from handlers import (
    comando_start, comando_help, comando_perfil, comando_estado, comando_checkin_test,
    comando_debug_usuarios, comando_analisis_personal, comando_analisis_semanal, 
    comando_reporte_admin, procesar_mensaje_texto, procesar_mensaje_audio,
    procesar_mensaje_multimedia, procesar_callback_checkin, error_handler,
)
from database import DatabaseManager
from agents import RitmoOrchestrator
from checkin_system import CheckinSystem

# Configurar logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
)
logger = logging.getLogger(__name__)


class RitmoTelegramBot:
    """Bot principal de RITMO para Telegram"""
    
    def __init__(self):
        self.app: Application = None
        self.bot: Bot = None
        self.db_manager = DatabaseManager()
        self.orchestrator = RitmoOrchestrator(self.db_manager)
        self.checkin_system: CheckinSystem = None
        self.usuarios_en_memoria: Dict[int, UsuarioTelegram] = {}
        
    def inicializar(self):
        """Inicializa el bot y sus componentes"""
        
        # Validar configuración
        try:
            config.validate()
            logger.info("✅ Configuración validada")
        except ValueError as e:
            logger.error(f"❌ Error en configuración: {e}")
            sys.exit(1)
        
        # Inicializar aplicación de Telegram
        builder = Application.builder().token(config.TELEGRAM_BOT_TOKEN)
        self.app = builder.build()
        self.bot = self.app.bot
        
        # Inicializar sistema de check-in
        self.checkin_system = CheckinSystem(self.bot, self.db_manager)
        logger.info("✅ Sistema de check-in inicializado")
        
        # Configurar handlers
        self._configurar_handlers()
        
        # Pasar datos compartidos a handlers
        self.app.bot_data["db_manager"] = self.db_manager
        self.app.bot_data["checkin_system"] = self.checkin_system
        
        logger.info("✅ Bot inicializado correctamente")
    
    def _configurar_handlers(self):
        """Configura todos los handlers del bot"""
        
        # Comandos principales
        self.app.add_handler(CommandHandler("start", comando_start))
        self.app.add_handler(CommandHandler("help", comando_help))
        self.app.add_handler(CommandHandler("perfil", comando_perfil))
        self.app.add_handler(CommandHandler("estado", comando_estado))
        self.app.add_handler(CommandHandler("checkin_test", comando_checkin_test))        
        self.app.add_handler(CommandHandler("debug_usuarios", comando_debug_usuarios))
        
        # Comandos de análisis contextual
        self.app.add_handler(CommandHandler("analisis", comando_analisis_personal))
        self.app.add_handler(CommandHandler("analisis_14d", comando_analisis_semanal))
        self.app.add_handler(CommandHandler("reporte_admin", comando_reporte_admin))
        # Mensajes de texto libre
        self.app.add_handler(MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            procesar_mensaje_texto
        ))

        # Mensajes de audio / voz
        self.app.add_handler(MessageHandler(
            filters.VOICE | filters.AUDIO,
            procesar_mensaje_audio
        ))

        # Otros tipos de mensaje (fotos, stickers, documentos)
        self.app.add_handler(MessageHandler(
            filters.PHOTO | filters.Sticker.ALL | filters.Document.ALL,
            procesar_mensaje_multimedia
        ))

        # Callback queries (respuestas de botones inline)
        self.app.add_handler(CallbackQueryHandler(
            procesar_callback_checkin,
            pattern=r'^checkin_'
        ))

        # Error handler
        self.app.add_error_handler(error_handler)
        
        logger.info("✅ Handlers configurados")
    
    async def _obtener_usuario(self, telegram_id: int) -> Optional[UsuarioTelegram]:
        """Obtiene un usuario de memoria o búsqueda por telegram_id en BD"""

        # Buscar en memoria primero
        if telegram_id in self.usuarios_en_memoria:
            return self.usuarios_en_memoria[telegram_id]

        # Buscar en Supabase por telegram_id (ya vinculado previamente)
        usuario_db = await self.db_manager.buscar_usuario_por_telegram_id(telegram_id)

        if usuario_db:
            nombre = usuario_db.get("nombre", "Amigo")
            etapa = usuario_db.get("etapa_vida", "adulto_activo")
            modo = usuario_db.get("modo_comunicacion", "texto")
            zona = usuario_db.get("zona_horaria", "Europe/Madrid")

            from models import PerfilUsuario
            usuario = UsuarioTelegram(
                telegram_id=telegram_id,
                first_name=nombre,
                estado=EstadoUsuario.ACTIVO,
                configuracion_completada=True,
                perfil=PerfilUsuario(
                    nombre=nombre,
                    etapa=etapa,
                    modo_comunicacion=modo,
                    zona_horaria=zona,
                ),
                ultima_interaccion=datetime.utcnow(),
            )
            self.usuarios_en_memoria[telegram_id] = usuario
            logger.info(f"✅ Usuario reconocido desde BD: {nombre} ({telegram_id})")
            return usuario

        return None

    async def obtener_o_crear_usuario(self, telegram_user) -> UsuarioTelegram:
        """
        Obtiene un usuario ya vinculado o crea un objeto temporal
        en estado IDENTIFICANDO (NO crea nada en Supabase).
        """
        usuario = await self._obtener_usuario(telegram_user.id)

        if usuario:
            usuario.ultima_interaccion = datetime.utcnow()
            return usuario

        # Usuario desconocido → objeto temporal para pedir identificación
        usuario = UsuarioTelegram(
            telegram_id=telegram_user.id,
            username=telegram_user.username,
            first_name=telegram_user.first_name or "Amigo",
            last_name=telegram_user.last_name,
            estado=EstadoUsuario.IDENTIFICANDO,
            ultima_interaccion=datetime.utcnow(),
        )
        self.usuarios_en_memoria[telegram_user.id] = usuario
        logger.info(f"👤 Usuario nuevo en Telegram, pendiente de identificación: {telegram_user.id}")
        return usuario


    async def ejecutar(self):
        """Ejecuta el bot con scheduler de check-ins"""
        try:
            # Inicializar aplicación
            await self.app.initialize()
            
            # Iniciar scheduler en background
            if self.checkin_system:
                scheduler_task = asyncio.create_task(self.checkin_system.iniciar_scheduler())
                logger.info("🔔 Scheduler de check-ins iniciado")
            
            # Iniciar polling con configuración robusta
            await self.app.start()
            await self.app.updater.start_polling(
                poll_interval=2.0,
                timeout=20,
                drop_pending_updates=True,
                allowed_updates=['message', 'callback_query'],
                read_timeout=30,
                write_timeout=30,
                connect_timeout=30
            )
            
            logger.info("✅ Bot ejecutándose ... (Ctrl+C para detener)")
            
            # Mantener el bot corriendo
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("👋 Deteniendo bot...")
        finally:
            # Detener componentes
            if hasattr(self, 'checkin_system') and self.checkin_system:
                self.checkin_system.detener_scheduler()
            
            if self.app.updater.running:
                await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()


# Instancia global del bot
ritmo_bot = RitmoTelegramBot()


def main():
    """Función principal"""
    
    logger.info("🚀 Iniciando RITMO Telegram Bot")
    
    try:
        # Inicializar bot
        ritmo_bot.inicializar()
        
        logger.info("🟢 Bot iniciado correctamente")
        
        # Ejecutar bot con scheduler
        asyncio.run(ritmo_bot.ejecutar())
        
    except KeyboardInterrupt:
        logger.info("👋 Bot detenido por usuario")
    except Exception as e:
        logger.error(f"❌ Error ejecutando bot: {e}")
        raise
    finally:
        logger.info("🔴 Bot detenido completamente")


if __name__ == "__main__":
    main()