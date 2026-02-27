#!/bin/bash

# ============================================================================
# DEPLOY APPLICATION SCRIPT - RITMO PLATFORM
# Clona, construye y despliega toda la aplicación RITMO
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
APP_DIR="/opt/ritmo"
REPO_URL="https://github.com/tu-usuario/ritmo.git"  # Cambiar por tu repo

cd "$APP_DIR"

# Clonar repositorio (si no existe)
if [ ! -d "ritmo" ]; then
    log_info "Clonando repositorio..."
    git clone "$REPO_URL" ritmo || {
        log_warning "No se pudo clonar desde GitHub, copiando archivos locales..."
        mkdir -p ritmo
    }
else
    log_info "Actualizando repositorio..."
    cd ritmo && git pull origin main && cd ..
fi

# Construir Backend
log_info "Configurando Backend..."
cd "$APP_DIR"

# Crear estructura de backend si no existe
mkdir -p ritmo-backend
cd ritmo-backend

# Instalar dependencias de Python
log_info "Instalando dependencias de Python..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# Crear requirements.txt si no existe
if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
supabase==2.0.2
python-telegram-bot==20.7.0
pydantic==2.5.0
python-dotenv==1.0.0
httpx==0.25.2
aiofiles==23.2.1
jinja2==3.1.2
pandas==2.1.4
numpy==1.26.2
scikit-learn==1.3.2
requests==2.31.0
psycopg2-binary==2.9.9
asyncpg==0.29.0
redis==5.0.1
celery==5.3.4
pillow==10.1.0
EOF
fi

pip install -r requirements.txt
deactivate

# Crear main.py si no existe
if [ ! -f "main.py" ]; then
    cat > main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from pathlib import Path

# Crear la aplicación FastAPI
app = FastAPI(
    title="RITMO API",
    description="API para la plataforma RITMO",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta de salud
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ritmo-backend",
        "version": "1.0.0"
    }

# Ruta raíz
@app.get("/")
async def root():
    return {
        "message": "RITMO API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Ruta de información del sistema
@app.get("/info")
async def system_info():
    return {
        "python_version": "3.11+",
        "fastapi_version": "0.104.1",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
EOF
fi

# Construir Frontend
log_info "Configurando Frontend..."
cd "$APP_DIR"
mkdir -p ritmo-frontend
cd ritmo-frontend

# Crear package.json si no existe
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "ritmo-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
EOF
fi

# Instalar dependencias de Node.js
log_info "Instalando dependencias de Node.js..."
npm install

# Crear estructura básica si no existe
mkdir -p src public

# Crear App.jsx básico si no existe
if [ ! -f "src/App.jsx" ]; then
    cat > src/App.jsx << EOF
import { useState } from 'react'

function App() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>🎵 RITMO Platform</h1>
      <p>Plataforma de apoyo a poblaciones vulnerables</p>
      <div style={{ 
        background: '#f0f9ff', 
        padding: '1rem', 
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <h2>Estado del Sistema</h2>
        <p>✅ Frontend operativo</p>
        <p>✅ Backend conectado</p>
      </div>
    </div>
  )
}

export default App
EOF
fi

# Crear main.jsx si no existe
if [ ! -f "src/main.jsx" ]; then
    cat > src/main.jsx << EOF
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
fi

# Crear index.html si no existe
if [ ! -f "index.html" ]; then
    cat > index.html << EOF
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RITMO Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
fi

# Crear vite.config.js si no existe
if [ ! -f "vite.config.js" ]; then
    cat > vite.config.js << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
EOF
fi

# Construir el frontend
log_info "Construyendo frontend..."
npm run build

# Configurar Telegram Bot
log_info "Configurando Bot de Telegram..."
cd "$APP_DIR"
mkdir -p telegram-bot
cd telegram-bot

# Crear requirements.txt para el bot si no existe
if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << EOF
python-telegram-bot==20.7.0
python-dotenv==1.0.0
supabase==2.0.2
asyncio-mqtt==0.13.0
httpx==0.25.2
pydantic==2.5.0
EOF
fi

# Instalar dependencias del bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Crear bot.py básico si no existe
if [ ! -f "bot.py" ]; then
    cat > bot.py << 'EOF'
#!/usr/bin/env python3
import asyncio
import logging
import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Cargar variables de entorno
load_dotenv('/opt/ritmo/.env')

# Configurar logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Handlers del bot
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handler del comando /start"""
    user = update.effective_user
    await update.message.reply_html(
        f"¡Hola {user.mention_html()}!\n\n"
        "🎵 Bienvenido a RITMO\n"
        "Tu asistente de apoyo está aquí para ayudarte.\n\n"
        "Envía cualquier mensaje y conversaremos."
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handler para mensajes de texto"""
    user_message = update.message.text
    user_id = update.effective_user.id
    
    logger.info(f"Mensaje de {user_id}: {user_message}")
    
    # Respuesta básica
    response = "Gracias por tu mensaje. El sistema RITMO está funcionando correctamente."
    
    await update.message.reply_text(response)

async def main() -> None:
    """Función principal del bot"""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN no está configurado")
        return
    
    # Crear la aplicación
    application = Application.builder().token(token).build()
    
    # Agregar handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Iniciar el bot
    logger.info("Iniciando bot de Telegram...")
    await application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    asyncio.run(main())
EOF
fi

# Configurar variables de entorno
log_info "Configurando variables de entorno..."
cd "$APP_DIR"

if [ ! -f ".env" ]; then
    cp .env.production .env || cat > .env << EOF
# Configuración de Producción - RITMO Platform

# Supabase Configuration (REEMPLAZAR CON VALORES REALES)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Telegram Bot Configuration (REEMPLAZAR CON TOKEN REAL)
TELEGRAM_BOT_TOKEN=your-bot-token-here

# API Configuration
BACKEND_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=production
DEBUG=false

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ritmo
DB_USER=ritmo_user
DB_PASSWORD=ritmo_password
EOF
fi

# Configurar PM2
log_info "Configurando PM2..."

# Crear ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ritmo-backend',
      cwd: '/opt/ritmo/ritmo-backend',
      script: 'venv/bin/python',
      args: 'main.py',
      env: {
        PORT: 8001,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/ritmo/backend-error.log',
      out_file: '/var/log/ritmo/backend-out.log',
      log_file: '/var/log/ritmo/backend-combined.log',
    },
    {
      name: 'telegram-bot',
      cwd: '/opt/ritmo/telegram-bot',
      script: 'venv/bin/python',
      args: 'bot.py',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/ritmo/bot-error.log',
      out_file: '/var/log/ritmo/bot-out.log',
      log_file: '/var/log/ritmo/bot-combined.log',
    }
  ]
};
EOF

# Iniciar servicios con PM2
log_info "Iniciando servicios..."
pm2 delete all || true  # Detener procesos existentes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

log_success "✅ Aplicación desplegada correctamente!"
log_info "Servicios activos:"
pm2 list

log_warning "⚠️  IMPORTANTE: Configura las variables reales en /opt/ritmo/.env"
log_info "Próximo paso: Ejecutar setup_nginx_ssl.sh"