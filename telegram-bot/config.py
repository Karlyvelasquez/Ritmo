"""
Configuración del bot de Telegram RITMO
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Cargar variables de entorno (override=True para que .env tenga prioridad)
load_dotenv(override=True)


class Config:
    """Configuración centralizada del bot"""

    # ===========================================
    # OPENAI CONFIGURATION
    # ===========================================
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    # Modelo a usar: "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", etc.
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Telegram Bot Token
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    
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