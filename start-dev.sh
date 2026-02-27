#!/bin/bash

# Script para iniciar RITMO en modo desarrollo

echo "🎵 Iniciando RITMO en modo desarrollo..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado. Copiando .env.example..."
    cp .env.example .env
    echo "📝 Por favor, edita el archivo .env con tus configuraciones antes de continuar."
    echo "💡 Ejecuta: nano .env"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Construir e iniciar los servicios en modo desarrollo
echo "🔨 Construyendo imágenes para desarrollo..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Iniciando servicios en modo desarrollo (con hot reload)..."
docker-compose -f docker-compose.dev.yml up -d

echo "✅ Servicios de desarrollo iniciados!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend (dev): http://localhost:3000"
echo "   Backend (dev): http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔥 Hot reload activado - los cambios se reflejarán automáticamente"
echo ""
echo "📊 Para ver los logs:"
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose -f docker-compose.dev.yml down"