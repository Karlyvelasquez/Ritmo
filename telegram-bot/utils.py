"""
Utilidades para el bot de Telegram RITMO
Cliente para integración con el backend RITMO
"""

import httpx
from typing import Optional, Dict, Any
import logging

from config import config

# Configurar logging
logger = logging.getLogger(__name__)


class RitmoBackendClient:
    """Cliente para comunicación con el backend RITMO"""
    
    def __init__(self):
        self.base_url = config.RITMO_BACKEND_URL.rstrip('/')
        self.timeout = config.RITMO_BACKEND_TIMEOUT
    
    async def analizar_contexto(self, perfil_data: Dict[str, Any], senales_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Llama al endpoint /contexto del backend RITMO"""
        
        payload = {
            "perfil": perfil_data,
            "señales": senales_data
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/contexto",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Error en backend RITMO: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("Timeout al conectar con backend RITMO")
            return None
        except Exception as e:
            logger.error(f"Error inesperado al llamar backend RITMO: {e}")
            return None
    
    async def health_check(self) -> bool:
        """Verifica que el backend esté disponible"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except:
            return False


# Instancia global
backend_client = RitmoBackendClient()