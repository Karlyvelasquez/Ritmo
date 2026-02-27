#!/bin/bash

# Script de healthcheck para servicios RITMO
# Verifica que todos los servicios estén funcionando correctamente

echo "🏥 Verificando salud de servicios RITMO..."
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Verificando $service_name... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALLO (codigo: $status_code)${NC}"
        return 1
    fi
}

# Verificar contenedores en ejecución
echo "📦 Verificando contenedores..."
containers=$(docker-compose ps -q)
if [ -z "$containers" ]; then
    echo -e "${RED}❌ No hay contenedores ejecutándose${NC}"
    echo "💡 Ejecuta: docker-compose up -d"
    exit 1
fi

# Verificar servicios web
failed_count=0

# Frontend
if ! check_service "Frontend" "http://localhost:3000"; then
    ((failed_count++))
fi

# Backend API
if ! check_service "Backend API" "http://localhost:8000/health"; then
    ((failed_count++))
fi

# Backend Docs
if ! check_service "API Docs" "http://localhost:8000/docs"; then
    ((failed_count++))
fi

# Nginx (si está configurado)
if ! check_service "Nginx Proxy" "http://localhost" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Nginx proxy no está respondiendo${NC}"
fi

echo ""
echo "=================================="

if [ $failed_count -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos los servicios están funcionando correctamente!${NC}"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    exit 0
else
    echo -e "${RED}❌ $failed_count servicio(s) tienen problemas${NC}"
    echo ""
    echo "🔧 Para diagnosticar:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🔄 Para reiniciar:"
    echo "   docker-compose restart"
    exit 1
fi