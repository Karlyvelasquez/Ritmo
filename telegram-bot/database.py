"""
Gestor de base de datos para el bot de Telegram RITMO.
El bot NO crea usuarios: solo consulta usuarios ya registrados en la app.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

from supabase import create_client, Client

from config import config

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Gestor de base de datos Supabase para el bot"""

    def __init__(self):
        self._client: Optional[Client] = None
        self._initialized = False

    @property
    def client(self) -> Client:
        """Cliente Supabase con lazy loading"""
        if not self._initialized:
            self._initialize_client()
        return self._client

    def _initialize_client(self):
        """Inicializa cliente Supabase"""
        try:
            self._client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
            self._initialized = True
            logger.info("✅ Cliente Supabase inicializado")
        except Exception as e:
            logger.error(f"❌ Error inicializando Supabase: {e}")
            raise

    # ------------------------------------------------------------------ #
    #  Búsqueda de usuarios registrados en la app                         #
    # ------------------------------------------------------------------ #

    async def buscar_usuario_por_nombre(self, nombre: str) -> Optional[Dict[str, Any]]:
        """
        Busca un usuario en la tabla 'usuarios' por nombre (case-insensitive).
        Devuelve el primer registro que coincida o None.
        """
        try:
            result = (
                self.client.table("usuarios")
                .select("*")
                .ilike("nombre", nombre.strip())
                .execute()
            )

            if result.data and len(result.data) > 0:
                logger.info(f"✅ Usuario encontrado por nombre: {nombre}")
                return result.data[0]

            logger.info(f"ℹ️ No se encontró usuario con nombre: {nombre}")
            return None

        except Exception as e:
            logger.error(f"❌ Error buscando usuario por nombre '{nombre}': {e}")
            return None

    async def buscar_usuario_por_telegram_id(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca un usuario que ya tenga vinculado este telegram_id.
        Sirve para reconocer usuarios que ya se identificaron antes.
        """
        try:
            result = (
                self.client.table("usuarios")
                .select("*")
                .eq("telegram_id", str(telegram_id))
                .execute()
            )

            if result.data and len(result.data) > 0:
                logger.info(f"✅ Usuario vinculado a Telegram ID: {telegram_id}")
                return result.data[0]

            return None

        except Exception as e:
            logger.error(f"❌ Error buscando por telegram_id {telegram_id}: {e}")
            return None

    async def vincular_telegram(self, user_db_id: str, telegram_id: int) -> bool:
        """
        Vincula un telegram_id a un usuario existente de la app.
        Se ejecuta una sola vez cuando el usuario se identifica en el bot.
        """
        try:
            result = (
                self.client.table("usuarios")
                .update({"telegram_id": str(telegram_id)})
                .eq("id", user_db_id)
                .execute()
            )

            if result.data:
                logger.info(f"✅ Telegram {telegram_id} vinculado al usuario {user_db_id}")
                return True

            logger.error(f"❌ No se pudo vincular telegram_id: {result}")
            return False

        except Exception as e:
            logger.error(f"❌ Excepción vinculando telegram {telegram_id}: {e}")
            return False

    # ------------------------------------------------------------------ #
    #  Health check                                                        #
    # ------------------------------------------------------------------ #

    async def health_check(self) -> bool:
        """Verifica la conectividad con Supabase"""
        try:
            self.client.table("usuarios").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"❌ Health check Supabase falló: {e}")
            return False