"""
Agente base para todos los agentes LLM de RITMO.
Proporciona acceso a OpenAI y helpers comunes.
"""

import logging
from typing import List, Dict, Any, Optional

from openai import AsyncOpenAI
from config import config

logger = logging.getLogger(__name__)


class BaseAgent:
    """
    Clase base para todos los agentes.
    Maneja la conexión con OpenAI y expone un método unificado de llamada.
    """

    # Modelo por defecto; cada agente puede sobreescribirlo
    DEFAULT_MODEL: str = "gpt-4o-mini"

    def __init__(self):
        self._client: AsyncOpenAI = AsyncOpenAI(api_key=config.OPENAI_API_KEY)

    async def _call_gpt(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 800,
        json_mode: bool = False,
    ) -> str:
        """
        Llama a la API de OpenAI y devuelve el texto de respuesta.

        Args:
            messages: Lista de mensajes en formato ChatCompletion.
            model: Modelo a usar (default: DEFAULT_MODEL).
            temperature: Temperatura de sampling.
            max_tokens: Límite de tokens en la respuesta.
            json_mode: Si True, activa response_format JSON object.

        Returns:
            Texto de la respuesta del modelo.
        """
        model = model or config.OPENAI_MODEL or self.DEFAULT_MODEL

        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            response = await self._client.chat.completions.create(**kwargs)
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"[{self.__class__.__name__}] Error llamando a OpenAI: {e}")
            raise

    def _system(self, content: str) -> Dict[str, str]:
        return {"role": "system", "content": content}

    def _user(self, content: str) -> Dict[str, str]:
        return {"role": "user", "content": content}

    def _assistant(self, content: str) -> Dict[str, str]:
        return {"role": "assistant", "content": content}
