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
    ESPERANDO_CHECKIN = "esperando_checkin"  # Estado para check-in diario


class EstadoCheckin(str, Enum):
    """Estados emocionales para el check-in diario"""
    BIEN = "bien"
    NORMAL = "normal"
    DIFICIL = "dificil"


class CheckinDiario(BaseModel):
    """Modelo para el check-in emocional diario"""
    user_id: str = Field(..., description="ID del usuario")
    telegram_id: int = Field(..., description="Telegram ID del usuario")
    fecha: datetime = Field(..., description="Fecha del check-in")
    estado_emocional: EstadoCheckin = Field(..., description="Estado emocional reportado")
    hora_respuesta: datetime = Field(..., description="Hora de respuesta")
    metodo: Literal["proactivo", "reactivo"] = Field(..., description="Cómo se obtuvo el check-in")
    mensaje_contexto: Optional[str] = Field(None, description="Mensaje adicional del usuario")


class EstadisticasCheckin(BaseModel):
    """Estadísticas agregadas de check-ins para análisis"""
    user_id: str = Field(..., description="ID del usuario")
    fecha_inicio: datetime = Field(..., description="Fecha de inicio del período")
    fecha_fin: datetime = Field(..., description="Fecha de fin del período")
    
    # Métricas de cumplimiento
    checkins_realizados: int = Field(default=0)
    checkins_esperados: int = Field(default=7)  # Para períodos de 7 días
    tasa_cumplimiento: float = Field(default=0.0)
    
    # Distribución emocional
    dias_bien: int = Field(default=0)
    dias_normal: int = Field(default=0) 
    dias_dificil: int = Field(default=0)
    
    # Tendencias
    tendencia_negativa: bool = Field(default=False)
    racha_actual: int = Field(default=0)  # Días consecutivos con mismo estado
    estado_racha: Optional[EstadoCheckin] = Field(None)


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
    
    # Check-in diario
    ultimo_checkin: Optional[datetime] = Field(None, description="Fecha del último check-in")
    checkin_pendiente: bool = Field(default=False, description="Si tiene check-in pendiente hoy")
    hora_checkin_preferida: str = Field(default="18:00", description="Hora preferida para check-in")