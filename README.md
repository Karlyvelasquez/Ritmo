# RITMO - Onboarding Conversacional Inteligente

Sistema de onboarding conversacional que detecta automáticamente la etapa de vida del usuario mediante preguntas dinámicas y genera códigos secretos únicos.

## 🚀 Características Principales

### ✨ Onboarding Conversacional Inteligente
- **Detección automática** de etapa de vida (joven, adulto_activo, inmigrante, persona_mayor)
- **Preguntas dinámicas** - máximo 2 por categoría, entre 4-6 total
- **Sistema de puntuación** con análisis de palabras clave e intención
- **Umbral de confianza** para determinar cuándo parar
- **Sin formularios tradicionales** - conversación natural

### 🔐 Generación de Código Secreto
- Código único de 4 dígitos numéricos
- Verificación de unicidad en base de datos
- Generación automática al finalizar onboarding
- Mensaje final amigable y humano

### 🏗️ Arquitectura Robusta
- FastAPI backend con Supabase
- Agentes especializados modulares
- Gestión de sesiones temporales
- Docker completamente configurado

## 📁 Estructura del Proyecto

```
Ritmo/
├── ritmo-backend/              # Backend FastAPI
│   ├── main.py                 # Aplicación principal
│   ├── models/
│   │   └── schemas.py          # Modelos Pydantic actualizados
│   ├── routers/
│   │   ├── contexto.py         # Endpoints existentes
│   │   ├── chat.py             # Chat endpoints
│   │   ├── admin.py            # Administración
│   │   └── onboarding.py       # 🆕 Onboarding conversacional
│   ├── agents/
│   │   ├── contexto_vida.py    # Agentes existentes
│   │   ├── conversacional.py   
│   │   ├── habitos.py          
│   │   ├── orquestador.py      
│   │   ├── patrones.py         
│   │   ├── prediccion_ml.py    
│   │   └── onboarding.py       # 🆕 Agente onboarding inteligente
│   ├── db/
│   │   ├── supabase_client.py  # Cliente Supabase actualizado
│   │   ├── sesiones.py         # Sesiones existentes
│   │   ├── usuarios.py         # 🆕 Gestión de usuarios
│   │   └── onboarding_sessions.py # 🆕 Sesiones temporales
│   ├── requirements.txt        # Dependencias Python
│   └── Dockerfile              # 🆕 Contenedor backend
├── telegram-bot/               # Bot Telegram existente
│   └── Dockerfile              # 🆕 Contenedor bot
├── nginx/                      # 🆕 Configuración proxy
│   └── nginx.conf              
├── database/                   # 🆕 Scripts SQL
│   └── init_usuarios.sql       # Inicialización base de datos
├── docker-compose.yml          # 🆕 Orquestación completa
├── .env.example                # 🆕 Variables de entorno ejemplo
└── README.md                   # Esta documentación
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Docker & Docker Compose
- Cuenta Supabase configurada
- Python 3.11+ (para desarrollo local)

### 1. Configurar Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor
-- El archivo completo está en database/init_usuarios.sql
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    etapa_vida VARCHAR(20) NOT NULL CHECK (etapa_vida IN ('joven', 'adulto_activo', 'inmigrante', 'persona_mayor')),
    modo_comunicacion VARCHAR(10) NOT NULL CHECK (modo_comunicacion IN ('texto', 'voz')),
    zona_horaria VARCHAR(50) DEFAULT 'America/Bogota',
    telegram_id VARCHAR(50) UNIQUE NOT NULL,
    onboarding_completado BOOLEAN DEFAULT FALSE,
    codigo_secreto VARCHAR(4) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

```env
# Configuración mínima requerida
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-supabase
BOT_TOKEN=tu-token-telegram  # Opcional para bot
```

### 3. Ejecutar con Docker

```bash
# Desarrollo completo
docker-compose up --build

# Solo backend
docker-compose up ritmo-backend

# Producción con nginx
docker-compose --profile production up
```

### 4. Desarrollo Local (Opcional)

```bash
cd ritmo-backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📱 Uso del Sistema

### Endpoints del Onboarding

#### 1. Iniciar Onboarding
```http
POST /onboarding/iniciar
Content-Type: application/json

{
    "telegram_id": "user123",
    "nombre": "Juan Pérez"
}
```

**Respuesta:**
```json
{
    "mensaje": "¡Hola Juan! 👋\n\nSoy tu asistente personal de RITMO...\n\nPregunta 1:\n\n¿En qué momento de tu vida te encuentras ahora?",
    "completado": false,
    "etapa_detectada": null,
    "codigo_secreto": null,
    "pregunta_numero": 1,
    "sesion_id": "uuid-de-sesion"
}
```

#### 2. Responder Pregunta
```http
POST /onboarding/responder
Content-Type: application/json

{
    "telegram_id": "user123",
    "respuesta": "Estoy estudiando en la universidad y buscando mi primer trabajo",
    "sesion_id": "uuid-de-sesion"
}
```

#### 3. Finalización Automática
Cuando el sistema tenga suficiente confianza (después de 4-6 preguntas):

```json
{
    "mensaje": "🎉 ¡Perfecto! Tu perfil ha sido creado exitosamente.\n\n🔐 **Tu código secreto es:** `1234`\n\n¡Bienvenido/a a RITMO!",
    "completado": true,
    "etapa_detectada": "joven",
    "codigo_secreto": "1234",
    "pregunta_numero": 5,
    "sesion_id": "uuid-de-sesion"
}
```

### Otros Endpoints

```http
# Verificar estado de sesión
GET /onboarding/estado/{sesion_id}

# Cancelar onboarding
DELETE /onboarding/cancelar/{sesion_id}

# Estadísticas del sistema
GET /onboarding/estadisticas

# Documentación interactiva
GET /docs
```

## 🤖 Sistema de Clasificación

### Etapas Detectables
1. **joven** - Estudiantes, inicio de carrera profesional
2. **adulto_activo** - Profesionales establecidos, responsabilidades familiares
3. **inmigrante** - Personas en proceso de adaptación a nuevo país
4. **persona_mayor** - Jubilados, etapa de experiencia y sabiduría

### Banco de Preguntas por Categoría
- **edad_contexto** - Situación actual y planes
- **tecnologia** - Adaptación a tecnologías
- **familia** - Situación familiar y rol
- **trabajo** - Actividad laboral actual y futura
- **tiempo_libre** - Actividades y preferencias

### Algoritmo de Selección
1. **Pregunta inicial**: Siempre de categoría "edad_contexto"
2. **Máximo 2 preguntas por categoría**
3. **Prioridad a categorías no exploradas**
4. **Detención por confianza**: Umbral del 70%
5. **Rango de preguntas**: 4-6 total

## 🔍 Monitoreo y Logs

### Logs del Sistema
```bash
# Ver logs en tiempo real
docker-compose logs -f ritmo-backend

# Logs específicos del onboarding
docker-compose logs -f | grep onboarding
```

### Métricas Disponibles
- Sesiones activas de onboarding
- Distribución por etapa de vida detectada
- Tiempo promedio de completación
- Tasa de conversión del onboarding

## 🛠️ Desarrollo y Contribución

### Estructura del Agente de Onboarding
```python
# agents/onboarding.py
class OnboardingAgent:
    def iniciar_onboarding()           # Crear nueva sesión
    def obtener_siguiente_pregunta()   # Selección inteligente
    def procesar_respuesta()           # Análisis y puntuación
    def _clasificar_usuario()          # Algoritmo de clasificación
```

### Añadir Nuevas Preguntas
```python
# En agents/onboarding.py - método _inicializar_banco_preguntas()
PreguntaOnboarding(
    id="nueva_01",
    categoria="nueva_categoria",
    pregunta="¿Tu nueva pregunta aquí?",
    palabras_clave={
        "joven": ["palabra1", "palabra2"],
        "adulto_activo": ["palabra3", "palabra4"],
        # ...
    },
    peso=1.2
)
```

### Testing
```bash
# Ejecutar tests
cd ritmo-backend
python -m pytest tests/ -v

# Test específico del onboarding
python -m pytest tests/test_onboarding.py -v
```

## 🚀 Despliegue en Producción

### 1. Preparar Entorno
```bash
# Variables de entorno de producción
ENVIRONMENT=production
SUPABASE_URL=https://prod-supabase.co
# ... otras variables
```

### 2. Desplegar con Docker
```bash
# Con nginx y SSL
docker-compose --profile production up -d

# Verificar servicios
docker-compose ps
```

### 3. Configurar SSL (Opcional)
```bash
# Colocar certificados en nginx/certs/
# Descomentar configuración SSL en nginx.conf
```

## 📊 Mejoras Futuras

- [ ] Integración con Redis para sesiones
- [ ] Análisis de sentimientos en respuestas
- [ ] Preguntas adaptativas basadas en ML
- [ ] Dashboard de analytics en tiempo real
- [ ] Soporte multiidioma
- [ ] API de webhooks para integración externa

## 🐛 Troubleshooting

### Problemas Comunes

**Error de conexión Supabase:**
```bash
# Verificar variables de entorno
docker-compose exec ritmo-backend cat /app/.env

# Verificar logs
docker-compose logs ritmo-backend
```

**Sesiones expiradas:**
```http
# Limpiar sesiones manualmente
GET /onboarding/estadisticas
```

**Códigos secretos duplicados:**
- El sistema maneja automáticamente la unicidad
- Máximo 100 reintentos antes de fallar

## 📞 Soporte

Para issues y mejoras, abrir ticket en el repositorio del proyecto.

---

**Desarrollado con ❤️ para RITMO - Sistema de Acompañamiento Inteligente**

| Perfil | Cómo responde RITMO |
|--------|---------------------|
| 👴 **Persona mayor (+70)** | Frases cortas, ritmo lento, prioridad audio, nunca la apresura |
| 🧑‍🎓 **Joven** | Cercano sin ser forzado, valida antes de sugerir, entiende la ansiedad no nombrada |
| 💼 **Adulto activo** | Reconoce el cansancio como válido, no añade presión, tono directo |
| 🌍 **Migrante o refugiado** | Entiende el desarraigo, valida sin comparar, no asume red de apoyo cercana |
| ♿ **Discapacidad visual** | Todo por audio, sin referencias visuales, pausas, claridad máxima |

---

## Características principales

**🤝 Acompañamiento proactivo**
RITMO no espera a que le escribas. Si detecta señales de aislamiento o malestar, es él quien abre la conversación. Con suavidad. Sin alarmar.

**🔇 El silencio como feature**
A veces la respuesta correcta es no decir nada. RITMO sabe cuándo ese día no hace falta hablar y solo acompaña con presencia.

**🧠 Memoria continua**
Recuerda lo que importa entre sesiones. Si el martes mencionaste que estabas nervioso por algo, el miércoles pregunta cómo te fue.

**📱 Bot de Telegram**
El usuario puede hablar con RITMO desde Telegram como si fuera un amigo. La IA reconoce quién es, accede a su perfil, y continúa donde lo dejaron. Incluso puede decir: *"Anoche entraste a la app a las 3am, ¿todo bien?"*

**📊 Panel para investigadores**
Entidades de salud, ONG e instituciones pueden ver tendencias agregadas y anonimizadas: qué dolores son más frecuentes en jóvenes, cómo está el estado emocional de una región, qué hábitos se abandonan más. Sin datos individuales. Sin nombres. Solo conocimiento para actuar.

**🔒 Privacidad por diseño**
RITMO no vigila. No controla. No comparte datos individuales. Las señales que recoge son para entender, no para juzgar. El panel de investigación usa k-anonimato mínimo de 5 usuarios.

---

## Impacto social

RITMO está diseñado desde y para España, con sus horarios reales, su cultura, su forma de vivir lo social y el descanso. No con consejos genéricos de internet.

Está guiado por un marco claro de hábitos basado en evidencia y psicología real. No improvisa.

Y lo más importante: **no intenta arreglar a la persona. Intenta acompañarla.**

No reemplaza a un terapeuta. No promete curar nada. Solo ayuda a que la persona se entienda mejor, se cuide sin presión, y no se sienta sola.

---

## Tecnología

| Componente | Tecnología |
|------------|------------|
| Frontend | React · PWA |
| Backend | Python · FastAPI |
| IA principal | Claude API (Anthropic) |
| Base de datos | Supabase (PostgreSQL) |
| Bot | Telegram · python-telegram-bot |
| ML | scikit-learn · Regresión logística |
| Señales | Browser APIs · Eventos de comportamiento |

---

## El equipo

Somos cuatro ingenieras con una convicción clara: la tecnología más poderosa no es la que hace más cosas, sino la que sabe cuándo no hacer nada.

---

## OdiseIA4Good 2026

Este proyecto nació en el **II Hackathon Internacional de IA para Colectivos Vulnerables**, organizado por OdiseIA con el apoyo de Google.org y la Fundación Pablo VI. Su misión: usar la inteligencia artificial para crear soluciones que transformen la vida de quienes más lo necesitan.

---

*RITMO · OdiseIA4Good 2026 · Madrid*