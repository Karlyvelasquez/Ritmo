"""
Tests para modelos del bot de Telegram RITMO
"""

import pytest

from models import (
    UsuarioTelegram, EstadoUsuario, PerfilUsuario
)


@pytest.fixture
def perfil_joven():
    """Fixture de perfil de usuario joven"""
    return PerfilUsuario(
        etapa="joven",
        nombre="Alex",
        modo_comunicacion="texto",
        zona_horaria="Europe/Madrid"
    )


@pytest.fixture
def usuario_test(perfil_joven):
    """Fixture de usuario para tests"""
    return UsuarioTelegram(
        telegram_id=123456789,
        username="test_user",
        first_name="Alex",
        last_name="Test",
        perfil=perfil_joven,
        estado=EstadoUsuario.ACTIVO
    )


class TestUsuarioTelegram:
    """Tests para modelo UsuarioTelegram"""

    def test_usuario_creacion_basica(self):
        """Test creación básica de usuario"""
        usuario = UsuarioTelegram(
            telegram_id=123456789,
            first_name="Test",
            estado=EstadoUsuario.NUEVO
        )

        assert usuario.telegram_id == 123456789
        assert usuario.first_name == "Test"
        assert usuario.estado == EstadoUsuario.NUEVO
        assert usuario.configuracion_completada == False

    def test_usuario_con_perfil_completo(self, usuario_test):
        """Test usuario con perfil completo"""
        assert usuario_test.perfil is not None
        assert usuario_test.perfil.etapa == "joven"
        assert usuario_test.perfil.nombre == "Alex"
        assert usuario_test.estado == EstadoUsuario.ACTIVO


class TestPerfilUsuario:
    """Tests para modelo PerfilUsuario"""

    def test_perfil_mayor_70(self):
        """Test perfil persona mayor"""
        perfil = PerfilUsuario(
            etapa="mayor_70",
            nombre="Carmen",
            modo_comunicacion="audio",
            zona_horaria="Europe/Madrid"
        )

        assert perfil.etapa == "mayor_70"
        assert perfil.modo_comunicacion == "audio"

    def test_perfil_discapacidad_visual(self):
        """Test perfil discapacidad visual"""
        perfil = PerfilUsuario(
            etapa="discapacidad_visual",
            nombre="María",
            modo_comunicacion="audio",
            zona_horaria="Europe/Madrid"
        )

        assert perfil.etapa == "discapacidad_visual"
        assert perfil.modo_comunicacion == "audio"

    def test_zona_horaria_default(self):
        """Test zona horaria por defecto"""
        perfil = PerfilUsuario(
            etapa="joven",
            nombre="Test",
            modo_comunicacion="texto"
        )

        assert perfil.zona_horaria == "Europe/Madrid"


class TestEnums:
    """Tests para enums"""

    def test_estado_usuario_valores(self):
        """Test valores de EstadoUsuario"""
        assert EstadoUsuario.NUEVO.value == "nuevo"
        assert EstadoUsuario.IDENTIFICANDO.value == "identificando"
        assert EstadoUsuario.ACTIVO.value == "activo"
        assert EstadoUsuario.INACTIVO.value == "inactivo"
        assert EstadoUsuario.BLOQUEADO.value == "bloqueado"