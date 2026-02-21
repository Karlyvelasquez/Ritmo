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
    Application, CommandHandler, MessageHandler, 
    filters, ContextTypes
)

from config import config
from models import UsuarioTelegram, EstadoUsuario
from handlers import (
    comando_start, comando_help, comando_perfil, comando_estado,
    procesar_mensaje_texto, procesar_mensaje_audio,
    procesar_mensaje_multimedia, error_handler,
)
from database import DatabaseManager
from agents import RitmoOrchestrator
from utils import backend_client

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
        self.usuarios_en_memoria: Dict[int, UsuarioTelegram] = {}
        
    async def inicializar(self):
        """Inicializa el bot y sus componentes"""
        
        # Validar configuración
        try:
            config.validate()
            logger.info("✅ Configuración validada")
        except ValueError as e:
            logger.error(f"❌ Error en configuración: {e}")
            sys.exit(1)
        
        # Verificar conexión con backend
        if await backend_client.health_check():
            logger.info("✅ Backend RITMO disponible")
        else:
            logger.warning("⚠️ Backend RITMO no disponible, continuando...")
        
        # Inicializar aplicación de Telegram
        builder = Application.builder().token(config.TELEGRAM_BOT_TOKEN)
        self.app = builder.build()
        self.bot = self.app.bot
        
        # Configurar handlers
        self._configurar_handlers()
        
        # Verificar conexión con Telegram
        try:
            bot_info = await self.bot.get_me()
            logger.info(f"✅ Bot conectado: @{bot_info.username}")
        except Exception as e:
            logger.error(f"❌ Error al conectar con Telegram: {e}")
            sys.exit(1)
    
    def _configurar_handlers(self):
        """Configura todos los handlers del bot"""
        
        # Comandos principales
        self.app.add_handler(CommandHandler("start", comando_start))
        self.app.add_handler(CommandHandler("help", comando_help))
        self.app.add_handler(CommandHandler("perfil", comando_perfil))
        self.app.add_handler(CommandHandler("estado", comando_estado))

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
    
    async def ejecutar_polling(self):
        """Ejecuta el bot en modo polling"""
        
        logger.info("🚀 Iniciando RITMO Telegram Bot en modo polling...")
        logger.info(f"📡 Conectando a: {config.RITMO_BACKEND_URL}")
        
        try:
            # Ejecutar polling
            await self.app.run_polling(
                poll_interval=1.0,
                drop_pending_updates=True,
                allowed_updates=['message', 'callback_query'],
                close_loop=False
            )
        except Exception as e:
            logger.error(f"Error en polling: {e}")
        finally:
            # Cleanup manual
            try:
                await self.app.stop()
            except:
                pass
    
    async def ejecutar_webhook(self, webhook_url: str, port: int = 8443):
        """Ejecuta el bot en modo webhook"""
        
        logger.info(f"🚀 Iniciando RITMO Telegram Bot en modo webhook...")
        logger.info(f"🌐 URL: {webhook_url}")
        
        # Configurar webhook
        await self.app.run_webhook(
            listen="0.0.0.0",
            port=port,
            webhook_url=webhook_url,
            drop_pending_updates=True
        )


# Instancia global del bot
ritmo_bot = RitmoTelegramBot()


async def main():
    """Función principal"""
    
    try:
        # Inicializar bot
        await ritmo_bot.inicializar()
        
        # Ejecutar según configuración
        if config.WEBHOOK_URL:
            await ritmo_bot.ejecutar_webhook(
                config.WEBHOOK_URL, 
                config.WEBHOOK_PORT
            )
        else:
            await ritmo_bot.ejecutar_polling()
            
    except KeyboardInterrupt:
        logger.info("👋 Deteniendo RITMO Telegram Bot...")
    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        raise
    finally:
        # Cleanup asíncrono
        try:
            if ritmo_bot.app:
                if not ritmo_bot.app.running:
                    await ritmo_bot.app.initialize()
                await ritmo_bot.app.stop()
                await ritmo_bot.app.shutdown()
        except:
            pass


if __name__ == "__main__":
    # Manejar loop de eventos en Windows
    if sys.platform.startswith('win'):
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    # Ejecutar bot
    asyncio.run(main())