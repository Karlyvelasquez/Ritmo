#!/bin/bash

# ============================================================================
# MAIN DEPLOYMENT SCRIPT - RITMO PLATFORM
# ============================================================================

set -e

# Configuration
SERVER_IP="46.62.165.154"
SERVER_USER="ubuntu"
SERVER_PASSWORD="sdfs4P7HmVncekTe9NWn"
DEPLOYMENT_MODE="${1:-basic}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Test SSH connection
test_ssh_connection() {
    log_info "Probando conexión SSH..."
    if sshpass -p "$SERVER_PASSWORD" ssh -o "StrictHostKeyChecking=no" -o "ConnectTimeout=10" "$SERVER_USER@$SERVER_IP" "echo 'SSH OK'" >/dev/null 2>&1; then
        log_success "Conexión SSH establecida correctamente"
        return 0
    else
        log_error "No se puede conectar por SSH"
        return 1
    fi
}

# Upload file to server
upload_file() {
    local local_file="$1"
    local remote_path="$2"
    
    log_info "Subiendo $local_file a $remote_path"
    if sshpass -p "$SERVER_PASSWORD" scp -o "StrictHostKeyChecking=no" "$local_file" "$SERVER_USER@$SERVER_IP:$remote_path"; then
        log_success "Archivo subido: $local_file"
    else
        log_error "Error subiendo: $local_file"
        return 1
    fi
}

# Execute command on server
execute_remote() {
    local command="$1"
    log_info "Ejecutando: $command"
    sshpass -p "$SERVER_PASSWORD" ssh -o "StrictHostKeyChecking=no" "$SERVER_USER@$SERVER_IP" "$command"
}

# Main deployment function
deploy_application() {
    log_info "Iniciando despliegue de RITMO en modo: $DEPLOYMENT_MODE"
    
    # Test connection first
    if ! test_ssh_connection; then
        log_error "No se puede establecer conexión SSH. Verifica las credenciales."
        exit 1
    fi
    
    # Create deployment directory on server
    execute_remote "sudo mkdir -p /opt/ritmo/deployment"
    execute_remote "sudo chown -R $SERVER_USER:$SERVER_USER /opt/ritmo"
    
    # Upload deployment scripts
    log_info "Subiendo archivos de despliegue..."
    upload_file "deployment/setup_server.sh" "/opt/ritmo/deployment/"
    upload_file "deployment/deploy_app.sh" "/opt/ritmo/deployment/"
    upload_file "deployment/setup_nginx_ssl.sh" "/opt/ritmo/deployment/"
    upload_file "deployment/.env.production" "/opt/ritmo/"
    
    # Make scripts executable
    execute_remote "chmod +x /opt/ritmo/deployment/*.sh"
    
    case $DEPLOYMENT_MODE in
        "server-only")
            log_info "Configurando solo el servidor..."
            execute_remote "cd /opt/ritmo/deployment && ./setup_server.sh"
            ;;
        "app-only")
            log_info "Desplegando solo la aplicación..."
            execute_remote "cd /opt/ritmo/deployment && ./deploy_app.sh"
            ;;
        "ssl-only")
            log_info "Configurando solo SSL..."
            execute_remote "cd /opt/ritmo/deployment && ./setup_nginx_ssl.sh"
            ;;
        "full"|*)
            log_info "Despliegue completo..."
            execute_remote "cd /opt/ritmo/deployment && ./setup_server.sh"
            sleep 5
            execute_remote "cd /opt/ritmo/deployment && ./deploy_app.sh"
            sleep 5
            execute_remote "cd /opt/ritmo/deployment && ./setup_nginx_ssl.sh"
            ;;
    esac
    
    log_success "¡Despliegue completado!"
    log_info "Ejecutando verificaciones..."
    
    # Run verification
    if [ -f "verify_deployment.sh" ]; then
        bash verify_deployment.sh
    fi
    
    log_success "================================"
    log_success "🚀 RITMO DESPLEGADO EXITOSAMENTE"
    log_success "================================"
    echo ""
    log_info "URLs de la aplicación:"
    log_info "🌐 Frontend: http://$SERVER_IP"
    log_info "🔧 Backend:  http://$SERVER_IP:8001"
    log_info "📊 Health:   http://$SERVER_IP:8001/health"
    echo ""
    log_warning "⚠️  IMPORTANTE: Configura las variables de entorno en /opt/ritmo/.env"
    log_warning "⚠️  SUPABASE_URL y SUPABASE_ANON_KEY son necesarios para que funcione"
}

# Help function
show_help() {
    echo "Uso: $0 [modo]"
    echo ""
    echo "Modos disponibles:"
    echo "  full         - Despliegue completo (default)"
    echo "  server-only  - Solo configuración del servidor"
    echo "  app-only     - Solo despliegue de la aplicación"
    echo "  ssl-only     - Solo configuración SSL"
    echo ""
    echo "Ejemplo: $0 full"
}

# Check if sshpass is installed
if ! command -v sshpass >/dev/null 2>&1; then
    log_error "sshpass no está instalado"
    log_info "Instala con: sudo apt install sshpass (Linux) o brew install hudochenkov/sshpass/sshpass (Mac)"
    exit 1
fi

# Main execution
case "${1:-full}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        deploy_application
        ;;
esac