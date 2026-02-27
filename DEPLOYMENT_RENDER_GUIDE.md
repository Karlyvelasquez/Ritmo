# 🚀 DEPLOYMENT GUIDE - RENDER.COM
# Guía completa para desplegar RITMO Platform en render.com

## 📋 PASO 1: PREPARAR REPOSITORIO GITHUB

### 1.1 Commit y Push cambios
```bash
# En tu terminal, desde la carpeta RITMO desarrollo/Ritmo
git add .
git commit -m "Configure project for render.com deployment"
git push origin main
```

### 1.2 Verificar archivos en GitHub
Asegúrate que estos archivos estén en tu repositorio:
- ✅ `render.yaml` (configuración automática)
- ✅ `ritmo-backend/requirements.txt` (dependencias backend)
- ✅ `ritmo-backend/main.py` (optimizado para render.com)
- ✅ `ritmo-frontend/landing/package.json` (dependencias frontend)
- ✅ `ritmo-frontend/landing/.env.production` (config producción)
- ✅ `telegram-bot/requirements.txt` (dependencias bot)

---

## 🌐 PASO 2: CREAR CUENTA EN RENDER.COM

### 2.1 Registro
1. Ve a https://render.com
2. Crea cuenta con GitHub (recomendado)
3. Autoriza render.com a acceder tus repositorios

### 2.2 Conectar repositorio
1. Dashboard > "New +" > "Web Service" 
2. "Build and deploy from a Git repository"
3. Selecciona tu repositorio de RITMO
4. Render detectará automáticamente `render.yaml`

---

## 🗂️ PASO 3: CONFIGURAR SERVICIOS

Render creará automáticamente 3 servicios desde `render.yaml`:

### 3.1 Backend (ritmo-backend) 
- **Tipo:** Web Service
- **Runtime:** Python 3.11
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check:** `/health`

### 3.2 Frontend (ritmo-frontend)
- **Tipo:** Static Site  
- **Build Command:** `cd ritmo-frontend/landing && npm install && npm run build`
- **Publish Directory:** `ritmo-frontend/landing/dist`

### 3.3 Telegram Bot (ritmo-telegram-bot)
- **Tipo:** Background Worker
- **Runtime:** Python 3.11
- **Start Command:** `cd telegram-bot && python bot.py`

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

### 4.1 Backend Variables
Ve a `ritmo-backend` service > Settings > Environment Variables:

```env
ENVIRONMENT=production
SUPABASE_URL=https://tu-proyecto.supabase.co  
SUPABASE_KEY=tu-anon-key-aqui
SUPABASE_ANON_KEY=tu-anon-key-aqui
OPENAI_API_KEY=sk-tu-openai-key-aqui
TELEGRAM_BOT_TOKEN=tu-bot-token-aqui
SECRET_KEY=genera-key-32-caracteres
JWT_SECRET_KEY=genera-jwt-key-32-caracteres
CORS_ORIGINS=https://ritmo-frontend.onrender.com
```

### 4.2 Bot Variables  
Ve a `ritmo-telegram-bot` service > Settings > Environment Variables:

```env
TELEGRAM_BOT_TOKEN=tu-bot-token-aqui
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-aqui
OPENAI_API_KEY=sk-tu-openai-key-aqui  
BACKEND_URL=https://ritmo-backend.onrender.com
```

---

## 🔧 PASO 5: OBTENER CREDENCIALES REALES

### 5.1 Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto RITMO
3. Settings > API
4. Copia `Project URL` y `anon public key`

### 5.2 OpenAI
1. Ve a https://platform.openai.com/api-keys
2. Create new secret key
3. Copia la key (empieza con `sk-`)

### 5.3 Telegram Bot
1. Habla con @BotFather en Telegram
2. `/newbot` y sigue instrucciones
3. Copia el token (formato: `123456:ABC-DEF...`)

### 5.4 Secret Keys
```bash
# Generar secret keys seguras
openssl rand -hex 32
```

---

## ⚡ PASO 6: DEPLOY AUTOMÁTICO

### 6.1 Deploy inicial
1. Render detecta `render.yaml` automáticamente
2. Crea los 3 servicios simultáneamente  
3. Ejecuta builds en paralelo
4. ⏱️ Tiempo estimado: 5-10 minutos

### 6.2 Monitorear deploy
- Ve a Dashboard > Services
- Cada servicio muestra logs en tiempo real
- Busca ✅ "Deploy succeeded" 

### 6.3 URLs finales
Después del deploy exitoso:
- 🌐 **Frontend:** `https://ritmo-frontend.onrender.com`
- 🔧 **Backend:** `https://ritmo-backend.onrender.com`  
- 📊 **Health:** `https://ritmo-backend.onrender.com/health`
- 📖 **Docs:** `https://ritmo-backend.onrender.com/docs`

---

## ✅ PASO 7: VERIFICACIÓN POST-DEPLOY

### 7.1 Testing básico
```bash
# Health check
curl https://ritmo-backend.onrender.com/health

# Frontend cargando  
curl https://ritmo-frontend.onrender.com

# API docs accesibles
curl https://ritmo-backend.onrender.com/docs
```

### 7.2 Actualizar URLs cruzadas
1. **Backend:** Actualiza `CORS_ORIGINS` con URL real del frontend
2. **Bot:** Actualiza `BACKEND_URL` con URL real del backend
3. **Frontend:** Actualiza `.env.production` con URL real del backend

### 7.3 Logs en tiempo real
```
Dashboard > Service > Logs (tab) 
```

---

## 🔄 PASO 8: AUTO-DEPLOY CONTINUO

### 8.1 Configuración automática
- ✅ Cada `git push` a `main` → Deploy automático
- ✅ Render detecta cambios y redeploya
- ✅ Zero-downtime deployments
- ✅ Rollback automático si falla

### 8.2 Workflow de desarrollo
```bash
# Hacer cambios localmente
git add .
git commit -m "New feature: ..."
git push origin main

# Render auto-deploya en ~3-5 minutos
# Notificación por email al completar
```

---

## 🆘 TROUBLESHOOTING

### Build Failed?
- Check logs: Service > Logs
- Verify dependencies in requirements.txt
- Ensure Python version compatibility

### Service Won't Start?  
- Check environment variables
- Verify start command
- Check health check endpoint

### Frontend Not Loading?
- Verify build command
- Check build output directory
- Ensure all assets copied correctly

### Bot Not Responding?
- Verify Telegram token
- Check worker service logs
- Ensure backend URL is correct

---

## 🎉 ¡LISTO!

Tu plataforma RITMO está ahora desplegada en render.com con:
- ✅ **SSL automático** (HTTPS)
- ✅ **Auto-scaling** según tráfico
- ✅ **Monitoreo** integrado
- ✅ **Deploy automático** desde GitHub
- ✅ **Backup** y rollback automático

**Next Steps:**
1. Configura dominio personalizado (opcional)
2. Configura alerts y monitoring
3. Escala servicios según necesidad