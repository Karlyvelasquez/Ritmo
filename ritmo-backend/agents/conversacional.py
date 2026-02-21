"""
Agente Conversacional Empático
Genera respuestas humanas y empáticas usando la API de Claude
"""

import logging
from typing import Dict, List, Optional
import os
import asyncio
from datetime import datetime
import json

from models.schemas import ChatResponse, PerfilUsuario, PrediccionRiesgo

# Configurar logging
logger = logging.getLogger(__name__)

# Configuración de Claude API
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
CLAUDE_MODEL = "claude-3-sonnet-20240229"  # Modelo recomendado para conversación empática


class ClaudeAPIClient:
    """Cliente para la API de Claude (Anthropic)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
    
    async def generar_respuesta(self, prompt: str, system_prompt: str = "") -> str:
        """
        Genera respuesta usando Claude API
        
        Args:
            prompt: Prompt del usuario
            system_prompt: Instrucciones del sistema
            
        Returns:
            str: Respuesta generada por Claude
        """
        try:
            import aiohttp
            
            payload = {
                "model": CLAUDE_MODEL,
                "max_tokens": 300,  # Respuestas cortas y concisas
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "system": system_prompt if system_prompt else ""
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.base_url, 
                    headers=self.headers, 
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["content"][0]["text"]
                    else:
                        logger.error(f"Claude API error: {response.status}")
                        return self._generar_respuesta_fallback(prompt)
                        
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            return self._generar_respuesta_fallback(prompt)
    
    def _generar_respuesta_fallback(self, prompt: str) -> str:
        """Genera respuesta de fallback cuando Claude no está disponible"""
        respuestas_fallback = [
            "Entiendo lo que me dices. ¿Cómo te sientes ahora mismo?",
            "Gracias por compartir eso conmigo. Estoy aquí para escucharte.",
            "Me parece que has pasado por algo importante. ¿Te gustaría contarme más?",
            "Valoro que me hayas contado esto. ¿Cómo ha sido tu día?",
            "Es normal sentirse así a veces. ¿Hay algo específico que te preocupa?"
        ]
        # Seleccionar respuesta basada en el hash del prompt para consistencia
        import hashlib
        hash_prompt = int(hashlib.md5(prompt.encode()).hexdigest()[:8], 16)
        return respuestas_fallback[hash_prompt % len(respuestas_fallback)]


# Instancia global del cliente Claude
claude_client = ClaudeAPIClient(CLAUDE_API_KEY) if CLAUDE_API_KEY else None


async def generar_respuesta_chat(
    mensaje: str,
    estrategia: Dict,
    perfil: PerfilUsuario,
    contexto_previo: List[Dict[str, str]],
    prediccion_riesgo: Optional[PrediccionRiesgo] = None,
    modo_proactivo: bool = False
) -> ChatResponse:
    """
    Genera respuesta empática para el chat usando Claude
    
    Args:
        mensaje: Mensaje del usuario (vacío en modo proactivo)
        estrategia: Estrategia de respuesta del orquestador
        perfil: Perfil del usuario
        contexto_previo: Historial de chat reciente
        prediccion_riesgo: Predicción ML de riesgo
        modo_proactivo: Si es un mensaje proactivo
        
    Returns:
        ChatResponse: Respuesta generada con metadatos
    """
    try:
        logger.info(f"Generating chat response for user profile: {perfil.etapa}")
        
        if not claude_client:
            logger.warning("Claude API not available, using fallback responses")
            return _generar_respuesta_local(mensaje, estrategia, perfil, modo_proactivo)
        
        # 1. Construir prompt del sistema
        system_prompt = _construir_prompt_sistema(perfil, prediccion_riesgo, estrategia)
        
        # 2. Construir prompt del usuario con contexto
        user_prompt = _construir_prompt_usuario(
            mensaje, contexto_previo, modo_proactivo, estrategia
        )
        
        # 3. Generar respuesta con Claude
        respuesta_claude = await claude_client.generar_respuesta(
            user_prompt, system_prompt
        )
        
        # 4. Analizar y procesar la respuesta
        tono = _determinar_tono_respuesta(respuesta_claude, estrategia)
        necesita_seguimiento = _evaluar_necesidad_seguimiento(
            mensaje, respuesta_claude, prediccion_riesgo
        )
        
        # 5. Limpiar y ajustar respuesta
        respuesta_final = _procesar_respuesta_final(respuesta_claude, perfil)
        
        chat_response = ChatResponse(
            respuesta=respuesta_final,
            tono=tono,
            necesita_seguimiento=necesita_seguimiento
        )
        
        logger.info("Chat response generated successfully with Claude")
        return chat_response
        
    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        return _generar_respuesta_local(mensaje, estrategia, perfil, modo_proactivo)


def _construir_prompt_sistema(
    perfil: PerfilUsuario, 
    prediccion_riesgo: Optional[PrediccionRiesgo],
    estrategia: Dict
) -> str:
    """Construye el prompt del sistema para Claude"""
    
    # Base del sistema
    system_base = f"""Eres RITMO, un asistente de acompañamiento empático para personas en situación vulnerable.

PERFIL DEL USUARIO:
- Nombre: {perfil.nombre}
- Etapa de vida: {perfil.etapa}
- Modo de comunicación: {perfil.modo_comunicacion}

CARACTERÍSTICAS DE TUS RESPUESTAS:
- Máximo 2-3 oraciones (50-80 palabras)
- Tono cálido, humano y sin juzgar
- Evita consejos no solicitados
- Enfócate en validar emociones
- Usa el nombre del usuario occasionalmente"""
    
    # Añadir contexto de riesgo si existe
    if prediccion_riesgo and prediccion_riesgo.nivel_riesgo in ["alto", "critico"]:
        system_base += f"\n\nALERTA: El usuario muestra señales de {prediccion_riesgo.nivel_riesgo} riesgo. Sé especialmente empático y considera sugerir recursos de apoyo profesional de forma suave."
    
    # Añadir instrucciones específicas de estrategia
    if estrategia.get("tipo") == "proactivo":
        system_base += "\n\nMODO PROACTIVO: Inicia una conversación cálida y acogedora. Pregunta cómo está sin ser intrusivo."
    elif estrategia.get("tipo") == "empático":
        system_base += "\n\nMODO EMPÁTICO: El usuario parece necesitar apoyo emocional. Valida sus sentimientos y muéstrale que no está solo."
    
    return system_base


def _construir_prompt_usuario(
    mensaje: str, 
    contexto_previo: List[Dict[str, str]], 
    modo_proactivo: bool,
    estrategia: Dict
) -> str:
    """Construye el prompt del usuario con contexto"""
    
    if modo_proactivo:
        return f"""Genera un mensaje proactivo de tipo {estrategia.get('subtipo', 'check_in')} para iniciar una conversación cálida con el usuario."""
    
    # Construir contexto de conversación
    contexto_str = ""
    if contexto_previo:
        contexto_str = "Contexto de conversación reciente:\n"
        for intercambio in contexto_previo[-3:]:  # Solo últimos 3 intercambios
            contexto_str += f"Usuario: {intercambio.get('mensaje_usuario', '')}\n"
            contexto_str += f"RITMO: {intercambio.get('respuesta_sistema', '')}\n\n"
    
    user_prompt = f"""{contexto_str}Mensaje actual del usuario: "{mensaje}"
    
Genera una respuesta empática y apropiada."""
    
    return user_prompt


def _determinar_tono_respuesta(respuesta: str, estrategia: Dict) -> str:
    """Determina el tono de la respuesta generada"""
    respuesta_lower = respuesta.lower()
    
    # Palabras que indican diferentes tonos
    if any(palabra in respuesta_lower for palabra in ["felicidades", "genial", "excelente", "celebrar"]):
        return "celebratorio"
    elif any(palabra in respuesta_lower for palabra in ["entiendo", "comprendo", "siento", "difícil"]):
        return "empático"
    elif any(palabra in respuesta_lower for palabra in ["adelante", "puedes", "ánimo", "fuerza"]):
        return "alentador"
    else:
        return "neutral"


def _evaluar_necesidad_seguimiento(
    mensaje: str, 
    respuesta: str, 
    prediccion_riesgo: Optional[PrediccionRiesgo]
) -> bool:
    """Evalúa si la respuesta necesita seguimiento posterior"""
    
    # Indicadores de necesidad de seguimiento
    palabras_seguimiento = ["preocupado", "difícil", "ayuda", "solo", "triste"]
    
    if prediccion_riesgo and prediccion_riesgo.nivel_riesgo in ["alto", "critico"]:
        return True
    
    if any(palabra in mensaje.lower() for palabra in palabras_seguimiento):
        return True
    
    return False


def _procesar_respuesta_final(respuesta: str, perfil: PerfilUsuario) -> str:
    """Procesa y ajusta la respuesta final según el perfil"""
    
    # Limpiar respuesta
    respuesta = respuesta.strip()
    
    # Ajustes por modo de comunicación
    if perfil.modo_comunicacion == "audio":
        # Para audio, evitar signos de puntuación complejos
        respuesta = respuesta.replace("...", "")
        respuesta = respuesta.replace(";", ",")
    
    # Asegurar longitud apropiada
    if len(respuesta) > 200:
        # Cortar en la última oración completa
        puntos = [i for i, c in enumerate(respuesta) if c in ".!?"]
        if puntos:
            ultimo_punto = max([p for p in puntos if p < 180])
            respuesta = respuesta[:ultimo_punto + 1]
    
    return respuesta


def _generar_respuesta_local(
    mensaje: str, 
    estrategia: Dict, 
    perfil: PerfilUsuario, 
    modo_proactivo: bool
) -> ChatResponse:
    """Genera respuesta local cuando Claude no está disponible"""
    
    if modo_proactivo:
        respuestas_proactivas = [
            f"Hola {perfil.nombre}, ¿cómo has estado? Me preguntaba cómo te va hoy.",
            f"¡Hola! Pensé en ti, {perfil.nombre}. ¿Cómo te encuentras?",
            f"Buenos días, {perfil.nombre}. ¿Hay algo especial en tu día de hoy?"
        ]
        respuesta = respuestas_proactivas[0]  # Simplificado
    else:
        # Respuestas empáticas básicas
        if any(palabra in mensaje.lower() for palabra in ["mal", "triste", "difícil"]):
            respuesta = f"Entiendo que estés pasando por un momento difícil, {perfil.nombre}. Estoy aquí para acompañarte."
            tono = "empático"
        elif any(palabra in mensaje.lower() for palabra in ["bien", "mejor", "genial"]):
            respuesta = f"Me alegra saber que te sientes bien, {perfil.nombre}. ¡Es genial escuchar eso!"
            tono = "celebratorio"
        else:
            respuesta = f"Gracias por compartir eso conmigo, {perfil.nombre}. ¿Cómo te sientes ahora mismo?"
            tono = "neutral"
    
    return ChatResponse(
        respuesta=respuesta,
        tono=tono if 'tono' in locals() else "empático",
        necesita_seguimiento=False
    )