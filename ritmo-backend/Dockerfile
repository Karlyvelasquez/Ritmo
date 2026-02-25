# Dockerfile para Ritmo Backend (FastAPI)
FROM python:3.11-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar requirements y código fuente
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Exponer el puerto por defecto de FastAPI
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
