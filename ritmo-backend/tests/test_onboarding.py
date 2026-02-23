"""
Tests para el sistema de onboarding conversacional
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

from main import app
from agents.onboarding import onboarding_agent
from db.onboarding_sessions import session_manager
from models.schemas import OnboardingEstado


client = TestClient(app)


class TestOnboardingAgent:
    """Tests para el agente de onboarding"""
    
    def test_inicializar_banco_preguntas(self):
        """Test que el banco de preguntas se inicializa correctamente"""
        assert len(onboarding_agent.banco_preguntas) == 5
        assert "edad_contexto" in onboarding_agent.banco_preguntas
        assert "tecnologia" in onboarding_agent.banco_preguntas
        assert "familia" in onboarding_agent.banco_preguntas
        assert "trabajo" in onboarding_agent.banco_preguntas
        assert "tiempo_libre" in onboarding_agent.banco_preguntas
    
    def test_iniciar_onboarding(self):
        """Test inicialización de onboarding"""
        estado = onboarding_agent.iniciar_onboarding("test_123", "Usuario Test", "sesion_123")
        
        assert estado.telegram_id == "test_123"
        assert estado.nombre == "Usuario Test"
        assert estado.sesion_id == "sesion_123"
        assert estado.pregunta_actual == 0
        assert len(estado.preguntas_hechas) == 0
        assert len(estado.respuestas) == 0
        assert not estado.completado
        assert len(estado.scores) == 4  # joven, adulto_activo, inmigrante, persona_mayor
    
    def test_obtener_primera_pregunta(self):
        """Test obtención de primera pregunta"""
        estado = onboarding_agent.iniciar_onboarding("test_123", "Usuario Test", "sesion_123")
        mensaje, estado_actualizado = onboarding_agent.obtener_siguiente_pregunta(estado)
        
        assert estado_actualizado.pregunta_actual == 1
        assert len(estado_actualizado.preguntas_hechas) == 1
        assert "Pregunta 1" in mensaje
        
        # Primera pregunta debe ser de edad_contexto
        primera_pregunta = estado_actualizado.preguntas_hechas[0]
        assert primera_pregunta["categoria"] == "edad_contexto"
    
    def test_procesar_respuesta_joven(self):
        """Test procesamiento de respuesta que indica etapa joven"""
        estado = onboarding_agent.iniciar_onboarding("test_123", "Usuario Test", "sesion_123")
        
        # Simular primera pregunta
        _, estado = onboarding_agent.obtener_siguiente_pregunta(estado)
        
        # Respuesta típica de joven
        respuesta = "Estoy estudiando en la universidad y buscando mi primer trabajo"
        mensaje, estado_actualizado = onboarding_agent.procesar_respuesta(respuesta, estado)
        
        assert len(estado_actualizado.respuestas) == 1
        assert estado_actualizado.respuestas[0] == respuesta
        assert estado_actualizado.scores["joven"] > 0
    
    def test_clasificacion_con_confianza_alta(self):
        """Test clasificación cuando hay confianza alta"""
        estado = OnboardingEstado(
            sesion_id="test_sesion",
            telegram_id="test_123",
            nombre="Test User",
            pregunta_actual=4,
            scores={
                "joven": 3.0,
                "adulto_activo": 0.5,
                "inmigrante": 0.2,
                "persona_mayor": 0.1
            }
        )
        
        resultado = onboarding_agent._clasificar_usuario(estado)
        
        assert resultado.etapa_detectada == "joven"
        assert resultado.puede_clasificar
        assert resultado.confianza > onboarding_agent.umbral_confianza


class TestOnboardingSessionManager:
    """Tests para el gestor de sesiones"""
    
    def setup_method(self):
        """Limpiar sesiones antes de cada test"""
        session_manager._sessions.clear()
    
    def test_crear_sesion(self):
        """Test creación de sesión"""
        sesion_id = session_manager.crear_sesion("test_123", "Usuario Test")
        
        assert sesion_id is not None
        assert len(sesion_id) > 0
        
        sesion = session_manager.obtener_sesion(sesion_id)
        assert sesion is not None
        assert sesion["telegram_id"] == "test_123"
        assert sesion["nombre"] == "Usuario Test"
    
    def test_guardar_y_obtener_estado(self):
        """Test guardar y obtener estado"""
        sesion_id = session_manager.crear_sesion("test_123", "Usuario Test")
        
        estado = OnboardingEstado(
            sesion_id=sesion_id,
            telegram_id="test_123",
            nombre="Usuario Test",
            pregunta_actual=1
        )
        
        # Guardar estado
        resultado = session_manager.guardar_estado(sesion_id, estado)
        assert resultado
        
        # Obtener estado
        estado_obtenido = session_manager.obtener_estado(sesion_id)
        assert estado_obtenido is not None
        assert estado_obtenido.pregunta_actual == 1
        assert estado_obtenido.telegram_id == "test_123"
    
    def test_obtener_sesion_por_telegram(self):
        """Test obtener sesión por ID de Telegram"""
        sesion_id = session_manager.crear_sesion("test_123", "Usuario Test")
        
        sesion_encontrada = session_manager.obtener_sesion_por_telegram("test_123")
        assert sesion_encontrada is not None
        assert sesion_encontrada["sesion_id"] == sesion_id
        
        # Buscar sesión que no existe
        sesion_inexistente = session_manager.obtener_sesion_por_telegram("no_existe")
        assert sesion_inexistente is None


class TestOnboardingAPI:
    """Tests para los endpoints de onboarding"""
    
    def setup_method(self):
        """Limpiar sesiones antes de cada test"""
        session_manager._sessions.clear()
    
    @patch('db.usuarios.existe_usuario_telegram')
    def test_iniciar_onboarding_usuario_nuevo(self, mock_existe):
        """Test iniciar onboarding para usuario nuevo"""
        mock_existe.return_value = False
        
        response = client.post("/onboarding/iniciar", json={
            "telegram_id": "test_123",
            "nombre": "Usuario Test"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "mensaje" in data
        assert "¡Hola Usuario Test!" in data["mensaje"]
        assert not data["completado"]
        assert data["pregunta_numero"] == 1
        assert "sesion_id" in data
    
    @patch('db.usuarios.existe_usuario_telegram')
    def test_iniciar_onboarding_usuario_existente(self, mock_existe):
        """Test iniciar onboarding para usuario que ya existe"""
        mock_existe.return_value = True
        
        response = client.post("/onboarding/iniciar", json={
            "telegram_id": "test_123",
            "nombre": "Usuario Test"
        })
        
        assert response.status_code == 409
        assert "ya existe" in response.json()["detail"]
    
    def test_responder_sesion_inexistente(self):
        """Test responder en sesión que no existe"""
        response = client.post("/onboarding/responder", json={
            "telegram_id": "test_123",
            "respuesta": "Mi respuesta",
            "sesion_id": "sesion_inexistente"
        })
        
        assert response.status_code == 404
        assert "no encontrada" in response.json()["detail"]
    
    @patch('db.usuarios.existe_usuario_telegram')
    def test_flujo_completo_onboarding(self, mock_existe):
        """Test flujo completo de onboarding"""
        mock_existe.return_value = False
        
        # 1. Iniciar onboarding
        response = client.post("/onboarding/iniciar", json={
            "telegram_id": "test_complete",
            "nombre": "Usuario Completo"
        })
        assert response.status_code == 200
        sesion_id = response.json()["sesion_id"]
        
        # 2. Responder varias preguntas para completar onboarding
        respuestas = [
            "Soy estudiante universitario buscando mi primer trabajo",
            "Me adapto fácil a la tecnología, soy nativo digital",
            "Vivo con mis padres todavía, soy el hijo mayor",
            "Trabajo medio tiempo mientras estudio",
            "Me gusta salir con amigos y jugar videojuegos"
        ]
        
        for i, respuesta in enumerate(respuestas):
            with patch('db.usuarios.crear_usuario') as mock_crear:
                # Mock para simular creación exitosa de usuario
                mock_usuario = type('obj', (object,), {
                    'id': 'user_123',
                    'codigo_secreto': '1234'
                })
                mock_crear.return_value = mock_usuario
                
                response = client.post("/onboarding/responder", json={
                    "telegram_id": "test_complete",
                    "respuesta": respuesta,
                    "sesion_id": sesion_id
                })
                
                assert response.status_code == 200
                data = response.json()
                
                # Si completó, debe tener código secreto
                if data["completado"]:
                    assert data["codigo_secreto"] is not None
                    assert data["etapa_detectada"] is not None
                    break


@pytest.fixture
def mock_supabase():
    """Mock para cliente Supabase"""
    with patch('db.usuarios.get_supabase_client') as mock_client:
        yield mock_client


class TestGeneracionCodigoSecreto:
    """Tests para generación de código secreto"""
    
    @patch('db.usuarios.get_supabase_client')
    async def test_generar_codigo_unico(self, mock_client):
        """Test generación de código secreto único"""
        from db.usuarios import generar_codigo_secreto_unico
        
        # Mock respuesta de Supabase (no hay códigos duplicados)
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        codigo = await generar_codigo_secreto_unico()
        
        assert len(codigo) == 4
        assert codigo.isdigit()
        assert 0 <= int(codigo) <= 9999
    
    @patch('db.usuarios.get_supabase_client')
    async def test_codigo_con_ceros_izquierda(self, mock_client):
        """Test que códigos menores a 1000 tengan ceros a la izquierda"""
        from db.usuarios import generar_codigo_secreto_unico
        
        mock_client.return_value.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        # Generar varios códigos para verificar formato
        for _ in range(10):
            codigo = await generar_codigo_secreto_unico()
            assert len(codigo) == 4
            assert codigo.isdigit()


if __name__ == "__main__":
    pytest.main(["-v", __file__])