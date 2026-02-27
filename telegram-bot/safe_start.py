"""
Script para iniciar el bot de Telegram de forma segura
Detiene instancias previas del bot antes de iniciar una nueva
"""

import subprocess
import sys
import time
import psutil
import os
from pathlib import Path

def detener_bots_existentes():
    """Detiene todas las instancias existentes del bot"""
    print("🔍 Buscando instancias existentes del bot...")
    
    bots_detenidos = 0
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            # Verificar si es un proceso de Python ejecutando bot.py o run.py
            if proc.info['name'] == 'python.exe' and proc.info['cmdline']:
                cmdline = ' '.join(proc.info['cmdline'])
                if any(script in cmdline for script in ['bot.py', 'run.py']) and 'telegram-bot' in cmdline:
                    print(f"⏹️  Deteniendo bot existente (PID: {proc.info['pid']})")
                    proc.terminate()
                    proc.wait(timeout=5)
                    bots_detenidos += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
            pass
    
    if bots_detenidos > 0:
        print(f"✅ Se detuvieron {bots_detenidos} instancia(s) del bot")
        time.sleep(2)  # Esperar un poco para que se liberen los recursos
    else:
        print("ℹ️  No se encontraron instancias previas del bot")

def iniciar_bot():
    """Inicia el bot de Telegram"""
    print("🚀 Iniciando el bot de Telegram...")
    
    # Cambiar al directorio del bot
    bot_dir = Path(__file__).parent
    os.chdir(bot_dir)
    
    try:
        # Intentar iniciar con bot.py
        if Path('bot.py').exists():
            subprocess.run([sys.executable, 'bot.py'], check=True)
        elif Path('run.py').exists():
            subprocess.run([sys.executable, 'run.py'], check=True)
        else:
            print("❌ No se encontró bot.py ni run.py")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar el bot: {e}")
        return False
    except KeyboardInterrupt:
        print("\n⏹️  Bot detenido por el usuario")
        return False
    
    return True

def main():
    """Función principal"""
    print("🤖 RITMO Telegram Bot - Inicio Seguro")
    print("=" * 40)
    
    # Detener bots existentes
    detener_bots_existentes()
    
    # Iniciar el bot
    if iniciar_bot():
        print("✅ Bot iniciado correctamente")
    else:
        print("❌ Error al iniciar el bot")
        sys.exit(1)

if __name__ == "__main__":
    main()