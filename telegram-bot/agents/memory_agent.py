"""
Agente de Memoria: gestiona el historial de conversación por usuario.

Estrategia de memoria de dos niveles:
  - Ventana reciente: últimos MAX_WINDOW mensajes concretos.
  - Resumen comprimido: cuando el historial supera COMPRESS_AT mensajes,
    los mensajes más antiguos se comprimen con GPT y se almacenan como un
    único mensaje de resumen.  Esto permite mantener contexto ilimitado
    con un coste de tokens controlado.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional
from datetime import datetime

from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

# Número de mensajes recientes que siempre se pasan completos al modelo
MAX_WINDOW = 20
# Cuando hay más mensajes que esto, se activa la compresión de los antiguos
COMPRESS_AT = 35


class ConversationBuffer:
    """Historial de conversación de un único usuario."""

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.messages: List[Dict[str, str]] = []  # {"role": ..., "content": ...}
        self.summary: Optional[str] = None         # Resumen comprimido de mensajes antiguos
        self.last_updated: datetime = datetime.utcnow()

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        self.last_updated = datetime.utcnow()

    def get_recent(self) -> List[Dict[str, str]]:
        """Devuelve los últimos MAX_WINDOW mensajes."""
        return self.messages[-MAX_WINDOW:]

    def needs_compression(self) -> bool:
        return len(self.messages) > COMPRESS_AT

    def apply_compression(self, summary: str):
        """
        Reemplaza los mensajes que quedan fuera de la ventana por el resumen.
        Mantiene siempre los últimos MAX_WINDOW mensajes sin tocar.
        """
        self.summary = summary
        # Mantener solo la ventana reciente; los anteriores ya están en el resumen
        self.messages = self.messages[-MAX_WINDOW:]
        logger.info(f"[MemoryAgent] Historial del usuario {self.user_id} comprimido.")

    def clear(self):
        self.messages = []
        self.summary = None


class MemoryAgent(BaseAgent):
    """
    Agente responsable de gestionar y resumir el historial de conversación.
    Es un singleton que todos los demás agentes usan.
    """

    def __init__(self):
        super().__init__()
        self._buffers: Dict[int, ConversationBuffer] = defaultdict(lambda: ConversationBuffer(0))

    def _get_buffer(self, user_id: int) -> ConversationBuffer:
        if user_id not in self._buffers:
            buf = ConversationBuffer(user_id)
            self._buffers[user_id] = buf
        return self._buffers[user_id]

    def add_user_message(self, user_id: int, content: str):
        """Registra un mensaje del usuario."""
        self._get_buffer(user_id).add("user", content)

    def add_assistant_message(self, user_id: int, content: str):
        """Registra una respuesta del asistente."""
        self._get_buffer(user_id).add("assistant", content)

    def get_history(self, user_id: int) -> List[Dict[str, str]]:
        """
        Devuelve la ventana reciente de mensajes lista para pasar a ChatCompletion.
        """
        return self._get_buffer(user_id).get_recent()

    def get_summary(self, user_id: int) -> Optional[str]:
        """Devuelve el resumen comprimido si existe."""
        return self._get_buffer(user_id).summary

    def clear(self, user_id: int):
        """Borra el historial de un usuario (ej. al reiniciar conversación)."""
        self._get_buffer(user_id).clear()

    async def maybe_compress(self, user_id: int):
        """
        Si el historial supera el umbral, comprime los mensajes antiguos con GPT
        y los reemplaza por un resumen.
        """
        buf = self._get_buffer(user_id)
        if not buf.needs_compression():
            return

        # Mensajes a comprimir: todos excepto la ventana reciente
        to_compress = buf.messages[:-MAX_WINDOW]
        if not to_compress:
            return

        conversation_text = "\n".join(
            f"{'Usuario' if m['role'] == 'user' else 'Asistente'}: {m['content']}"
            for m in to_compress
        )

        prompt = [
            self._system(
                "Eres un asistente que resume conversaciones de forma concisa. "
                "Resume los puntos clave de esta conversación en 3-5 oraciones, "
                "enfocándote en: estado emocional del usuario, temas importantes, "
                "acuerdos o compromisos, y contexto relevante para el futuro."
            ),
            self._user(f"Resume esta conversación:\n\n{conversation_text}"),
        ]

        try:
            summary = await self._call_gpt(prompt, temperature=0.3, max_tokens=300)
            buf.apply_compression(summary)
        except Exception as e:
            logger.error(f"[MemoryAgent] No se pudo comprimir el historial: {e}")

    def build_context_block(self, user_id: int) -> str:
        """
        Genera un bloque de texto con el resumen (si hay) para inyectar
        en el system prompt de los demás agentes.
        """
        summary = self.get_summary(user_id)
        if summary:
            return f"\n\n--- Resumen de conversaciones anteriores ---\n{summary}\n---"
        return ""
