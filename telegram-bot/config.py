"""
Configuración del bot de Telegram RITMO
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv

# Configurar logger para debug temprano
logger = logging.getLogger(__name__)

# Cargar variables de entorno (override=False para priorizar env vars del sistema)
# No falla si no hay archivo .env en producción
dotenv_loaded = load_dotenv(override=False)
logger.info(f"🔧 Dotenv cargado desde archivo: {dotenv_loaded}")


class Config:
    """Configuración centralizada del bot"""

    # ===========================================
    # OPENAI CONFIGURATION
    # ===========================================
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    # Modelo a usar: "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", etc.
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Telegram Bot Token (compatible con BOT_TOKEN y TELEGRAM_BOT_TOKEN)
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN", "")
    
    # RITMO Backend Configuration
    RITMO_BACKEND_URL: str = os.getenv("RITMO_BACKEND_URL", "http://127.0.0.1:8001")
    RITMO_BACKEND_TIMEOUT: int = int(os.getenv("RITMO_BACKEND_TIMEOUT", "30"))
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Bot Configuration
    BOT_USERNAME: str = os.getenv("BOT_USERNAME", "ritmo_acompanamiento_bot")
    MAX_MESSAGE_LENGTH: int = int(os.getenv("MAX_MESSAGE_LENGTH", "4000"))
    SESSION_TIMEOUT_HOURS: int = int(os.getenv("SESSION_TIMEOUT_HOURS", "24"))
    
    # Horarios para recomendaciones (UTC)
    HORARIO_RUTINA_MANANA: tuple = (8, 12)  # 8:00 - 12:00
    HORARIO_RUTINA_TARDE: tuple = (16, 19)  # 16:00 - 19:00
    HORARIO_SILENCIO_NOCHE: tuple = (22, 6)  # 22:00 - 06:00
    HORARIO_SILENCIO_SIESTA: tuple = (13.5, 15.5)  # 13:30 - 15:30
    
    # Configuración de logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Webhook configuration (optional)
    WEBHOOK_URL: Optional[str] = os.getenv("WEBHOOK_URL")
    WEBHOOK_PORT: int = int(os.getenv("WEBHOOK_PORT", "8443"))
    
    @classmethod
    def validate(cls) -> bool:
        """Validar que las configuraciones requeridas estén presentes"""
        required_vars = [
            cls.TELEGRAM_BOT_TOKEN,
            cls.OPENAI_API_KEY,
            cls.SUPABASE_URL,
            cls.SUPABASE_KEY,
        ]
        
        missing = [var for var in required_vars if not var]
        
        if missing:
            raise ValueError(f"Variables de entorno requeridas faltantes: {missing}")
        
        return True
    
    @classmethod
    def is_hora_rutina(cls, hora: int) -> bool:
        """Verifica si la hora está en horario de rutina"""
        return (cls.HORARIO_RUTINA_MANANA[0] <= hora < cls.HORARIO_RUTINA_MANANA[1] or
                cls.HORARIO_RUTINA_TARDE[0] <= hora < cls.HORARIO_RUTINA_TARDE[1])
    
    @classmethod
    def is_hora_silencio(cls, hora: float) -> bool:
        """Verifica si la hora está en horario de silencio"""
        # Horario nocturno (22:00 - 06:00)
        if cls.HORARIO_SILENCIO_NOCHE[0] <= hora or hora < cls.HORARIO_SILENCIO_NOCHE[1]:
            return True
        # Horario siesta (13:30 - 15:30) 
        if cls.HORARIO_SILENCIO_SIESTA[0] <= hora < cls.HORARIO_SILENCIO_SIESTA[1]:
            return True
        return False


# Instancia global de configuración
config = Config()

# Debug de configuración al cargar el módulo
def debug_config():
    """Debug de variables de configuración críticas"""
    logger.info("🔍 === DEBUG CONFIGURACIÓN ===")
    logger.info(f"SUPABASE_URL: {'✅ CONFIGURADO' if config.SUPABASE_URL else '❌ VACÍO'}")
    logger.info(f"SUPABASE_KEY: {'✅ CONFIGURADO' if config.SUPABASE_KEY else '❌ VACÍO'}")
    logger.info(f"TELEGRAM_BOT_TOKEN: {'✅ CONFIGURADO' if config.TELEGRAM_BOT_TOKEN else '❌ VACÍO'}")
    logger.info(f"OPENAI_API_KEY: {'✅ CONFIGURADO' if config.OPENAI_API_KEY else '❌ VACÍO'}")
    
    if config.SUPABASE_URL:
        logger.info(f"SUPABASE_URL preview: {config.SUPABASE_URL[:30]}...")
    if config.SUPABASE_KEY:
        logger.info(f"SUPABASE_KEY preview: {config.SUPABASE_KEY[:30]}...")
    logger.info("🔍 === FIN DEBUG ===")

# Ejecutar debug al cargar el módulo
debug_config()