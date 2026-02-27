@echo off
echo 🎵 Iniciando proyecto RITMO...

REM Verificar que existe el archivo .env
if not exist .env (
    echo ❌ Archivo .env no encontrado. Copiando .env.example...
    copy .env.example .env
    echo 📝 Por favor, edita el archivo .env con tus configuraciones antes de continuar.
    echo 💡 Ejecuta: notepad .env
    pause
    exit /b 1
)

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker Desktop primero.
    pause
    exit /b 1
)

REM Verificar que Docker Compose está disponible
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker Compose no está disponible. Actualizando Docker Desktop...
    pause
    exit /b 1
)

REM Construir e iniciar los servicios
echo 🔨 Construyendo imágenes...
docker-compose build

echo 🚀 Iniciando servicios...
docker-compose up -d

echo ✅ Servicios iniciados correctamente!
echo.
echo 🌐 URLs disponibles:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo    Nginx (proxy): http://localhost
echo.
echo 📊 Para ver los logs:
echo    docker-compose logs -f
echo.
echo 🛑 Para detener los servicios:
echo    docker-compose down
echo.
pause