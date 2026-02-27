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
        """Inicializa cliente Supabase con configuración robusta"""
        try:
            # Debug: Mostrar variables de entorno disponibles
            logger.info("🔍 DEBUG: Verificando variables de entorno de Supabase...")
            logger.info(f"   SUPABASE_URL disponible: {'✅' if config.SUPABASE_URL else '❌'}")
            logger.info(f"   SUPABASE_KEY disponible: {'✅' if config.SUPABASE_KEY else '❌'}")
            
            if config.SUPABASE_URL:
                logger.info(f"   SUPABASE_URL: {config.SUPABASE_URL[:50]}...")
            if config.SUPABASE_KEY:
                logger.info(f"   SUPABASE_KEY: {config.SUPABASE_KEY[:30]}...")

            # Validar que las credenciales estén disponibles
            if not config.SUPABASE_URL or not config.SUPABASE_KEY:
                logger.error("❌ Credenciales de Supabase faltantes:")
                logger.error(f"   SUPABASE_URL: {'✓' if config.SUPABASE_URL else '✗ FALTA'}")
                logger.error(f"   SUPABASE_KEY: {'✓' if config.SUPABASE_KEY else '✗ FALTA'}")
                logger.error("💡 Verificar que las variables de entorno estén configuradas en el deployment")
                self._initialized = False
                self._client = None
                return

            logger.info(f"🔗 Conectando a Supabase: {config.SUPABASE_URL[:30]}...")
            
            # Configuración simplificada sin argumentos problemáticos
            self._client = create_client(
                supabase_url=config.SUPABASE_URL,
                supabase_key=config.SUPABASE_KEY
            )
            
            # Test de conectividad básico
            try:
                logger.info("🧪 Ejecutando test de conectividad...")
                # Intentar una consulta simple para verificar la conexión
                test_result = self._client.table("usuarios").select("id").limit(1).execute()
                logger.info(f"📡 Test de conectividad exitoso - encontrados {len(test_result.data if test_result.data else [])} registros")
            except Exception as test_error:
                logger.error(f"⚠️ Error en test de conectividad: {test_error}")
                logger.error(f"Tipo de error: {type(test_error).__name__}")
                logger.warning("Cliente inicializado pero conectividad no verificada")
                # No fallar aquí, el cliente podría funcionar para otras operaciones
            
            self._initialized = True
            logger.info("✅ Cliente Supabase inicializado correctamente")
            
        except Exception as e:
            logger.error(f"❌ Error crítico inicializando Supabase: {e}")
            logger.error(f"Tipo de error: {type(e).__name__}")
            logger.error(f"Detalles completos: {str(e)}")
            self._initialized = False
            self._client = None
            # No raise para permitir que el bot funcione sin DB

    # ------------------------------------------------------------------ #
    #  Búsqueda de usuarios registrados en la app                         #
    # ------------------------------------------------------------------ #

    async def buscar_usuario_por_nombre(self, nombre: str) -> Optional[Dict[str, Any]]:
        """
        Busca un usuario en la tabla 'usuarios' por nombre (case-insensitive).
        Devuelve el primer registro que coincida o None.
        """
        try:
            client = self.client # Forzar inicialización vía lazy loading
            if not client:
                logger.warning("🚨 Cliente Supabase no inicializado - búsqueda por nombre no disponible")
                logger.info("💡 Verificar credenciales SUPABASE_URL y SUPABASE_KEY en .env")
                return None
                
            result = (
                client.table("usuarios")
                .select("*")
                .ilike("nombre", nombre.strip())
                .execute()
            )

            if result.data and len(result.data) > 0:
                logger.info(f"Usuario encontrado por nombre: {nombre}")
                return result.data[0]

            logger.info(f"No se encontró usuario con nombre: {nombre}")
            return None

        except Exception as e:
            logger.error(f"Error buscando usuario por nombre '{nombre}': {e}")
            return None

    async def buscar_usuario_por_telegram_id(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca un usuario que ya tenga vinculado este telegram_id.
        Sirve para reconocer usuarios que ya se identificaron antes.
        """
        try:
            client = self.client # Forzar inicialización vía lazy loading
            if not client:
                logger.warning("🚨 Cliente Supabase no inicializado - búsqueda por telegram_id no disponible")
                logger.info("💡 El bot funcionará solo con funciones básicas")
                return None
                
            result = (
                client.table("usuarios")
                .select("*")
                .eq("telegram_id", str(telegram_id))
                .execute()
            )

            if result.data and len(result.data) > 0:
                logger.info(f"Usuario vinculado a Telegram ID: {telegram_id}")
                return result.data[0]

            return None

        except Exception as e:
            logger.error(f"Error buscando por telegram_id {telegram_id}: {e}")
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

    # ------------------------------------------------------------------ #
    #  Check-ins emocionales diarios                                       #
    # ------------------------------------------------------------------ #

    async def guardar_checkin_diario(
        self, 
        user_id: str, 
        telegram_id: int, 
        estado_emocional: str,
        metodo: str = "reactivo",
        mensaje_contexto: str = None
    ) -> bool:
        """
        Guarda un check-in emocional diario en Supabase.
        
        Args:
            user_id: ID del usuario en la BD principal
            telegram_id: ID de Telegram del usuario  
            estado_emocional: "bien", "normal", "dificil"
            metodo: "proactivo" o "reactivo"
            mensaje_contexto: Mensaje adicional opcional
            
        Returns:
            bool: True si se guardó exitosamente
        """
        try:
            checkin_data = {
                'user_id': user_id,
                'telegram_id': str(telegram_id),
                'fecha': datetime.utcnow().date().isoformat(),
                'estado_emocional': estado_emocional,
                'hora_respuesta': datetime.utcnow().isoformat(),
                'metodo': metodo,
                'mensaje_contexto': mensaje_contexto,
                'created_at': datetime.utcnow().isoformat()
            }

            result = self.client.table('checkins_diarios').insert(checkin_data).execute()
            
            if result.data:
                logger.info(f"Check-in guardado: {estado_emocional} ({metodo}) para user {user_id}")
                return True
            
            logger.error(f"No se pudo guardar check-in para user {user_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error guardando check-in para {user_id}: {e}")
            return False

    async def verificar_checkin_hoy(self, user_id: str) -> bool:
        """
        Verifica si el usuario ya hizo su check-in today.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            bool: True si ya hizo check-in hoy
        """
        try:
            hoy = datetime.utcnow().date().isoformat()
            
            result = (
                self.client.table("checkins_diarios")
                .select("id")
                .eq("user_id", user_id)
                .eq("fecha", hoy)
                .execute()
            )
            
            return bool(result.data and len(result.data) > 0)
            
        except Exception as e:
            logger.error(f"Error verificando check-in hoy para {user_id}: {e}")
            return False

    async def obtener_ultimo_checkin(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el último check-in del usuario.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Dict con datos del último check-in o None
        """
        try:
            result = (
                self.client.table("checkins_diarios")
                .select("*")
                .eq("user_id", user_id)
                .order("fecha", desc=True)
                .limit(1)
                .execute()
            )
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error obteniendo último check-in para {user_id}: {e}")
            return None

    async def obtener_checkins_periodo(self, user_id: str, dias: int = 7) -> List[Dict[str, Any]]:
        """
        Obtiene check-ins del usuario en los últimos N días.
        
        Args:
            user_id: ID del usuario
            dias: Número de días hacia atrás (default: 7)
            
        Returns:
            Lista de check-ins del período
        """
        try:
            fecha_limite = (datetime.utcnow() - timedelta(days=dias)).date().isoformat()
            
            result = (
                self.client.table("checkins_diarios")
                .select("*")
                .eq("user_id", user_id)
                .gte("fecha", fecha_limite)
                .order("fecha", desc=True)
                .execute()
            )
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error obteniendo check-ins período para {user_id}: {e}")
            return []