"""
Tests para el endpoint /contexto
Valida el comportamiento de los agentes de contexto y patrones
"""

import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from fastapi import status

from models.schemas import ContextoRequest, PerfilUsuario, SenalesWeb
from routers.contexto import router
from main import app

# Cliente de pruebas
client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_supabase():
    """Mock automático para todas las funciones de Supabase"""
    with patch('db.sesiones.get_supabase_client') as mock_client:
        # Configurar el mock del cliente
        mock_supabase_client = MagicMock()
        mock_client.return_value = mock_supabase_client
        
        # Mock de las respuestas de Supabase
        mock_response = MagicMock()
        mock_response.data = [{"id": "test-id", "created_at": "2024-01-01T00:00:00"}]
        
        mock_table = MagicMock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase_client.table.return_value = mock_table
        
        yield mock_supabase_client


class TestContextoEndpoint:
    """Tests del endpoint POST /contexto"""
    
    def test_endpoint_exists(self):
        """Verifica que el endpoint existe y responde"""
        # Test con datos mínimos válidos
        request_data = {
            "perfil": {
                "etapa": "mayor_70",
                "nombre": "Test",
                "modo_comunicacion": "texto"
            },
            "señales": {
                "hora_acceso": "10:00",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 1,
                "duracion_sesion_anterior_seg": 60,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        assert "contexto_sistema" in response.json()
        assert "estado_inferido" in response.json()
        assert "recomendacion_orquestador" in response.json()


class TestPerfilMayor70:
    """Tests específicos para perfil mayor_70"""
    
    def test_mayor_70_context_simple_language(self):
        """Verifica que el contexto para mayor_70 usa lenguaje simple"""
        request_data = {
            "perfil": {
                "etapa": "mayor_70",
                "nombre": "Carmen",
                "modo_comunicacion": "audio",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verificar estructura
        assert "contexto_sistema" in data
        assert "estado_inferido" in data
        assert "recomendacion_orquestador" in data
        
        # Verificar contexto contiene reglas específicas para mayor_70
        contexto = data["contexto_sistema"]
        assert "Carmen" in contexto
        assert "mayor_70" in contexto
        assert "lenguaje simple" in contexto or "frases cortas" in contexto
        
        # Con señales estables debe recomendar rutina o esperar
        assert data["recomendacion_orquestador"] in ["rutina", "esperar"]


class TestPerfilJoven:
    """Tests específicos para perfil joven"""
    
    def test_joven_context_validation(self):
        """Verifica que el contexto para joven enfatiza validación"""
        request_data = {
            "perfil": {
                "etapa": "joven",
                "nombre": "Álex",
                "modo_comunicacion": "texto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        contexto = data["contexto_sistema"]
        assert "joven" in contexto
        assert "Valida" in contexto or "validar" in contexto
        assert "minimices" in contexto or "paternalismo" in contexto


class TestPerfilAdultoActivo:
    """Tests específicos para perfil adulto_activo"""
    
    def test_adulto_activo_work_pressure(self):
        """Verifica reconocimiento de presiones laborales"""
        request_data = {
            "perfil": {
                "etapa": "adulto_activo",
                "nombre": "Patricia", 
                "modo_comunicacion": "mixto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",
                "dia_semana": "lunes",  
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        contexto = data["contexto_sistema"]
        assert "adulto_activo" in contexto
        assert "trabajo" in contexto or "cansancio" in contexto
        assert "conciliación" in contexto or "responsabilidades" in contexto


class TestPerfilMigrante:
    """Tests específicos para perfil migrante"""
    
    def test_migrante_loneliness_awareness(self):
        """Verifica comprensión de soledad migratoria"""
        request_data = {
            "perfil": {
                "etapa": "migrante",
                "nombre": "Miguel",
                "modo_comunicacion": "texto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        contexto = data["contexto_sistema"]
        assert "migrante" in contexto
        assert "soledad" in contexto or "nostalgia" in contexto
        assert "romantices" in contexto or "relativizar" in contexto


class TestPerfilDiscapacidadVisual:
    """Tests específicos para perfil discapacidad_visual"""
    
    def test_discapacidad_visual_audio_focus(self):
        """Verifica enfoque en audio sin referencias visuales"""
        request_data = {
            "perfil": {
                "etapa": "discapacidad_visual",
                "nombre": "Rosa",
                "modo_comunicacion": "audio",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        contexto = data["contexto_sistema"]
        assert "discapacidad_visual" in contexto
        assert "audio" in contexto
        assert "referencias visuales" in contexto or "mira" in contexto


class TestSenalesPreocupantes:
    """Tests para señales que deben activar contacto_suave"""
    
    def test_senales_extremas_contacto_suave(self):
        """Señales extremas deben recomendar contacto_suave"""
        request_data = {
            "perfil": {
                "etapa": "mayor_70",
                "nombre": "Carmen",
                "modo_comunicacion": "audio",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "03:22",
                "dia_semana": "miércoles",
                "es_madrugada": True,
                "frecuencia_accesos_hoy": 1,
                "duracion_sesion_anterior_seg": 25,
                "tiempo_respuesta_usuario_seg": 400,
                "dias_sin_registrar": 4,
                "checkin_emocional": "dificil"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verificar estado preocupante
        estado_inferido = data["estado_inferido"]
        assert estado_inferido["estado"] in ["aislamiento", "ansiedad", "cansancio", "desconexion"]
        assert estado_inferido["confianza"] == "media"  # Porque hay checkin_emocional
        assert len(estado_inferido["señales_detectadas"]) > 2
        
        # Debe recomendar contacto suave
        assert data["recomendacion_orquestador"] == "contacto_suave"
    
    def test_madrugada_sola_contacto_suave(self):
        """Solo madrugada debe ser suficiente para contacto_suave"""
        request_data = {
            "perfil": {
                "etapa": "joven",
                "nombre": "Álex",
                "modo_comunicacion": "texto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "04:15",
                "dia_semana": "martes",
                "es_madrugada": True,
                "frecuencia_accesos_hoy": 1,
                "duracion_sesion_anterior_seg": 60,
                "tiempo_respuesta_usuario_seg": 45,
                "dias_sin_registrar": 0,
                "checkin_emocional": None
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Con solo madrugada debe dar contacto suave
        assert data["recomendacion_orquestador"] == "contacto_suave"


class TestSenalesEstables:
    """Tests para señales estables que deben dar esperar o rutina"""
    
    def test_senales_estables_rutina_o_esperar(self):
        """Señales estables deben dar rutina o esperar según la hora"""
        # Test horario de rutina
        request_data_rutina = {
            "perfil": {
                "etapa": "joven",
                "nombre": "Álex",
                "modo_comunicacion": "texto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "10:15",  # Hora de rutina
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data_rutina)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Estado estable
        assert data["estado_inferido"]["estado"] == "estable"
        # Hora de rutina debe dar rutina
        assert data["recomendacion_orquestador"] == "rutina"
    
    def test_senales_estables_silencio(self):
        """Señales estables en hora de silencio deben dar silencio"""
        request_data = {
            "perfil": {
                "etapa": "adulto_activo",
                "nombre": "Patricia",
                "modo_comunicacion": "mixto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "23:30",  # Hora de silencio
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 2,
                "duracion_sesion_anterior_seg": 180,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0,
                "checkin_emocional": "bien"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Estado estable pero hora de silencio
        assert data["estado_inferido"]["estado"] == "estable"
        assert data["recomendacion_orquestador"] == "silencio"


class TestValidacionErrores:
    """Tests de validación y manejo de errores"""
    
    def test_etapa_invalida(self):
        """Etapa inválida debe devolver error 422"""
        request_data = {
            "perfil": {
                "etapa": "etapa_inexistente",
                "nombre": "Test",
                "modo_comunicacion": "texto"
            },
            "señales": {
                "hora_acceso": "10:00",
                "dia_semana": "lunes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 1,
                "duracion_sesion_anterior_seg": 60,
                "tiempo_respuesta_usuario_seg": 30,
                "dias_sin_registrar": 0
            }
        }
        
        response = client.post("/contexto", json=request_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_datos_faltantes(self):
        """Datos requeridos faltantes deben devolver error 422"""
        request_data = {
            "perfil": {
                "etapa": "mayor_70",
                "nombre": "Test"
                # Falta modo_comunicacion
            },
            "señales": {
                "hora_acceso": "10:00"
                # Faltan otros campos requeridos
            }
        }
        
        response = client.post("/contexto", json=request_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestEstructuraResponse:
    """Tests de estructura de respuesta"""
    
    def test_response_structure_complete(self):
        """La respuesta debe tener estructura completa y correcta"""
        request_data = {
            "perfil": {
                "etapa": "migrante",
                "nombre": "Miguel",
                "modo_comunicacion": "texto",
                "zona_horaria": "Europe/Madrid"
            },
            "señales": {
                "hora_acceso": "15:30",
                "dia_semana": "viernes",
                "es_madrugada": False,
                "frecuencia_accesos_hoy": 3,
                "duracion_sesion_anterior_seg": 120,
                "tiempo_respuesta_usuario_seg": 60,
                "dias_sin_registrar": 1,
                "checkin_emocional": "normal"
            }
        }
        
        response = client.post("/contexto", json=request_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verificar estructura completa
        assert "contexto_sistema" in data
        assert "estado_inferido" in data
        assert "recomendacion_orquestador" in data
        
        # Verificar estructura de estado_inferido
        estado = data["estado_inferido"]
        assert "estado" in estado
        assert "confianza" in estado
        assert "señales_detectadas" in estado
        
        # Verificar tipos correctos
        assert isinstance(data["contexto_sistema"], str)
        assert isinstance(estado["señales_detectadas"], list)
        assert estado["confianza"] in ["baja", "media"]
        assert estado["estado"] in ["estable", "cansancio", "aislamiento", "ansiedad", "desconexion"]
        assert data["recomendacion_orquestador"] in ["esperar", "contacto_suave", "rutina", "silencio"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])