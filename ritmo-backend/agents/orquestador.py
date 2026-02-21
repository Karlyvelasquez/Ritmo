"""
Orquestador Central
Decide si la IA responde, espera o guarda silencio
Coordina todos los agentes y estrategias de respuesta
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, time
from enum import Enum

from models.schemas import EstadoInferido, PerfilUsuario, PrediccionRiesgo

# Configurar logging
logger = logging.getLogger(__name__)


class DecisionOrquestador(Enum):
    """Decisiones posibles del orquestador"""
    RESPONDER = "responder"
    ESPERAR = "esperar"
    SILENCIO = "silencio"
    CONTACTO_SUAVE = "contacto_suave"
    RUTINA = "rutina"


class TipoEstrategia(Enum):
    """Tipos de estrategia de respuesta"""
    EMPATICO = "empático"
    ALENTADOR = "alentador"
    NEUTRAL = "neutral"
    HABITOS = "hábitos"
    PROACTIVO = "proactivo"
    URGENTE = "urgente"


class OrquestadorCentral:
    """
    Orquestador central que decide cómo y cuándo responder
    Integra análisis de patrones, predicción ML y contexto del usuario
    """
    
    def __init__(self):
        self.reglas_decision = self._inicializar_reglas_decision()
        self.umbrales_riesgo = self._inicializar_umbrales_riesgo()
    
    def _inicializar_reglas_decision(self) -> Dict[str, Dict]:
        """Inicializa reglas de decisión por estado y contexto"""
        return {
            "critico": {
                "decision": DecisionOrquestador.CONTACTO_SUAVE,
                "estrategia": TipoEstrategia.URGENTE,
                "prioridad": "alta",
                "tiempo_respuesta_seg": 30
            },
            "ansiedad": {
                "decision": DecisionOrquestador.CONTACTO_SUAVE,
                "estrategia": TipoEstrategia.EMPATICO,
                "prioridad": "media",
                "tiempo_respuesta_seg": 60
            },
            "aislamiento": {
                "decision": DecisionOrquestador.CONTACTO_SUAVE,
                "estrategia": TipoEstrategia.EMPATICO,
                "prioridad": "media", 
                "tiempo_respuesta_seg": 300  # 5 minutos
            },
            "cansancio": {
                "decision": DecisionOrquestador.RESPONDER,
                "estrategia": TipoEstrategia.ALENTADOR,
                "prioridad": "baja",
                "tiempo_respuesta_seg": 600  # 10 minutos
            },
            "estable": {
                "decision": DecisionOrquestador.RUTINA,
                "estrategia": TipoEstrategia.HABITOS,
                "prioridad": "baja",
                "tiempo_respuesta_seg": 1800  # 30 minutos
            },
            "desconexion": {
                "decision": DecisionOrquestador.ESPERAR,
                "estrategia": TipoEstrategia.NEUTRAL,
                "prioridad": "baja",
                "tiempo_respuesta_seg": 3600  # 1 hora
            }
        }
    
    def _inicializar_umbrales_riesgo(self) -> Dict[str, float]:
        """Inicializa umbrales para predicción ML de riesgo"""
        return {
            "critico": 0.8,
            "alto": 0.6,
            "medio": 0.4,
            "bajo": 0.2
        }
    
    def decidir_estrategia_respuesta(
        self,
        estado_inferido: EstadoInferido,
        prediccion_riesgo: Optional[PrediccionRiesgo],
        perfil: PerfilUsuario,
        hora_actual: str,
        dias_sin_actividad: int = 0,
        contexto_adicional: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Decide la estrategia completa de respuesta
        
        Args:
            estado_inferido: Estado inferido por el agente de patrones
            prediccion_riesgo: Predicción ML opcional
            perfil: Perfil del usuario
            hora_actual: Hora actual en formato HH:MM
            dias_sin_actividad: Días sin actividad del usuario
            contexto_adicional: Contexto adicional opcional
            
        Returns:
            Dict con la estrategia completa de respuesta
        """
        try:
            logger.info(f"Making orchestrator decision for state: {estado_inferido.estado}")
            
            # 1. Evaluar situación crítica (predicción ML tiene prioridad)
            if prediccion_riesgo and prediccion_riesgo.probabilidad_riesgo >= self.umbrales_riesgo["critico"]:
                return self._estrategia_situacion_critica(prediccion_riesgo, perfil)
            
            # 2. Evaluar horario (silencio en horas inapropiadas)
            if self._es_hora_silencio(hora_actual):
                return self._estrategia_silencio(hora_actual)
            
            # 3. Aplicar reglas por estado inferido
            regla_base = self.reglas_decision.get(estado_inferido.estado)
            if not regla_base:
                regla_base = self.reglas_decision["estable"]  # Fallback
            
            # 4. Ajustar estrategia por contexto específico
            estrategia = self._ajustar_estrategia_por_contexto(
                regla_base.copy(),
                estado_inferido,
                prediccion_riesgo,
                perfil,
                dias_sin_actividad
            )
            
            # 5. Validar y finalizar estrategia
            estrategia_final = self._validar_estrategia(estrategia, perfil, hora_actual)
            
            logger.info(f"Orchestrator decision: {estrategia_final['decision']} with strategy {estrategia_final['estrategia']}")
            return estrategia_final
            
        except Exception as e:
            logger.error(f"Error in orchestrator decision: {e}")
            return self._estrategia_fallback()
    
    def decidir_estrategia_chat(
        self,
        mensaje: str,
        tono_usuario: str,
        prediccion_riesgo: Optional[PrediccionRiesgo],
        perfil: PerfilUsuario,
        contexto_previo: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Decide estrategia específica para respuesta de chat
        
        Args:
            mensaje: Mensaje del usuario
            tono_usuario: Tono detectado del mensaje
            prediccion_riesgo: Predicción ML opcional
            perfil: Perfil del usuario
            contexto_previo: Historial de chat
            
        Returns:
            Dict con estrategia de chat
        """
        try:
            # 1. Evaluar urgencia del mensaje
            if tono_usuario == "urgente" or (prediccion_riesgo and prediccion_riesgo.nivel_riesgo == "critico"):
                return {
                    "tipo": "urgente",
                    "estrategia": TipoEstrategia.URGENTE,
                    "prioridad": "critica",
                    "tiempo_respuesta_seg": 15
                }
            
            # 2. Mapear tono a estrategia
            mapeo_tono_estrategia = {
                "positivo": TipoEstrategia.ALENTADOR,
                "negativo": TipoEstrategia.EMPATICO,
                "neutral": TipoEstrategia.NEUTRAL,
                "urgente": TipoEstrategia.URGENTE
            }
            
            estrategia = mapeo_tono_estrategia.get(tono_usuario, TipoEstrategia.NEUTRAL)
            
            # 3. Ajustar por contexto de conversación
            if self._detectar_patron_repetitivo(contexto_previo):
                estrategia = TipoEstrategia.PROACTIVO  # Cambiar dinámica
            
            return {
                "tipo": "chat",
                "estrategia": estrategia,
                "tono_usuario": tono_usuario,
                "prioridad": "media",
                "tiempo_respuesta_seg": 30
            }
            
        except Exception as e:
            logger.error(f"Error deciding chat strategy: {e}")
            return {"tipo": "chat", "estrategia": TipoEstrategia.NEUTRAL}
    
    def debe_enviar_proactivo(
        self,
        estado: EstadoInferido,
        dias_sin_actividad: int,
        perfil: PerfilUsuario
    ) -> bool:
        """
        Decide si debe enviar un mensaje proactivo
        
        Args:
            estado: Estado inferido del usuario
            dias_sin_actividad: Días sin actividad
            perfil: Perfil del usuario
            
        Returns:
            bool: True si debe enviar mensaje proactivo
        """
        try:
            # 1. No enviar si está en estado crítico (debe ser reactivo)
            if estado.estado in ["ansiedad", "aislamiento", "desconexion"]:
                return False
            
            # 2. Enviar si hay muchos días sin actividad y estado es estable
            if estado.estado == "estable" and dias_sin_actividad >= 2:
                return True
            
            # 3. Enviar ocasionalmente a usuarios estables (rutinas)
            if estado.estado == "estable" and dias_sin_actividad == 0:
                return True  # Para rutinas diarias
            
            # 4. No enviar por defecto
            return False
            
        except Exception as e:
            logger.error(f"Error deciding proactive message: {e}")
            return False
    
    def _estrategia_situacion_critica(
        self, 
        prediccion_riesgo: PrediccionRiesgo, 
        perfil: PerfilUsuario
    ) -> Dict[str, Any]:
        """Estrategia para situaciones críticas"""
        return {
            "decision": DecisionOrquestador.CONTACTO_SUAVE,
            "estrategia": TipoEstrategia.URGENTE,
            "prioridad": "critica",
            "tiempo_respuesta_seg": 15,
            "factores_riesgo": prediccion_riesgo.factores_riesgo,
            "requiere_escalacion": True,
            "recursos_sugeridos": ["linea_crisis", "profesional_salud"]
        }
    
    def _estrategia_silencio(self, hora_actual: str) -> Dict[str, Any]:
        """Estrategia de silencio para horas inapropiadas"""
        return {
            "decision": DecisionOrquestador.SILENCIO,
            "estrategia": TipoEstrategia.NEUTRAL,
            "prioridad": "ninguna",
            "tiempo_respuesta_seg": None,
            "razon": f"Hora de silencio: {hora_actual}"
        }
    
    def _ajustar_estrategia_por_contexto(
        self,
        estrategia_base: Dict,
        estado_inferido: EstadoInferido,
        prediccion_riesgo: Optional[PrediccionRiesgo],
        perfil: PerfilUsuario,
        dias_sin_actividad: int
    ) -> Dict[str, Any]:
        """Ajusta estrategia base según contexto específico"""
        
        # Ajuste por nivel de confianza del estado inferido
        if estado_inferido.confianza == "baja":
            estrategia_base["estrategia"] = TipoEstrategia.NEUTRAL
            estrategia_base["tiempo_respuesta_seg"] *= 2
        
        # Ajuste por predicción ML
        if prediccion_riesgo:
            if prediccion_riesgo.nivel_riesgo == "alto":
                estrategia_base["prioridad"] = "alta"
                estrategia_base["tiempo_respuesta_seg"] = min(estrategia_base["tiempo_respuesta_seg"], 120)
        
        # Ajuste por días sin actividad
        if dias_sin_actividad > 5:
            estrategia_base["decision"] = DecisionOrquestador.CONTACTO_SUAVE
            estrategia_base["prioridad"] = "media"
        
        # Ajuste por etapa de vida
        if perfil.etapa == "mayor_70":
            # Más paciencia y menos frecuencia para adultos mayores
            estrategia_base["tiempo_respuesta_seg"] *= 1.5
        elif perfil.etapa == "joven":
            # Respuesta más rápida para jóvenes
            estrategia_base["tiempo_respuesta_seg"] *= 0.7
        
        return estrategia_base
    
    def _validar_estrategia(
        self, 
        estrategia: Dict, 
        perfil: PerfilUsuario, 
        hora_actual: str
    ) -> Dict[str, Any]:
        """Valida y ajusta la estrategia final"""
        
        # Asegurar campos requeridos
        if "decision" not in estrategia:
            estrategia["decision"] = DecisionOrquestador.ESPERAR
        if "estrategia" not in estrategia:
            estrategia["estrategia"] = TipoEstrategia.NEUTRAL
        
        # Ajuste por modo de comunicación
        estrategia["modo_comunicacion"] = perfil.modo_comunicacion
        
        # Añadir timestamp
        estrategia["timestamp"] = datetime.utcnow()
        
        return estrategia
    
    def _estrategia_fallback(self) -> Dict[str, Any]:
        """Estrategia de fallback en caso de errores"""
        return {
            "decision": DecisionOrquestador.ESPERAR,
            "estrategia": TipoEstrategia.NEUTRAL,
            "prioridad": "baja",
            "tiempo_respuesta_seg": 600,
            "razon": "Estrategia de fallback por error"
        }
    
    def _es_hora_silencio(self, hora_actual: str) -> bool:
        """Determina si es hora de silencio"""
        try:
            hora, minuto = map(int, hora_actual.split(':'))
            hora_decimal = hora + minuto / 60
            
            # Silencio: madrugada (22:00-06:00) y hora de comida (13:30-15:00)
            return ((hora_decimal >= 22 or hora_decimal <= 6) or 
                    (13.5 <= hora_decimal <= 15))
        except ValueError:
            return False
    
    def _detectar_patron_repetitivo(self, contexto_previo: List[Dict[str, str]]) -> bool:
        """Detecta si hay patrones repetitivos en la conversación"""
        if len(contexto_previo) < 3:
            return False
        
        # Simplificado: detectar respuestas muy similares
        ultimas_respuestas = [msg.get("respuesta_sistema", "") for msg in contexto_previo[-3:]]
        
        # Si las respuestas son muy cortas y similares, posible patrón repetitivo
        if all(len(resp) < 50 for resp in ultimas_respuestas):
            return True
        
        return False


# Instancia global del orquestador
orquestador_global = OrquestadorCentral()