@echo off
echo 🎵 Iniciando RITMO en modo desarrollo...

REM Verificar que existe el archivo .env
if not exist .env (
    echo ❌ Archivo .env no encontrado. Copiando .env.example...
    copy .env.example .env
    echo 📝 Por favor, edita el archivo .env con tus configuraciones antes de continuar.
    echo 💡 Ejecuta: notepad .env
    pause
    exit /b 1
)

echo 🔨 Construyendo imágenes para desarrollo...
docker-compose -f docker-compose.dev.yml build

echo 🚀 Iniciando servicios en modo desarrollo (con hot reload)...
docker-compose -f docker-compose.dev.yml up -d

echo ✅ Servicios de desarrollo iniciados!
echo.
echo 🌐 URLs disponibles:
echo    Frontend (dev): http://localhost:3000
echo    Backend (dev): http://localhost:8000  
echo    API Docs: http://localhost:8000/docs
echo.
echo 🔥 Hot reload activado - los cambios se reflejarán automáticamente
echo.
echo 📊 Para ver los logs:
echo    docker-compose -f docker-compose.dev.yml logs -f
echo.
echo 🛑 Para detener:
echo    docker-compose -f docker-compose.dev.yml down
echo.
pause