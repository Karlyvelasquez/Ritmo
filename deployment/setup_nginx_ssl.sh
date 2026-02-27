#!/bin/bash

# ============================================================================
# SETUP NGINX & SSL SCRIPT - RITMO PLATFORM
# Configura Nginx como proxy reverso y opcionalmente SSL
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[NGINX]${NC} $1"
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
SERVER_IP=$(curl -s ifconfig.me || echo "46.62.165.154")
DOMAIN="${1:-$SERVER_IP}"

log_info "Configurando Nginx para dominio/IP: $DOMAIN"

# Backup de configuración existente
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup || true

# Crear configuración de Nginx
log_info "Creando configuración de Nginx..."

sudo tee /etc/nginx/sites-available/ritmo << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check directo
    location /health {
        proxy_pass http://127.0.0.1:8001/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Docs del backend
    location /docs {
        proxy_pass http://127.0.0.1:8001/docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend
    location / {
        root /opt/ritmo/ritmo-frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Logging
    access_log /var/log/nginx/ritmo_access.log;
    error_log /var/log/nginx/ritmo_error.log;
}
EOF

# Habilitar el sitio
log_info "Habilitando sitio de Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ritmo /etc/nginx/sites-enabled/

# Probar configuración
log_info "Probando configuración de Nginx..."
if sudo nginx -t; then
    log_success "Configuración de Nginx válida"
else
    log_error "Error en configuración de Nginx"
    exit 1
fi

# Reiniciar Nginx
log_info "Reiniciando Nginx..."
sudo systemctl reload nginx
sudo systemctl enable nginx

# Verificar que Nginx está corriendo
if sudo systemctl is-active nginx > /dev/null; then
    log_success "✅ Nginx está corriendo correctamente"
else
    log_error "❌ Error: Nginx no está corriendo"
    sudo systemctl status nginx
    exit 1
fi

# Configurar SSL con Certbot (opcional)
setup_ssl() {
    log_info "¿Quieres configurar SSL automáticamente? (requiere dominio válido)"
    log_warning "Solo procede si tienes un dominio apuntando a este servidor"
    
    # Instalar Certbot si no existe
    if ! command -v certbot > /dev/null; then
        log_info "Instalando Certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Obtener certificado
    log_info "Obteniendo certificado SSL para $DOMAIN..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
        log_warning "No se pudo obtener certificado SSL automáticamente"
        log_info "Configura SSL manualmente más tarde con: sudo certbot --nginx -d $DOMAIN"
        return 1
    }
    
    # Configurar renovación automática
    sudo systemctl enable certbot.timer
    log_success "✅ SSL configurado correctamente"
}

# Mostrar estado final
log_success "================================"
log_success "🌐 NGINX CONFIGURADO CORRECTAMENTE"
log_success "================================"
echo ""
log_info "URLs disponibles:"
log_info "🏠 Frontend:    http://$DOMAIN"
log_info "🔧 Backend API: http://$DOMAIN/api/"
log_info "📊 Health:      http://$DOMAIN/health"
log_info "📖 Docs:       http://$DOMAIN/docs"
echo ""

# Preguntar por SSL solo si es un dominio (no IP)
if [[ $DOMAIN =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_warning "⚠️  Usando IP, SSL no está disponible"
    log_info "Para SSL, configura un dominio y ejecuta: sudo certbot --nginx"
else
    log_info "Para configurar SSL automáticamente, ejecuta:"
    log_info "sudo certbot --nginx -d $DOMAIN"
fi

log_success "✅ Configuración de Nginx completada!"