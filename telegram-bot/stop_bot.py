#!/usr/bin/env python3
"""
Script para detener todas las instancias del bot de Telegram RITMO
"""
import psutil
import sys

def stop_all_bots():
    """Detiene todas las instancias del bot"""
    stopped = 0
    
    print("Buscando instancias del bot...")
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['name'] and 'python' in proc.info['name'].lower():
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    
                    # Buscar procesos del bot de Telegram (pero no este script)
                    if any(keyword in cmdline.lower() for keyword in ['bot.py', 'safe_start.py']):
                        if 'stop_bot.py' not in cmdline.lower():
                            print(f"Deteniendo PID {proc.info['pid']}: {cmdline}")
                            proc.terminate()
                            stopped += 1
                            
                            # Esperar a que termine
                            try:
                                proc.wait(timeout=5)
                                print(f"Bot PID {proc.info['pid']} detenido exitosamente")
                            except psutil.TimeoutExpired:
                                print(f"Forzando detención del PID {proc.info['pid']}")
                                proc.kill()
                                
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    if stopped == 0:
        print("No se encontraron instancias del bot ejecutándose")
    else:
        print(f"Se detuvieron {stopped} instancias del bot")

if __name__ == "__main__":
    print("=" * 50)
    print("RITMO Bot - Detener todas las instancias")
    print("=" * 50)
    stop_all_bots()
    print("Operación completada.")