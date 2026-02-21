"""
Agente de Acompañamiento: motor principal de RITMO.

Responsabilidades:
  - Llevar la conversación principal de soporte emocional.
  - Enriquecer el system prompt con el contexto del backend RITMO (si está disponible).
  - Adaptar el tono y vocabulario a la etapa de vida y modo de comunicación del usuario.
  - Detectar señales de crisis y responder con protocolos de seguridad.
"""

import logging
from typing import Optional, Dict, Any, List

from .base_agent import BaseAgent
from .memory_agent import MemoryAgent

logger = logging.getLogger(__name__)


# Adaptaciones por etapa de vida
ETAPA_GUIDELINES: Dict[str, str] = {
    "mayor_70": (
        "El usuario tiene 70 años o más. Usa frases cortas y claras. "
        "Evita jerga tecnológica. Valora su experiencia y sé paciente. "
        "Ofrece apoyo en soledad, salud, familia y rutinas diarias."
    ),
    "adulto_activo": (
        "El usuario es un adulto activo. Habla con naturalidad y respeto. "
        "Temas frecuentes: estrés laboral, familia, equilibrio vida-trabajo."
    ),
    "joven": (
        "El usuario es joven. Puedes ser más informal y cercano. "
        "Temas frecuentes: identidad, ansiedad, relaciones, futuro laboral."
    ),
    "migrante": (
        "El usuario es migrante. Sé especialmente empático con la soledad, "
        "las barreras idiomáticas o culturales, y la añoranza. "
        "Evita asunciones sobre su país de origen."
    ),
    "discapacidad_visual": (
        "El usuario tiene discapacidad visual. Evita referencias a contenido visual. "
        "Sé muy descriptivo en tus respuestas si es necesario. "
        "Prioriza respuestas que funcionen bien si se leen mediante síntesis de voz."
    ),
}

MODO_GUIDELINES: Dict[str, str] = {
    "audio": "El usuario prefiere mensajes de voz. Escribe respuestas fluidas, como si se leyeran en voz alta: sin listas con guiones, sin markdown.",
    "texto": "El usuario prefiere texto. Puedes usar formato claro con saltos de línea.",
    "mixto": "El usuario usa tanto texto como audio. Adapta según el mensaje recibido.",
}

BASE_SYSTEM = """Eres RITMO, un asistente de acompañamiento personal empático y profesional,
especializado en apoyar a personas de colectivos vulnerables.

Principios fundamentales:
- Escucha activa: refleja y valida los sentimientos antes de ofrecer soluciones.
- No juzgas ni das diagnósticos médicos.
- Si detectas señales de crisis (autolesión, ideas de suicidio, violencia), responde con
  calma, pregunta cómo está la persona, y proporciona el número de emergencias 112 y la
  línea de atención a la conducta suicida 024.
- Respuestas concisas (máximo 3-4 párrafos cortos).
- Habla siempre en español a menos que el usuario escriba en otro idioma.
"""


class CompanionAgent(BaseAgent):
    """
    Agente principal de acompañamiento conversacional.
    """

    def __init__(self, memory: MemoryAgent):
        super().__init__()
        self.memory = memory

    async def respond(
        self,
        user_id: int,
        user_message: str,
        perfil: Optional[Dict[str, Any]] = None,
        ritmo_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Genera una respuesta de acompañamiento.

        Args:
            user_id: ID del usuario en Telegram.
            user_message: Texto del mensaje del usuario.
            perfil: Diccionario con {nombre, etapa, modo_comunicacion} del usuario.
            ritmo_context: Respuesta del backend RITMO (estado_inferido, recomendacion, etc.)

        Returns:
            Texto de respuesta.
        """
        # Registrar mensaje del usuario
        self.memory.add_user_message(user_id, user_message)
        await self.memory.maybe_compress(user_id)

        # Construir system prompt adaptado
        system_content = self._build_system(perfil, ritmo_context, user_id)

        # Historial de conversación
        history = self.memory.get_history(user_id)

        messages = [self._system(system_content)] + history

        response = await self._call_gpt(messages, temperature=0.75, max_tokens=600)
        self.memory.add_assistant_message(user_id, response)
        return response

    # ------------------------------------------------------------------
    # Helpers privados
    # ------------------------------------------------------------------

    def _build_system(
        self,
        perfil: Optional[Dict[str, Any]],
        ritmo_context: Optional[Dict[str, Any]],
        user_id: int,
    ) -> str:
        parts: List[str] = [BASE_SYSTEM]

        # Contexto de memoria comprimida
        memory_block = self.memory.build_context_block(user_id)
        if memory_block:
            parts.append(memory_block)

        # Adaptación por perfil
        if perfil:
            nombre = perfil.get("nombre", "")
            etapa = perfil.get("etapa", "adulto_activo")
            modo = perfil.get("modo_comunicacion", "texto")

            if nombre:
                parts.append(f"\nLlama al usuario por su nombre: {nombre}.")

            etapa_guide = ETAPA_GUIDELINES.get(etapa, "")
            if etapa_guide:
                parts.append(f"\nAdaptación de etapa: {etapa_guide}")

            modo_guide = MODO_GUIDELINES.get(modo, "")
            if modo_guide:
                parts.append(f"\nAdaptación de modo de comunicación: {modo_guide}")

        # Enriquecimiento con contexto del backend RITMO
        if ritmo_context:
            estado = ritmo_context.get("estado_inferido")
            recomendacion = ritmo_context.get("recomendacion_orquestador")
            ctx_sistema = ritmo_context.get("contexto_sistema", "")

            if estado:
                parts.append(
                    f"\n[Análisis RITMO] Estado emocional inferido: {estado}."
                )
            if recomendacion:
                parts.append(
                    f"Recomendación del sistema RITMO: {recomendacion}. "
                    "Úsala como guía pero no la menciones literalmente."
                )
            if ctx_sistema:
                parts.append(
                    f"Contexto adicional del sistema: {ctx_sistema[:300]}"
                )

        return "\n".join(parts)
