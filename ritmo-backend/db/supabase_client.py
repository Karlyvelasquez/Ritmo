import os
import logging
from supabase import create_client, Client
from typing import Optional

# Configurar logging
logger = logging.getLogger(__name__)


class SupabaseClient:
    """Cliente singleton para conexión con Supabase"""
    
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls) -> 'SupabaseClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self) -> None:
        # No inicializar automáticamente aquí
        pass
    
    def _initialize_client(self) -> None:
        """Inicializa el cliente de Supabase"""
        if self._client is not None:
            return
            
        try:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
            
            self._client = create_client(url, key)
            logger.info("Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Retorna la instancia del cliente Supabase"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def test_connection(self) -> bool:
        """Prueba la conexión con Supabase"""
        try:
            # Intentar obtener información de la tabla usuarios
            response = self.client.table('usuarios').select('id').limit(1).execute()
            logger.info("Supabase connection test successful")
            return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False


# Instancia global del cliente
_supabase_client_instance = None


def get_supabase_client() -> Client:
    """
    Función helper para obtener el cliente Supabase
    
    Returns:
        Client: Instancia del cliente Supabase
        
    Raises:
        RuntimeError: Si el cliente no está inicializado
    """
    global _supabase_client_instance
    if _supabase_client_instance is None:
        _supabase_client_instance = SupabaseClient()
    return _supabase_client_instance.client