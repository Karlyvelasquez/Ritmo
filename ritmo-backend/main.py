
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import pathlib

from routers.contexto import router as contexto_router
from routers.chat import router as chat_router
from routers.admin import router as admin_router
from routers.onboarding import router as onboarding_router
from routers.checkins import router as checkins_router
from routers.health import router as health_router

# Cargar variables de entorno desde el directorio correcto
current_dir = pathlib.Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(env_path)

# Inicializar FastAPI
app = FastAPI(
    title="RITMO Backend",
    description="Ecosistema de Acompañamiento Inteligente para Colectivos Vulnerables",
    version="1.0.0"
)

# Obtener orígenes permitidos de las variables de entorno para CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:*").split(",")

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar routers
app.include_router(contexto_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(onboarding_router)
app.include_router(checkins_router)
app.include_router(health_router)

@app.get("/")
async def root():
    """Endpoint de prueba"""
    return {
        "message": "RITMO Backend",
        "status": "running",
        "endpoints_disponibles": [
            "/docs", 
            "/contexto", 
            "/chat/", 
            "/chat/proactivo",
            "/admin/stats",
            "/admin/system-info",
            "/admin/ai-analysis",
            "/onboarding/iniciar",
            "/onboarding/responder",
            "/checkins/emocional",
            "/checkins/usuario/{user_id}/historial",
            "/checkins/usuario/{user_id}/ultimo",
            "/checkins/estados-disponibles",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check para verificar que el servidor funciona"""
    return {
        "status": "ok",
        "service": "ritmo-backend",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_KEY)
    }


@app.get("/app", response_class=FileResponse)
async def frontend():
    """Sirve el frontend de registro y login"""
    frontend_path = pathlib.Path(__file__).parent / "frontend" / "index.html"
    if not frontend_path.exists():
        from fastapi.responses import JSONResponse
        return JSONResponse({"error": "Frontend no encontrado"}, status_code=404)
    return FileResponse(str(frontend_path), media_type="text/html")

if __name__ == "__main__":
    import uvicorn
    # Obtener puerto desde variables de entorno (Render.com usa PORT)
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "0.0.0.0")  # Render.com requiere 0.0.0.0
    
    print(f"🚀 Iniciando servidor RITMO Backend en {host}:{port}...")
    print("📊 Endpoints disponibles:")
    print(f"   - Documentación API: http://{host}:{port}/docs")
    print(f"   - Health check: http://{host}:{port}/health")
    print(f"   - Análisis de contexto: POST http://{host}:{port}/contexto")
    print(f"   - Análisis IA: POST http://{host}:{port}/admin/ai-analysis")
    print(f"   - Root endpoint: http://{host}:{port}/")
    print("")
    
    # Configuración para producción en render.com
    reload_mode = os.getenv("ENVIRONMENT", "development") != "production"
    
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        reload=reload_mode,  # No reload en producción
        log_level="info"
    )