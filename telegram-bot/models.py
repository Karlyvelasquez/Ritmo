"""
Modelos específicos para el bot de Telegram RITMO
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class PerfilUsuario(BaseModel):
    """Perfil del usuario con su etapa de vida y preferencias"""
    etapa: Literal["mayor_70", "adulto_activo", "joven", "migrante", "discapacidad_visual"] = Field(
        ..., description="Etapa de vida del usuario"
    )
    nombre: str = Field(..., description="Nombre del usuario")
    modo_comunicacion: Literal["audio", "texto", "mixto"] = Field(
        ..., description="Modo preferido de comunicación"
    )
    zona_horaria: str = Field(
        default="Europe/Madrid", description="Zona horaria del usuario"
    )


class SenalesWeb(BaseModel):
    """Señales del comportamiento web del usuario"""
    hora_acceso: str = Field(..., description="Hora de acceso en formato HH:MM")
    dia_semana: str = Field(..., description="Día de la semana")
    es_madrugada: bool = Field(..., description="Si el acceso es en madrugada")
    frecuencia_accesos_hoy: int = Field(..., description="Número de accesos hoy")
    duracion_sesion_anterior_seg: int = Field(..., description="Duración de la sesión anterior en segundos")
    tiempo_respuesta_usuario_seg: int = Field(..., description="Tiempo de respuesta del usuario en segundos")
    dias_sin_registrar: int = Field(..., description="Días sin registrar actividad")
    checkin_emocional: Optional[Literal["dificil", "normal", "bien"]] = Field(
        None, description="Estado emocional reportado por el usuario"
    )


class EstadoUsuario(str, Enum):
    """Estados posibles del usuario en el bot"""
    NUEVO = "nuevo"
    IDENTIFICANDO = "identificando"
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    BLOQUEADO = "bloqueado"


class UsuarioTelegram(BaseModel):
    """Modelo de usuario para Telegram"""
    telegram_id: int = Field(..., description="ID único de Telegram")
    username: Optional[str] = Field(None, description="Username de Telegram")
    first_name: str = Field(..., description="Nombre de pila")
    last_name: Optional[str] = Field(None, description="Apellido")

    # Perfil RITMO (cargado desde la BD de la app)
    perfil: Optional[PerfilUsuario] = Field(None, description="Perfil RITMO del usuario")

    # Estado del bot
    estado: EstadoUsuario = Field(default=EstadoUsuario.NUEVO)

    # Metadatos de sesión
    ultima_interaccion: Optional[datetime] = Field(None)
    configuracion_completada: bool = Field(default=False)