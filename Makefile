# Makefile para proyecto RITMO

.PHONY: help build up down logs restart clean setup

# Mostrar ayuda por defecto
help:
	@echo "🎵 RITMO - Comandos disponibles:"
	@echo ""
	@echo "  setup     - Configura el entorno inicial"
	@echo "  build     - Construye todas las imágenes"
	@echo "  up        - Inicia todos los servicios"
	@echo "  down      - Detiene todos los servicios"
	@echo "  restart   - Reinicia todos los servicios"
	@echo "  logs      - Muestra logs en tiempo real"
	@echo "  clean     - Limpia imágenes y volúmenes no utilizados"
	@echo ""
	@echo "Ejemplo: make setup && make up"

# Configuración inicial
setup:
	@echo "🔧 Configurando entorno..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📝 Archivo .env creado. Edítalo con tus configuraciones."; \
	else \
		echo "✅ Archivo .env ya existe."; \
	fi

# Construir imágenes
build:
	@echo "🔨 Construyendo imágenes..."
	docker-compose build

# Iniciar servicios
up:
	@echo "🚀 Iniciando servicios..."
	docker-compose up -d
	@echo "✅ Servicios iniciados!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:8000"
	@echo "📚 API Docs: http://localhost:8000/docs"

# Detener servicios
down:
	@echo "🛑 Deteniendo servicios..."
	docker-compose down

# Reiniciar servicios
restart: down up

# Ver logs
logs:
	@echo "📊 Mostrando logs (Ctrl+C para salir)..."
	docker-compose logs -f

# Limpiar sistema Docker
clean:
	@echo "🧹 Limpiando sistema Docker..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ Limpieza completada!"

# Desarrollo: reconstruir y reiniciar
dev: down build up logs