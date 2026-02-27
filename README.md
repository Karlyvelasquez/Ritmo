# RITMO: Plataforma Inteligente de Acompañamiento Psicosocial

RITMO es un ecosistema tecnológico integral diseñado para el acompañamiento y protección de poblaciones en situación de vulnerabilidad. La plataforma combina inteligencia artificial empática, análisis predictivo de riesgo y comunicación multicanal para ofrecer un apoyo personalizado y proactivo.

---

##  Arquitectura del Sistema

La solución se basa en una arquitectura de microservicios contenerizada con Docker:

### 1. **RITMO Frontend (React + Vite)**
- **Tecnología:** React 19, Vite, Chart.js, Recharts.
- **Función:** Panel administrativo integral para la visualización de datos, seguimiento de usuarios y alertas críticas.
- **Acceso:** http://localhost (a través de Nginx).

### 2. **RITMO Backend (FastAPI)**
- **Tecnología:** Python 3.11, FastAPI, Pydantic, Scikit-learn.
- **Función:** Core de orquestación, endpoints de telemetría, gestión de sesiones y motor de análisis de contexto de vida.
- **IA:** Integración robusta con la API de OpenAI (GPT-4o-mini).
- **Acceso API:** http://localhost:8000/docs.

### 3. **Telegram Bot (Python)**
- **Tecnología:** \python-telegram-bot\ (v20.7+), OpenAI SDK.
- **Función:** Canal principal de interacción con el usuario. Implementa check-ins diarios, análisis proactivo y comunicación directa.
- **Resiliencia:** Sistema de bloqueo de instancia única y reintentos automáticos para garantizar alta disponibilidad sin conflictos de polling.

### 4. **Base de Datos (Supabase)**
- **Tecnología:** PostgreSQL + RLS (Row Level Security).
- **Función:** Almacenamiento seguro, persistencia de conversaciones y gestión de metadatos de usuario.

---

##  Despliegue con Docker (Recomendado)

El proyecto incluye un \Makefile\ y archivos \docker-compose\ para un despliegue inmediato.

### Prerrequisitos
- Docker & Docker Compose
- Archivo \.env\ configurado (ver sección de variables)

### Inicio Rápido
Desde la raíz del proyecto:

\\\ash
# 1. Preparar archivos de configuración
make setup

# 2. Levantar la plataforma completa
make up
\\\

### Comandos de Mantenimiento
- \make build\: Reconstruye las imágenes de los servicios.
- \make restart\: Reinicia todos los contenedores.
- \make logs\: Visualiza los logs de todos los servicios.
- \make clean\: Elimina contenedores, imágenes y volúmenes huérfanos.

---

##  Módulos Críticos de Inteligencia Artificial

### **Agente Orquestador Central**
Ubicado en \
itmo-backend/agents/orquestador.py\, este módulo centraliza la toma de decisiones:
- Evalúa el sentimiento y tono de la conversación.
- Decide entre una respuesta empática inmediata o la activación de protocolos proactivos.
- Integra datos del modelo de riesgo para priorizar intervenciones humanas cuando sea necesario.

### **Modelo de Análisis de Riesgo (ML)**
Implementado en \	elegram-bot/entrenar_modelo_riesgo.py\ y \
itmo-backend/agents/prediccion_ml.py\:
- Utiliza algoritmos de Scikit-learn para predecir niveles de vulnerabilidad basados en patrones de vida (sueño, hábitos, interacción).
- Genera alertas dinámicas visualizadas en el Dashboard administrativo.

### **Gestión de Sesiones e Identificación**
El sistema realiza un *Onboarding* conversacional inteligente para identificar automáticamente la etapa de vida (joven, migrante, adulto mayor, etc.) sin formularios invasivos, adaptando el tono y la estrategia de acompañamiento desde el primer contacto.

---

##  Estructura del Repositorio

\\\	ext
Ritmo/
 ritmo-backend/      # API, Orquestación de Agentes y Lógica de Negocio
 ritmo-frontend/     # Interfaz administrativa y visualización de datos
 telegram-bot/       # Canal de interacción con el usuario (Bot principal)
 nginx/              # Configuración de servidor y proxy reverso
 docker-compose.yml  # Definición de la infraestructura contenerizada
 Makefile            # Herramientas de automatización para desarrollo y despliegue
\\\

---

##  Variables de Envorno (.env)

El archivo \.env\ en la raíz debe contener (ver [.env.example](.env.example)):

| Variable | Descripción |
|----------|-------------|
| \OPENAI_API_KEY\ | Credencial para el procesamiento de IA. |
| \BOT_TOKEN\ | Token de Telegram BotFather. |
| \SUPABASE_URL\ | URL de la instancia de base de datos. |
| \SUPABASE_KEY\ | Clave anónima/pública de Supabase. |
| \ENVIRONMENT\ | Definido como \production\ para despliegues estables. |

---

*Desarrollado para el acompañamiento tecnológico con impacto social directo.*
