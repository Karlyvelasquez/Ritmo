#!/bin/bash

# ============================================================================
# DEPLOYMENT VERIFICATION SCRIPT - RITMO PLATFORM
# Verifica que todos los servicios estén funcionando correctamente
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[VERIFY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Variables
SERVER_IP="${1:-46.62.165.154}"
ERRORS=0

echo ""
echo "============================================"
echo "🔍 VERIFICANDO DEPLOYMENT DE RITMO PLATFORM"
echo "============================================"
echo ""

# Función para verificar URL
check_url() {
    local url="$1"
    local description="$2"
    local timeout="${3:-10}"
    
    log_info "Verificando $description..."
    
    if curl -s --max-time $timeout "$url" >/dev/null 2>&1; then
        log_success "$description está respondiendo"
        return 0
    else
        log_error "$description no responde"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar servicio
check_service() {
    local service="$1"
    local description="$2"
    
    log_info "Verificando servicio $description..."
    
    if systemctl is-active "$service" >/dev/null 2>&1; then
        log_success "Servicio $description está activo"
        return 0
    else
        log_error "Servicio $description no está activo"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar puerto
check_port() {
    local port="$1"
    local description="$2"
    
    log_info "Verificando puerto $port ($description)..."
    
    if netstat -tuln | grep ":$port " >/dev/null 2>&1; then
        log_success "Puerto $port está abierto"
        return 0
    else
        log_error "Puerto $port no está disponible"
        ((ERRORS++))
        return 1
    fi
}

# 1. Verificar servicios del sistema
echo "📋 1. SERVICIOS DEL SISTEMA"
echo "----------------------------"
check_service "nginx" "Nginx"
check_service "ufw" "Firewall"

# 2. Verificar puertos
echo ""
echo "🔌 2. PUERTOS"
echo "----------------------------"
check_port "80" "HTTP"
check_port "8001" "Backend API"

# 3. Verificar PM2
echo ""
echo "⚙️  3. PROCESOS PM2"
echo "----------------------------"
log_info "Estado de PM2..."
if command -v pm2 >/dev/null 2>&1; then
    pm2_status=$(pm2 jlist 2>/dev/null || echo "[]")
    
    if echo "$pm2_status" | grep -q "ritmo-backend"; then
        log_success "Proceso ritmo-backend está corriendo"
    else
        log_error "Proceso ritmo-backend no encontrado"
        ((ERRORS++))
    fi
    
    if echo "$pm2_status" | grep -q "telegram-bot"; then
        log_success "Proceso telegram-bot está corriendo"
    else
        log_warning "Proceso telegram-bot no encontrado (opcional)"
    fi
    
    # Mostrar lista de PM2
    log_info "Lista completa de procesos PM2:"
    pm2 list 2>/dev/null || log_warning "No se puede obtener lista de PM2"
else
    log_error "PM2 no está instalado"
    ((ERRORS++))
fi

# 4. Verificar URLs
echo ""
echo "🌐 4. ENDPOINTS HTTP"
echo "----------------------------"
check_url "http://$SERVER_IP" "Frontend" 15
check_url "http://$SERVER_IP/health" "Backend Health Check" 10
check_url "http://$SERVER_IP/docs" "API Documentation" 10

# 5. Verificar archivos de configuración
echo ""
echo "📁 5. ARCHIVOS DE CONFIGURACIÓN"
echo "----------------------------"

# Verificar .env
if [ -f "/opt/ritmo/.env" ]; then
    log_success "Archivo .env existe"
    
    # Verificar que no tenga valores por defecto
    if grep -q "your-" "/opt/ritmo/.env" 2>/dev/null; then
        log_warning "El archivo .env contiene valores de ejemplo (reemplázalos)"
    else
        log_success "Archivo .env parece estar configurado"
    fi
else
    log_error "Archivo .env no existe en /opt/ritmo/"
    ((ERRORS++))
fi

# Verificar Nginx config
if [ -f "/etc/nginx/sites-available/ritmo" ]; then
    log_success "Configuración de Nginx existe"
else
    log_error "Configuración de Nginx no encontrada"
    ((ERRORS++))
fi

# 6. Verificar logs
echo ""
echo "📝 6. LOGS DEL SISTEMA"
echo "----------------------------"

if [ -d "/var/log/ritmo" ]; then
    log_success "Directorio de logs existe"
    
    # Últimos errores en logs
    log_info "Últimas entradas de error:"
    tail -5 /var/log/ritmo/*error* 2>/dev/null | head -10 || log_info "No hay errores recientes"
else
    log_warning "Directorio de logs no existe"
fi

# 7. Verificar conectividad externa
echo ""
echo "🌍 7. CONECTIVIDAD EXTERNA"
echo "----------------------------"

# Verificar DNS
if nslookup google.com >/dev/null 2>&1; then
    log_success "Resolución DNS funcionando"
else
    log_error "Problemas con resolución DNS"
    ((ERRORS++))
fi

# Verificar conectividad HTTPS
if curl -s --max-time 10 https://httpbin.org/ip >/dev/null 2>&1; then
    log_success "Conectividad HTTPS funcionando"
else
    log_warning "Problemas con conectividad HTTPS"
fi

# 8. Verificar recursos del sistema
echo ""
echo "💻 8. RECURSOS DEL SISTEMA"
echo "----------------------------"

# Memoria
memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
log_info "Uso de memoria: ${memory_usage}%"

if (( $(echo "$memory_usage > 85" | bc -l) 2>/dev/null || [ "${memory_usage%.*}" -gt 85 ] )); then
    log_warning "Uso de memoria alto: ${memory_usage}%"
else
    log_success "Uso de memoria normal: ${memory_usage}%"
fi

# Disco
disk_usage=$(df /opt/ritmo | awk 'NR==2{print $5}' | sed 's/%//')
log_info "Uso de disco: ${disk_usage}%"

if [ "$disk_usage" -gt 85 ]; then
    log_warning "Uso de disco alto: ${disk_usage}%"
else
    log_success "Uso de disco normal: ${disk_usage}%"
fi

# RESUMEN FINAL
echo ""
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT VERIFICADO EXITOSAMENTE${NC}"
    echo "============================================"
    echo ""
    log_success "Todos los servicios están funcionando correctamente"
    echo ""
    echo "🔗 URLs de acceso:"
    echo "   Frontend: http://$SERVER_IP"
    echo "   Backend:  http://$SERVER_IP/health"
    echo "   Docs:     http://$SERVER_IP/docs"
    echo ""
    echo "📊 Estado de servicios:"
    echo "   ✅ Nginx activo"
    echo "   ✅ Backend corriendo" 
    echo "   ✅ Frontend servido"
    echo "   ✅ PM2 gestionando procesos"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   1. Configura variables reales en /opt/ritmo/.env"
    echo "   2. Reinicia servicios: pm2 restart all"
    echo "   3. Considera configurar SSL con certbot"
else
    echo -e "${RED}❌ DEPLOYMENT TIENE $ERRORS ERRORES${NC}"
    echo "============================================"
    echo ""
    log_error "Se encontraron $ERRORS problemas que requieren atención"
    echo ""
    echo "🔧 Para diagnosticar:"
    echo "   - Revisa logs: tail -f /var/log/ritmo/*"
    echo "   - Estado PM2: pm2 logs"
    echo "   - Estado Nginx: sudo systemctl status nginx"
    echo "   - Puertos: netstat -tuln | grep ':80\\|:8001'"
fi

echo ""
echo "📅 Verificación completada: $(date)"
echo "============================================"

exit $ERRORS