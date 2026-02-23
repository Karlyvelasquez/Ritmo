"""
Servicio de sesiones de onboarding
Maneja el almacenamiento temporal de estados de onboarding
"""

import logging
import json
import uuid
from typing import Dict, Optional
from datetime import datetime, timedelta

from models.schemas import OnboardingEstado

# Configurar logging
logger = logging.getLogger(__name__)


class OnboardingSessionManager:
    """Gestor de sesiones de onboarding en memoria"""
    
    def __init__(self):
        # Almacenamiento en memoria (en producción usar Redis)
        self._sessions: Dict[str, Dict] = {}
        self._session_expiry = timedelta(hours=2)  # Sesiones expiran en 2 horas
        
    def crear_sesion(self, telegram_id: str, nombre: str) -> str:
        """
        Crea una nueva sesión de onboarding
        
        Args:
            telegram_id: ID de Telegram del usuario
            nombre: Nombre del usuario
            
        Returns:
            str: ID de la sesión creada
        """
        sesion_id = str(uuid.uuid4())
        
        sesion_data = {
            "sesion_id": sesion_id,
            "telegram_id": telegram_id,
            "nombre": nombre,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + self._session_expiry).isoformat(),
            "estado": None  # Se seteará cuando inicie el onboarding
        }
        
        self._sessions[sesion_id] = sesion_data
        logger.info(f"Sesión creada: {sesion_id} para usuario {telegram_id}")
        
        return sesion_id
    
    def obtener_sesion(self, sesion_id: str) -> Optional[Dict]:
        """Obtiene una sesión por su ID"""
        if sesion_id not in self._sessions:
            return None
            
        sesion = self._sessions[sesion_id]
        
        # Verificar expiración
        expires_at = datetime.fromisoformat(sesion["expires_at"])
        if datetime.utcnow() > expires_at:
            del self._sessions[sesion_id]
            logger.info(f"Sesión expirada eliminada: {sesion_id}")
            return None
            
        return sesion
    
    def guardar_estado(self, sesion_id: str, estado: OnboardingEstado) -> bool:
        """Guarda el estado del onboarding en la sesión"""
        if sesion_id not in self._sessions:
            return False
            
        self._sessions[sesion_id]["estado"] = estado.dict()
        self._sessions[sesion_id]["updated_at"] = datetime.utcnow().isoformat()
        
        logger.debug(f"Estado guardado para sesión {sesion_id}")
        return True
    
    def obtener_estado(self, sesion_id: str) -> Optional[OnboardingEstado]:
        """Obtiene el estado del onboarding de la sesión"""
        sesion = self.obtener_sesion(sesion_id)
        if not sesion or not sesion.get("estado"):
            return None
            
        try:
            return OnboardingEstado(**sesion["estado"])
        except Exception as e:
            logger.error(f"Error deserializando estado de sesión {sesion_id}: {e}")
            return None
    
    def obtener_sesion_por_telegram(self, telegram_id: str) -> Optional[Dict]:
        """Busca una sesión activa por ID de Telegram"""
        for sesion_id, sesion_data in self._sessions.items():
            if sesion_data["telegram_id"] == telegram_id:
                # Verificar si no ha expirado
                sesion = self.obtener_sesion(sesion_id)
                if sesion:
                    return sesion
        return None
    
    def eliminar_sesion(self, sesion_id: str) -> bool:
        """Elimina una sesión"""
        if sesion_id in self._sessions:
            del self._sessions[sesion_id]
            logger.info(f"Sesión eliminada: {sesion_id}")
            return True
        return False
    
    def sesion_completada(self, sesion_id: str) -> bool:
        """Verifica si una sesión ha completado el onboarding"""
        estado = self.obtener_estado(sesion_id)
        return estado.completado if estado else False
    
    def limpiar_sesiones_expiradas(self) -> int:
        """Limpia sesiones expiradas y retorna el número eliminado"""
        ahora = datetime.utcnow()
        sesiones_a_eliminar = []
        
        for sesion_id, sesion_data in self._sessions.items():
            expires_at = datetime.fromisoformat(sesion_data["expires_at"])
            if ahora > expires_at:
                sesiones_a_eliminar.append(sesion_id)
        
        for sesion_id in sesiones_a_eliminar:
            del self._sessions[sesion_id]
        
        if sesiones_a_eliminar:
            logger.info(f"Limpiadas {len(sesiones_a_eliminar)} sesiones expiradas")
        
        return len(sesiones_a_eliminar)
    
    def estadisticas(self) -> Dict:
        """Obtiene estadísticas del gestor de sesiones"""
        ahora = datetime.utcnow()
        activas = 0
        completadas = 0
        
        for sesion_data in self._sessions.values():
            expires_at = datetime.fromisoformat(sesion_data["expires_at"])
            if ahora <= expires_at:
                activas += 1
                if sesion_data.get("estado", {}).get("completado", False):
                    completadas += 1
        
        return {
            "sesiones_activas": activas,
            "sesiones_completadas": completadas,
            "total_sesiones": len(self._sessions)
        }


# Instancia global del gestor
session_manager = OnboardingSessionManager()