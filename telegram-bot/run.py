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
    
    # Cargar variables de entorno (funciona con o sin archivo .env)
    from dotenv import load_dotenv
    load_dotenv()  # No falla si no hay .env
    
    # Verificar variables críticas (desde env vars del sistema o .env)
    variables_criticas = {
        "TELEGRAM_BOT_TOKEN": os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN"),
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": os.getenv("SUPABASE_KEY")
    }
    
    missing_vars = []
    for var_name, var_value in variables_criticas.items():
        if not var_value:
            missing_vars.append(var_name)
    
    if missing_vars:
        print(f"❌ Variables de entorno faltantes: {', '.join(missing_vars)}")
        print("💡 En desarrollo: crea un archivo .env")
        print("💡 En producción: configura las variables de entorno en tu plataforma")
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
        from bot import main
        
        # Ejecutar bot completo con scheduler
        main()
        
    except KeyboardInterrupt:
        print("\n👋 Bot detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main_launcher()