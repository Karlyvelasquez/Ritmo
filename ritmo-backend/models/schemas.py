"""
Schemas Pydantic para RITMO Backend - Persona A
Modelos de datos para el endpoint /contexto
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict
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


# === NUEVOS SCHEMAS PARA CHAT Y PROACTIVO ===

class ChatRequest(BaseModel):
    """Request para el endpoint /chat"""
    user_id: str = Field(..., description="ID del usuario")
    mensaje: str = Field(..., description="Mensaje del usuario")
    perfil: PerfilUsuario = Field(..., description="Perfil del usuario")
    contexto_previo: Optional[List[Dict[str, str]]] = Field(
        default_factory=list, description="Últimos mensajes del chat"
    )


class ChatResponse(BaseModel):
    """Response del endpoint /chat"""
    respuesta: str = Field(..., description="Respuesta generada por Claude")
    tono: Literal["empático", "alentador", "neutral", "celebratorio"] = Field(
        ..., description="Tono de la respuesta"
    )
    necesita_seguimiento: bool = Field(
        default=False, description="Si necesita seguimiento posterior"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp de la respuesta"
    )


class ProactivoRequest(BaseModel):
    """Request para el endpoint /proactivo"""
    user_id: str = Field(..., description="ID del usuario")
    perfil: PerfilUsuario = Field(..., description="Perfil del usuario")
    estado_actual: EstadoInferido = Field(..., description="Estado inferido actual")
    dias_sin_actividad: int = Field(default=0, description="Días sin actividad")
    tipo_mensaje: Literal["check_in", "habito", "motivacional", "apoyo"] = Field(
        ..., description="Tipo de mensaje proactivo"
    )


class ProactivoResponse(BaseModel):
    """Response del endpoint /proactivo"""
    mensaje: str = Field(..., description="Mensaje proactivo generado")
    canal_recomendado: Literal["chat", "notificacion", "email"] = Field(
        ..., description="Canal recomendado para enviar el mensaje"
    )
    momento_optimo: str = Field(..., description="Momento óptimo para enviar (HH:MM)")
    prioridad: Literal["baja", "media", "alta"] = Field(
        ..., description="Prioridad del mensaje"
    )


# === SCHEMAS PARA PREDICCIÓN ML ===

class PrediccionRiesgo(BaseModel):
    """Predicción de riesgo usando ML"""
    probabilidad_riesgo: float = Field(
        ..., ge=0, le=1, description="Probabilidad de riesgo (0-1)"
    )
    nivel_riesgo: Literal["bajo", "medio", "alto", "critico"] = Field(
        ..., description="Nivel de riesgo categórico"
    )
    factores_riesgo: List[str] = Field(
        default_factory=list, description="Factores que contribuyen al riesgo"
    )
    confianza_modelo: float = Field(
        ..., ge=0, le=1, description="Confianza del modelo ML"
    )


# === SCHEMAS PARA ADMIN/STATS ===

class EstadisticasAdmin(BaseModel):
    """Estadísticas anonimizadas para admin"""
    total_usuarios_activos: int = Field(..., description="Usuarios activos (últimos 7 días)")
    sesiones_hoy: int = Field(..., description="Sesiones iniciadas hoy")
    promedio_duracion_sesion_min: float = Field(
        ..., description="Duración promedio de sesión en minutos"
    )
    distribucion_estados: Dict[str, int] = Field(
        ..., description="Distribución de estados inferidos"
    )
    distribucion_etapas_vida: Dict[str, int] = Field(
        ..., description="Distribución por etapa de vida"
    )
    alertas_riesgo_activas: int = Field(
        ..., description="Número de alertas de riesgo activas"
    )
    tendencias_semanales: Dict[str, List[float]] = Field(
        ..., description="Tendencias de uso por día de la semana"
    )
    fecha_generacion: datetime = Field(
        default_factory=datetime.utcnow, description="Fecha de generación del reporte"
    )