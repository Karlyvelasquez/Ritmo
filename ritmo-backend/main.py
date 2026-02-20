
from fastapi import FastAPI
from dotenv import load_dotenv
import os

from routers.contexto import router as contexto_router

# Cargar variables de entorno
load_dotenv()

# Verificar que las variables estén cargadas
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ADVERTENCIA: Variables de entorno SUPABASE_URL y/o SUPABASE_KEY no encontradas")
    print("   Asegúrate de configurar el archivo .env correctamente")

# Inicializar FastAPI
app = FastAPI(
    title="RITMO Backend",
    description="API para Agente de Contexto de Vida y Patrones y Señales Web",
    version="1.0.0"
)

# Registrar routers
app.include_router(contexto_router)

@app.get("/")
async def root():
    """Endpoint de prueba"""
    return {
        "message": "RITMO Backend",
        "status": "running",
        "endpoints_disponibles": ["/docs", "/contexto", "/health"]
    }

@app.get("/health")
async def health_check():
    """Health check para verificar que el servidor funciona"""
    return {
        "status": "ok",
        "service": "ritmo-backend",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor RITMO Backend...")
    print("📍 Endpoints disponibles:")
    print("   - Documentación API: http://localhost:8001/docs")
    print("   - Health check: http://localhost:8001/health")
    print("   - Análisis de contexto: POST http://localhost:8001/contexto")
    print("   - Root endpoint: http://localhost:8001/")
    print("")
    uvicorn.run(app, host="127.0.0.1", port=8001)