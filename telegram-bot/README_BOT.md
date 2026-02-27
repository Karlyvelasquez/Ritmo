# RITMO Telegram Bot - Guía de Uso

## Problema Resuelto

El bot de Telegram tenía conflictos por múltiples instancias ejecutándose simultáneamente, causando el error:
```
Conflict: terminated by other getUpdates request; make sure that only one bot instance is running
```

## Solución Implementada

Se crearon scripts utilitarios para manejo seguro del bot:

### 1. `safe_start.py` - Inicio Seguro del Bot

**Uso recomendado:** Utiliza este script siempre para iniciar el bot.

```bash
cd "C:\Users\karly\Documents\RITMO desarrollo\Ritmo\telegram-bot"
python safe_start.py
```

**¿Qué hace?**
- Detecta y termina instancias previas del bot
- Limpia el webhook de Telegram automáticamente  
- Inicia el bot de forma segura
- Evita conflictos de múltiples instancias

### 2. `cleanup_bot.py` - Limpieza Manual

**Uso:** Cuando necesites limpiar manualmente sin iniciar el bot.

```bash
python cleanup_bot.py
```

**¿Qué hace?**
- Limpia el webhook de Telegram
- Termina procesos duplicados del bot

### 3. `stop_bot.py` - Detener Bot

**Uso:** Para detener todas las instancias del bot de forma segura.

```bash
python stop_bot.py
```

**¿Qué hace?**
- Encuentra todas las instancias del bot ejecutándose
- Las detiene de forma ordenada

## Instrucciones de Uso

### Para Iniciar el Bot:
```bash
# Opción 1: Inicio seguro (RECOMENDADO)
python safe_start.py

# Opción 2: Solo si estás seguro de que no hay conflictos
python bot.py
```

### Para Detener el Bot:
```bash
# Opción 1: Ctrl+C en la terminal donde está corriendo
# Opción 2: Script utilitario
python stop_bot.py
```

### En Caso de Problemas:
```bash
# Limpieza manual
python cleanup_bot.py

# Luego reiniciar
python safe_start.py
```

## Configuración

### Variables de Entorno
El bot necesita estas variables en el archivo `.env`:

```env
# Token del bot (ambos formatos por compatibilidad)
BOT_TOKEN=8597946447:AAFOv0s1A5UWGBMcBIuEqyh1UkjIkHQiMNA
TELEGRAM_BOT_TOKEN=8597946447:AAFOv0s1A5UWGBMcBIuEqyh1UkjIkHQiMNA

# OpenAI para respuestas IA
OPENAI_API_KEY=tu_api_key_aqui

# Supabase para base de datos
SUPABASE_URL=https://kypbabqsxncrpjvkhdsc.supabase.co
SUPABASE_KEY=tu_supabase_key

# Backend RITMO
RITMO_BACKEND_URL=http://127.0.0.1:8001
```

## Estado Actual

✅ **Bot funcionando correctamente**
- Sin conflictos de múltiples instancias
- Webhook limpio
- Polling funcionando correctamente
- Responde a mensajes de usuarios

## Troubleshooting

### Si obtienes errores de conflicto:
1. Ejecuta `python stop_bot.py`
2. Espera 5 segundos
3. Ejecuta `python safe_start.py`

### Si obtienes errores de Unicode en Windows:
Los scripts ya están configurados para evitar emojis problemáticos.

### Si el bot no responde:
1. Verifica que el token sea correcto
2. Verifica que el backend RITMO esté ejecutándose
3. Revisa los logs para errores específicos