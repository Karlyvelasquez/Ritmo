#!/usr/bin/env python3
"""
Script de inicio para el bot de Telegram RITMO
Ejecuta el bot con configuración automática
"""

import os
import sys
import logging
from pathlib import Path

# Agregar directorio padre al PYTHONPATH
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config import config


def verificar_configuracion():
    """Verifica que la configuración esté correcta antes de iniciar"""
    
    print("🔧 Verificando configuración del bot RITMO...")
    
    # Verificar archivo .env
    env_file = project_root / ".env"
    if not env_file.exists():
        print("❌ Archivo .env no encontrado")
        print("💡 Copia el archivo .env.template a .env y completa las variables")
        template_file = project_root / ".env.template"
        if template_file.exists():
            print(f"📄 Template disponible en: {template_file}")
        return False
    
    # Verificar variables críticas
    variables_criticas = [
        "TELEGRAM_BOT_TOKEN",
        "OPENAI_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_KEY"
    ]
    
    missing_vars = []
    for var in variables_criticas:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Variables de entorno faltantes: {', '.join(missing_vars)}")
        print("💡 Completa estas variables en tu archivo .env")
        return False
    
    print("✅ Configuración válida")
    return True


def mostrar_info_bot():
    """Muestra información del bot antes de iniciar"""
    
    print("\n" + "="*50)
    print("🤖 RITMO Telegram Bot")
    print("IA de Acompañamiento para Colectivos Vulnerables")
    print("="*50)
    print(f"📡 Backend RITMO: {config.RITMO_BACKEND_URL}")
    print(f"🗄️ Supabase: {config.SUPABASE_URL[:50]}...")
    print(f"🔧 Modo: {'Webhook' if config.WEBHOOK_URL else 'Polling'}")
    print(f"📝 Log Level: {config.LOG_LEVEL}")
    print("="*50 + "\n")


def main_launcher():
    """Función principal del launcher"""
    
    # Mostrar información
    mostrar_info_bot()
    
    # Verificar configuración
    if not verificar_configuracion():
        sys.exit(1)
    
    print("🚀 Iniciando bot...\n")
    
    try:
        # Crear aplicación directamente
        from telegram.ext import Application, CommandHandler, MessageHandler, filters
        
        application = Application.builder().token(config.TELEGRAM_BOT_TOKEN).build()
        
        # Importar handlers uno por uno para evitar dependencias complejas
        try:
            from handlers import comando_start, comando_help, comando_perfil, comando_estado
            print("✅ Comandos básicos importados")
        except ImportError as e:
            print(f"⚠️ Error importando comandos: {e}")
            # Funciones básicas fallback
            async def comando_start(update, context):
                await update.message.reply_text("🤖 ¡Hola! Soy RITMO Bot.")
            
            async def comando_help(update, context):
                await update.message.reply_text("ℹ️ Bot RITMO - IA de Acompañamiento")
        
        # Configurar handlers básicos
        application.add_handler(CommandHandler("start", comando_start))
        application.add_handler(CommandHandler("help", comando_help))
        
        try:
            application.add_handler(CommandHandler("perfil", comando_perfil)) 
            application.add_handler(CommandHandler("estado", comando_estado))
        except:
            pass
        
        # Agregar handlers opcionales si existen
        try:
            from handlers import (
                procesar_mensaje_texto, procesar_mensaje_audio, 
                procesar_mensaje_multimedia, error_handler
            )
            application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, procesar_mensaje_texto))
            application.add_handler(MessageHandler(filters.VOICE | filters.AUDIO, procesar_mensaje_audio))
            application.add_handler(MessageHandler(filters.PHOTO | filters.Sticker.ALL | filters.Document.ALL, procesar_mensaje_multimedia))
            application.add_error_handler(error_handler)
            print("✅ Handlers avanzados configurados")
        except ImportError as e:
            print(f"⚠️ Handlers avanzados no disponibles: {e}")
            print("✅ Bot funcionará con comandos básicos")
        
        print("🚀 Iniciando RITMO Telegram Bot...")
        print(f"📡 Backend: {config.RITMO_BACKEND_URL}")
        print("✅ Bot ejecutándose ... (Ctrl+C para detener)")
        
        # Ejecutar polling (patrón que funciona)
        application.run_polling(
            poll_interval=1.0,
            allowed_updates=['message', 'callback_query']
        )
        
    except KeyboardInterrupt:
        print("\n👋 Bot detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main_launcher()