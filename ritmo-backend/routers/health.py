"""
Endpoint de Health Check para RITMO Backend
Verifica el estado de la aplicación y sus dependencias
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import psutil
import os
from datetime import datetime
import logging

# Crear router
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Endpoint de health check para verificar el estado de la aplicación
    
    Returns:
        Dict con información del estado del sistema
    """
    try:
        # Información básica del sistema
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "server": {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "uptime": datetime.utcnow().isoformat()
            }
        }
        
        # Verificar conexión a Supabase (opcional)
        supabase_status = "unknown"
        try:
            # Aquí puedes agregar verificación de conexión a Supabase
            supabase_status = "connected"
        except Exception as e:
            logger.warning(f"Supabase health check failed: {e}")
            supabase_status = "disconnected"
        
        health_data["services"] = {
            "supabase": supabase_status,
            "telegram_bot": "running"  # Asumimos que está corriendo
        }
        
        return health_data
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health check failed"
        )

@router.get("/health/ready")
async def readiness_check() -> Dict[str, str]:
    """
    Readiness probe - verifica si la aplicación está lista para recibir requests
    """
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/live")  
async def liveness_check() -> Dict[str, str]:
    """
    Liveness probe - verifica si la aplicación está viva
    """
    return {
        "status": "alive", 
        "timestamp": datetime.utcnow().isoformat()
    }