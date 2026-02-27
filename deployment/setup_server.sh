#!/bin/bash

# ============================================================================
# SETUP SERVER SCRIPT - RITMO PLATFORM
# Configura un servidor Ubuntu completamente desde cero
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
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

# Actualizar sistema
log_info "Actualizando sistema Ubuntu..."
sudo apt update -y
sudo apt upgrade -y

# Instalar dependencias básicas
log_info "Instalando dependencias básicas..."
sudo apt install -y curl wget git unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release \
    build-essential python3-dev

# Instalar Node.js 18.x
log_info "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Python 3.11
log_info "Instalando Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-pip python3.11-venv python3.11-dev

# Configurar Python 3.11 como default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
sudo update-alternatives --install /usr/bin/pip3 pip3 /usr/bin/pip3.11 1

# Instalar PM2 globalmente
log_info "Instalando PM2..."
sudo npm install -g pm2

# Instalar Nginx
log_info "Instalando Nginx..."
sudo apt install -y nginx

# Configurar firewall
log_info "Configurando firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8001

# Crear usuario para la aplicación
log_info "Configurando permisos de aplicación..."
sudo mkdir -p /opt/ritmo
sudo chown -R ubuntu:ubuntu /opt/ritmo
sudo chmod -R 755 /opt/ritmo

# Configurar Nginx básico
log_info "Configurando Nginx básico..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar servicios
log_info "Verificando instalaciones..."
node_version=$(node --version)
python_version=$(python3 --version)
pm2_version=$(pm2 --version)
nginx_status=$(sudo systemctl is-active nginx)

log_success "Node.js: $node_version"
log_success "Python: $python_version"
log_success "PM2: $pm2_version"
log_success "Nginx: $nginx_status"

# Crear directorio de logs
sudo mkdir -p /var/log/ritmo
sudo chown -R ubuntu:ubuntu /var/log/ritmo

log_success "✅ Servidor configurado correctamente!"
log_info "Próximo paso: Ejecutar deploy_app.sh"