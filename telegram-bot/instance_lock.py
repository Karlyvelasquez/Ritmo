"""
Sistema de bloqueo para evitar múltiples instancias del bot
"""

import os
import time
import logging
import atexit
from pathlib import Path

logger = logging.getLogger(__name__)

class BotInstanceManager:
    """Gestor para evitar múltiples instancias del bot"""
    
    def __init__(self, lockfile_path: str = "/tmp/ritmo_bot.lock"):
        self.lockfile_path = lockfile_path
        self.lockfile = None
        self.is_locked = False
    
    def acquire_lock(self) -> bool:
        """
        Intenta obtener el bloqueo de instancia única
        
        Returns:
            bool: True si obtuvo el bloqueo, False si otra instancia está corriendo
        """
        try:
            # Verificar si ya existe un lockfile
            if os.path.exists(self.lockfile_path):
                logger.warning(f"🔒 Lockfile existe: {self.lockfile_path}")
                
                # Leer PID del lockfile existente
                try:
                    with open(self.lockfile_path, 'r') as f:
                        existing_pid = int(f.read().strip())
                    
                    # Verificar si el proceso sigue corriendo
                    if self._is_process_running(existing_pid):
                        logger.error(f"❌ Otra instancia del bot está corriendo (PID: {existing_pid})")
                        logger.error("💡 Detener la instancia anterior antes de iniciar una nueva")
                        return False
                    else:
                        logger.info(f"🧹 Lockfile huérfano encontrado (PID: {existing_pid}), removiendo...")
                        os.remove(self.lockfile_path)
                        
                except (ValueError, IOError) as e:
                    logger.warning(f"⚠️ Error leyendo lockfile: {e}, removiendo...")
                    try:
                        os.remove(self.lockfile_path)
                    except:
                        pass
            
            # Crear nuevo lockfile con el PID actual
            current_pid = os.getpid()
            with open(self.lockfile_path, 'w') as f:
                f.write(str(current_pid))
            
            self.lockfile = self.lockfile_path
            self.is_locked = True
            
            # Registrar limpieza al salir
            atexit.register(self.release_lock)
            
            logger.info(f"✅ Bloqueo de instancia adquirido (PID: {current_pid})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error adquiriendo bloqueo: {e}")
            return False
    
    def release_lock(self):
        """Libera el bloqueo de instancia"""
        try:
            if self.is_locked and self.lockfile and os.path.exists(self.lockfile):
                os.remove(self.lockfile)
                logger.info("🔓 Bloqueo de instancia liberado")
                self.is_locked = False
        except Exception as e:
            logger.warning(f"⚠️ Error liberando bloqueo: {e}")
    
    def _is_process_running(self, pid: int) -> bool:
        """Verifica si un proceso está corriendo"""
        try:
            # En sistemas Unix, signal 0 no mata el proceso, solo verifica si existe
            os.kill(pid, 0)
            return True
        except (OSError, ProcessLookupError):
            return False
        except PermissionError:
            # El proceso existe pero no tenemos permisos para verificarlo
            return True
    
    def __enter__(self):
        if not self.acquire_lock():
            raise RuntimeError("No se pudo adquirir el bloqueo de instancia única")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release_lock()
        return False