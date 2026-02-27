# RITMO - Plataforma de Acompañamiento para Poblaciones Vulnerables

RITMO es una plataforma integral de acompañamiento psicosocial diseñada para apoyar a poblaciones vulnerables a través de tecnología conversacional inteligente. La plataforma combina análisis de patrones de vida, inteligencia artificial y comunicación multicanal para ofrecer apoyo personalizado y seguimiento continuo.

## Descripción del Producto

RITMO identifica automáticamente la etapa de vida y necesidades específicas de cada usuario mediante conversación natural, proporcionando acompañamiento adaptado a sus circunstancias particulares. La plataforma está especialmente diseñada para trabajar con:

- **Jóvenes en situación de vulnerabilidad**: Orientación educativa y laboral
- **Adultos en transición laboral**: Apoyo en reubicación profesional y desarrollo de habilidades
- **Población migrante**: Adaptación cultural y acceso a servicios básicos
- **Personas mayores**: Acompañamiento social y acceso a servicios de salud

## Funcionamiento Principal

### 1. Proceso de Identificación Inteligente
El sistema utiliza conversación natural para determinar la etapa de vida del usuario sin formularios tradicionales. A través de 4-6 preguntas dinámicas, la plataforma identifica:

- Situación socioeconómica actual
- Necesidades inmediatas
- Recursos disponibles
- Objetivos a corto y mediano plazo

### 2. Generación de Perfil Personalizado
Basándose en la información recolectada, RITMO genera:

- Código de acceso único para cada usuario
- Perfil de necesidades específicas
- Plan de acompañamiento inicial
- Conexión con recursos apropiados

### 3. Seguimiento Continuo
La plataforma mantiene comunicación regular a través de:

- Bot de Telegram integrado
- Interfaz web adaptable
- Notificaciones personalizadas
- Seguimiento de objetivos

## Arquitectura Tecnológica

La plataforma está construida con tecnologías modernas que garantizan escalabilidad y confiabilidad:

### Backend (FastAPI)
- API RESTful para gestión de usuarios y sesiones
- Agentes de inteligencia artificial especializados
- Integración con base de datos Supabase
- Sistema de autenticación seguro

### Frontend (React/Vite)
- Interfaz web responsive
- Dashboard adaptado por tipo de usuario
- Formularios de registro inteligentes
- Visualización de progreso

### Bot de Telegram
- Comunicación directa con usuarios
- Procesamiento de lenguaje natural
- Seguimiento de check-ins
- Notificaciones automáticas

### Base de Datos (Supabase)
- Almacenamiento seguro de información de usuarios
- Gestión de sesiones temporales
- Historial de interacciones
- Análisis de patrones

## Estructura del Proyecto

```
Ritmo/
├── ritmo-backend/              # API Backend (FastAPI)
│   ├── main.py                 # Aplicación principal
│   ├── models/
│   │   └── schemas.py          # Modelos de datos
│   ├── routers/
│   │   ├── onboarding.py       # Proceso de registro inteligente
│   │   ├── chat.py             # Comunicación con usuarios
│   │   ├── admin.py            # Panel administrativo
│   │   └── health.py           # Monitoreo del sistema
│   ├── agents/
│   │   ├── onboarding.py       # Agente de identificación
│   │   ├── contexto_vida.py    # Análisis de contexto
│   │   └── orquestador.py      # Coordinación de agentes
│   ├── db/
│   │   ├── supabase_client.py  # Conectividad base de datos
│   │   ├── usuarios.py         # Gestión de usuarios
│   │   └── sesiones.py         # Manejo de sesiones
│   └── requirements.txt        # Dependencias Python
├── ritmo-frontend/             # Interfaz Web (React)
│   └── landing/
│       ├── src/
│       │   ├── pages/          # Páginas principales
│       │   ├── components/     # Componentes reutilizables
│       │   └── features/       # Funcionalidades específicas
│       ├── package.json        # Dependencias Node.js
│       └── vite.config.js      # Configuración del bundler
├── telegram-bot/               # Bot de Telegram
│   ├── bot.py                  # Aplicación principal del bot
│   ├── handlers.py             # Manejadores de eventos
│   ├── agents/                 # Agentes especializados
│   └── requirements.txt        # Dependencias del bot
├── deployment/                 # Scripts de despliegue
│   ├── setup_server.sh         # Configuración inicial del servidor
│   ├── deploy_app.sh           # Despliegue de la aplicación
│   └── nginx.conf              # Configuración del proxy
├── docker-compose.yml          # Orquestación de servicios
└── .env.example                # Template de variables de entorno
```

## Configuración e Instalación

### Requisitos Previos

- **Base de datos**: Cuenta activa en Supabase
- **Bot de Telegram**: Token obtenido de @BotFather  
- **Entorno de desarrollo**: Python 3.11+, Node.js 18+
- **Despliegue**: Docker y Docker Compose (opcional)

### Configuración Inicial

1. **Base de Datos Supabase**
   ```sql
   -- Crear tabla de usuarios
   CREATE TABLE usuarios (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       nombre VARCHAR(100) NOT NULL,
       etapa_vida VARCHAR(20) CHECK (etapa_vida IN ('joven', 'adulto_activo', 'inmigrante', 'persona_mayor')),
       telegram_id VARCHAR(50) UNIQUE NOT NULL,
       codigo_secreto VARCHAR(4) UNIQUE NOT NULL,
       onboarding_completado BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Variables de Entorno**
   ```env
   # Configuración de Supabase
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-clave-anon-supabase
   
   # Token del Bot de Telegram
   TELEGRAM_BOT_TOKEN=1234567890:AABBCCDDEEFFggHHiiJJkkLLmmN
   
   # Configuración del servidor
   HOST=0.0.0.0
   PORT=8001
   ENVIRONMENT=development
   ```

### Instalación para Desarrollo

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repositorio]
   cd Ritmo
   ```

2. **Configurar Backend**
   ```bash
   cd ritmo-backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

3. **Configurar Frontend**
   ```bash
   cd ritmo-frontend/landing
   npm install
   ```

4. **Configurar Bot de Telegram**
   ```bash
   cd telegram-bot
   pip install -r requirements.txt
   ```

### Ejecución en Desarrollo

1. **Iniciar Backend**
   ```bash
   cd ritmo-backend
   python main.py
   # API disponible en: http://localhost:8001
   ```

2. **Iniciar Frontend**
   ```bash
   cd ritmo-frontend/landing
   npm run dev
   # Aplicación disponible en: http://localhost:3000
   ```

3. **Iniciar Bot de Telegram**
   ```bash
   cd telegram-bot  
   python bot.py
   ```

## API y Uso del Sistema

### Endpoints Principales

#### Proceso de Registro Inteligente
```http
POST /onboarding/iniciar
Content-Type: application/json

{
    "telegram_id": "123456789",
    "nombre": "María González"
}
```

**Respuesta inicial:**
```json
{
    "mensaje": "Hola María! Soy tu asistente personal de RITMO. Te haré algunas preguntas para conocerte mejor...",
    "completado": false,
    "sesion_id": "uuid-generado",
    "pregunta_numero": 1
}
```

#### Continuación del Diálogo
```http
POST /onboarding/responder
Content-Type: application/json

{
    "telegram_id": "123456789",
    "respuesta": "Soy estudiante universitaria y busco mi primer empleo",
    "sesion_id": "uuid-generado"
}
```

#### Finalización del Registro
Al completar el análisis (4-6 preguntas), el sistema genera automáticamente:
```json
{
    "mensaje": "Perfecto! Tu perfil ha sido creado. Tu código de acceso es: 1234",
    "completado": true,
    "etapa_detectada": "joven",
    "codigo_secreto": "1234"
}
```

### Otros Endpoints Disponibles

- `GET /health` - Estado del sistema
- `GET /docs` - Documentación interactiva de la API
- `POST /onboarding/login` - Autenticación con código secreto
- `GET /admin/dashboard` - Panel administrativo

## Sistema de Clasificación de Usuarios

### Perfiles Identificables

**Joven (18-30 años)**
- Características: Estudiante, inicio de carrera, búsqueda de independencia
- Necesidades: Orientación laboral, desarrollo de habilidades, red de apoyo

**Adulto Activo (30-55 años)**
- Características: Profesional establecido, responsabilidades familiares
- Necesidades: Equilibrio trabajo-vida, capacitación, planificación financiera

**Migrante**
- Características: Adaptación cultural, barreras idiomáticas
- Necesidades: Acceso a servicios, integración social, documentación

**Persona Mayor (65+ años)**
- Características: Jubilado, experiencia acumulada, posible aislamiento
- Necesidades: Acompañamiento social, acceso a salud, actividades

### Algoritmo de Identificación

El sistema utiliza un enfoque conversacional que:

1. **Inicia con pregunta abierta** sobre situación actual
2. **Analiza palabras clave** en las respuestas usando puntuación ponderada
3. **Adapta preguntas siguientes** según las respuestas anteriores
4. **Determina perfil** cuando alcanza umbral de confianza (70%)
5. **Limita interacción** a máximo 6 preguntas para evitar fatiga

## Despliegue en Producción

### Infraestructura Recomendada

- **Servidor**: Ubuntu 20.04+ con 4GB RAM mínimo
- **Base de datos**: Instancia Supabase en producción
- **SSL**: Certificados Let's Encrypt automáticos
- **Monitoreo**: PM2 para gestión de procesos
- **Proxy**: Nginx para distribución de carga

### Scripts de Despliegue Automatizados

El proyecto incluye scripts bash para automatizar el despliegue:

```bash
# Despliegue completo en servidor nuevo
./main_deploy.sh full

# Solo actualizar código
./main_deploy.sh deploy

# Verificar estado
./main_deploy.sh status
```

Consultar [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## Desarrollo y Contribución

### Estructura de Agentes

El sistema utiliza una arquitectura basada en agentes especializados:

- **OnboardingAgent**: Gestiona el proceso de identificación
- **RitmoOrchestrator**: Coordina la comunicación general
- **MemoryAgent**: Mantiene contexto entre sesiones
- **CompanionAgent**: Proporciona respuestas empáticas

### Configuración para Desarrollo Local

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con credenciales reales
   ```

2. **Instalar dependencias:**
   ```bash
   # Backend
   cd ritmo-backend && pip install -r requirements.txt
   
   # Frontend  
   cd ritmo-frontend/landing && npm install
   
   # Bot
   cd telegram-bot && pip install -r requirements.txt
   ```

3. **Ejecutar servicios:**
   - Backend: `python main.py` (puerto 8001)
   - Frontend: `npm run dev` (puerto 3000)
   - Bot: `python bot.py`

### Testing

```bash
# Ejecutar tests del backend
cd ritmo-backend
python -m pytest tests/ -v

# Tests específicos del módulo de onboarding
python -m pytest tests/test_onboarding.py -v
```

## Monitoreo y Mantenimiento

### Logs del Sistema

```bash
# Ver logs en tiempo real (desarrollo)
tail -f ritmo-backend/logs/*.log

# Ver logs en producción
pm2 logs
```

### Métricas Importantes

- Tiempo promedio de completación del onboarding
- Distribución de perfiles identificados  
- Tasa de éxito en la clasificación
- Errores en la API

### Respaldo y Recuperación

Los datos críticos se almacenan en Supabase con respaldo automático. Para entornos de producción se recomienda:

- Respaldo diario de la base de datos
- Monitoreo de disponibilidad
- Procedimientos de recuperación documentados

## Tecnologías Utilizadas

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| API Backend | FastAPI | Endpoints REST y lógica de negocio |
| Frontend | React + Vite | Interfaz web responsive |
| Base de Datos | Supabase (PostgreSQL) | Almacenamiento de usuarios y sesiones |
| Bot | Python Telegram Bot | Comunicación directa con usuarios |
| IA | Claude API | Procesamiento de lenguaje natural |
| Infraestructura | Nginx + PM2 | Proxy reverso y gestión de procesos |
| Contenedores | Docker | Empaquetado y despliegue |

---

## Licencia y Contribución

Este proyecto fue desarrollado como parte del **II Hackathon Internacional de IA para Colectivos Vulnerables - OdiseIA4Good 2026**, organizado por OdiseIA con el apoyo de Google.org y la Fundación Pablo VI.

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Implementar cambios con tests
4. Crear Pull Request con descripción detallada

---

*RITMO - Tecnología con propósito social · 2026*