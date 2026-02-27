#!/usr/bin/env python3
"""
Script para limpiar el webhook del bot de Telegram y terminar procesos duplicados
"""
import requests
import os
import signal
import psutil
import sys
from config import Config

def cleanup_webhook():
    """Limpia el webhook del bot de Telegram"""
    try:
        # Obtener token del bot
        config = Config()
        bot_token = config.TELEGRAM_BOT_TOKEN or os.getenv("BOT_TOKEN")
        
        if not bot_token:
            print("No se encontro el token del bot. Verifica tu configuracion.")
            return
            
        # URL para limpiar webhook
        url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
        
        # También podemos usar setWebhook con URL vacía para asegurar
        set_webhook_url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
        
        print("Limpiando webhook...")
        
        # Eliminar webhook
        response = requests.post(url, json={"drop_pending_updates": True})
        if response.status_code == 200:
            print("Webhook eliminado exitosamente")
        else:
            print(f"Error eliminando webhook: {response.text}")
        
        # Establecer webhook vacío para asegurar
        response2 = requests.post(set_webhook_url, json={"url": ""})
        if response2.status_code == 200:
            print("Webhook establecido como vacio exitosamente")
        else:
            print(f"Advertencia estableciendo webhook vacio: {response2.text}")
            
    except Exception as e:
        print(f"Error limpiando webhook: {e}")

def kill_python_processes_with_bot():
    """Termina procesos Python que podrían ser instancias del bot"""
    current_pid = os.getpid()
    killed = []
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                # Buscar procesos Python
                if proc.info['name'] and 'python' in proc.info['name'].lower():
                    if proc.info['pid'] != current_pid:  # No terminar este script
                        cmdline = ' '.join(proc.info['cmdline'] or [])
                        
                        # Buscar procesos que podrían ser el bot
                        if any(keyword in cmdline.lower() for keyword in ['bot.py', 'run.py', 'telegram']):
                            print(f"Terminando proceso PID {proc.info['pid']}: {cmdline}")
                            proc.terminate()
                            killed.append(proc.info['pid'])
                            
                            # Esperar un poco y forzar si no se termina
                            try:
                                proc.wait(timeout=3)
                            except psutil.TimeoutExpired:
                                proc.kill()
                                
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
    except Exception as e:
        print(f"Error terminando procesos: {e}")
    
    if killed:
        print(f"Procesos terminados: {killed}")
    else:
        print("No se encontraron procesos del bot para terminar")

def main():
    print("=" * 60)
    print("RITMO Bot Cleanup Utility")
    print("=" * 60)
    
    # Limpiar webhook
    cleanup_webhook()
    
    # Terminar procesos duplicados
    print("\nBuscando procesos duplicados del bot...")
    kill_python_processes_with_bot()
    
    print("\nLimpieza completada. Ahora puedes ejecutar el bot nuevamente.")
    print("Ejecuta: python bot.py")

if __name__ == "__main__":
    main()