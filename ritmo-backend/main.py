
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
print(f"Cargando .env desde: {env_path}")
load_dotenv(env_path)

# Verificar que la API key se cargó
openai_key = os.getenv("OPENAI_API_KEY")
print(f"OPENAI_API_KEY cargada: {'Sí' if openai_key else 'No'}")
if openai_key:
    print(f"API Key (primeros 10 chars): {openai_key[:10]}...")

# Verificar que las variables estén cargadas
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ADVERTENCIA: Variables de entorno SUPABASE_URL y/o SUPABASE_KEY no encontradas")
    print("   Asegúrate de configurar el archivo .env correctamente")

# Inicializar FastAPI
app = FastAPI(
    title="RITMO Backend",
    description="API para Agente de Contexto de Vida y Patrones y Señales Web con Onboarding Inteligente",
    version="1.0.0"
)

# Obtener orígenes permitidos de las variables de entorno
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000").split(",")

print(f"CORS configurado para: {ALLOWED_ORIGINS}")

# CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    # Obtener puerto desde variables de entorno
    port = int(os.getenv("PORT", "8001"))
    print(f" Iniciando servidor RITMO Backend en puerto {port}...")
    print(" Endpoints disponibles:")
    print(f"   - Documentación API: http://localhost:{port}/docs")
    print(f"   - Health check: http://localhost:{port}/health")
    print(f"   - Análisis de contexto: POST http://localhost:{port}/contexto")
    print(f"   - Análisis IA: POST http://localhost:{port}/admin/ai-analysis")
    print(f"   - Root endpoint: http://localhost:{port}/")
    print("")
    uvicorn.run(app, host="0.0.0.0", port=port)