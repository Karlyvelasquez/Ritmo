# Usar Python 3.11 como base
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de requirements
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Crear usuario no-root para mayor seguridad
RUN groupadd -r botuser && useradd -r -g botuser botuser
RUN chown -R botuser:botuser /app
USER botuser

# Comando de inicio
CMD ["python", "run.py"]