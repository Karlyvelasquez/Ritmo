"""
Schemas Pydantic para RITMO Backend - Persona A
Modelos de datos para el endpoint /contexto
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import datetime


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


class EstadoInferido(BaseModel):
    """Estado inferido del usuario basado en las señales"""
    estado: Literal["estable", "cansancio", "aislamiento", "ansiedad", "desconexion"] = Field(
        ..., description="Estado inferido del usuario"
    )
    confianza: Literal["baja", "media"] = Field(
        ..., description="Confianza en la inferencia"
    )
    señales_detectadas: List[str] = Field(
        default_factory=list, description="Lista de señales que activaron la inferencia"
    )


class ContextoResponse(BaseModel):
    """Respuesta completa del endpoint /contexto"""
    contexto_sistema: str = Field(..., description="Instrucciones para Claude")
    estado_inferido: EstadoInferido = Field(..., description="Estado inferido del usuario")
    recomendacion_orquestador: Literal["esperar", "contacto_suave", "rutina", "silencio"] = Field(
        ..., description="Recomendación para el orquestador"
    )


class ContextoRequest(BaseModel):
    """Request completo al endpoint /contexto"""
    perfil: PerfilUsuario = Field(..., description="Perfil del usuario")
    señales: SenalesWeb = Field(..., description="Señales del comportamiento web")


# Modelos adicionales para interacción con Supabase
class SesionWeb(BaseModel):
    """Modelo para guardar sesión web en Supabase"""
    user_id: str = Field(..., description="ID del usuario")
    hora_inicio: datetime = Field(..., description="Hora de inicio de sesión")
    hora_fin: Optional[datetime] = Field(None, description="Hora de fin de sesión")
    duracion_seg: Optional[int] = Field(None, description="Duración en segundos")
    hora_local: str = Field(..., description="Hora local en formato HH:MM")
    dia_semana: str = Field(..., description="Día de la semana")
    es_madrugada: bool = Field(..., description="Si es madrugada")


class EventoComportamiento(BaseModel):
    """Modelo para guardar evento de comportamiento en Supabase"""
    user_id: str = Field(..., description="ID del usuario")
    tipo_evento: str = Field(..., description="Tipo de evento")
    valor: str = Field(..., description="Valor del evento")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp del evento")