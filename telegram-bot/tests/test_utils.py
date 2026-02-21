"""
Tests para utilidades del bot de Telegram RITMO
"""

import pytest
from unittest.mock import Mock, patch

from utils import RitmoBackendClient


class TestRitmoBackendClient:
    """Tests para cliente del backend RITMO"""

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        """Test health check exitoso"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200

            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

            client = RitmoBackendClient()
            resultado = await client.health_check()

            assert resultado == True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        """Test health check con fallo"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Connection failed")

            client = RitmoBackendClient()
            resultado = await client.health_check()

            assert resultado == False

    @pytest.mark.asyncio
    async def test_analizar_contexto_success(self):
        """Test análisis de contexto exitoso"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "contexto_sistema": "Test context",
                "estado_inferido": {"estado": "estable", "confianza": "media"},
                "recomendacion_orquestador": "rutina"
            }

            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response

            client = RitmoBackendClient()

            perfil_data = {"etapa": "joven", "nombre": "Alex"}
            senales_data = {"hora_acceso": "14:30", "es_madrugada": False}

            resultado = await client.analizar_contexto(perfil_data, senales_data)

            assert resultado is not None
            assert resultado["estado_inferido"]["estado"] == "estable"
            assert resultado["recomendacion_orquestador"] == "rutina"

    @pytest.mark.asyncio
    async def test_analizar_contexto_error(self):
        """Test análisis de contexto con error"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 500
            mock_response.text = "Internal server error"

            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response

            client = RitmoBackendClient()

            resultado = await client.analizar_contexto({}, {})

            assert resultado is None