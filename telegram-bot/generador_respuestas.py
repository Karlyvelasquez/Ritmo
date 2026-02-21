"""
Generador de Respuestas Adaptativas para RITMO
Integra análisis contextual, ML y estado emocional para generar respuestas personalizadas.

Funcionalidades:
- Respuestas adaptadas al perfil de riesgo ML
- Personalización según el estado emocional actual  
- Recomendaciones específicas basadas en patrones históricos
- Tono y contenido adaptativo según el contexto
"""

import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

from motor_analisis import MetricasEmocionales, AlertaAnalisis, NivelAlerta

logger = logging.getLogger(__name__)


class TonoRespuesta(Enum):
    """Tonos de respuesta según el contexto del usuario"""
    CELEBRATORIO = "celebratorio"  # Usuario va muy bien
    ALENTADOR = "alentador"       # Usuario va bien pero puede mejorar  
    EMPÁTICO = "empático"         # Usuario tiene dificultades
    URGENTE = "urgente"           # Usuario en riesgo crítico
    NEUTRAL = "neutral"           # Sin información suficiente


class TipoRespuesta(Enum):
    """Tipos de respuesta según la situación"""
    CHECK_IN_POSITIVO = "checkin_positivo"
    CHECK_IN_NORMAL = "checkin_normal" 
    CHECK_IN_DIFICIL = "checkin_dificil"
    ANALISIS_PERSONAL = "analisis_personal"
    ALERTA_RIESGO = "alerta_riesgo"
    MOTIVACIONAL = "motivacional"
    RECURSOS_APOYO = "recursos_apoyo"


@dataclass
class ContextoUsuario:
    """Contexto completo del usuario para generar respuesta adaptativa"""
    user_id: str
    nombre: str
    estado_emocional_actual: str
    metricas: Optional[MetricasEmocionales] = None
    alertas: Optional[List[AlertaAnalisis]] = None
    ml_prediccion: Optional[Dict] = None
    puntuacion_riesgo: Optional[Dict] = None
    dias_sin_checkin: int = 0
    es_nuevo_usuario: bool = False


class GeneradorRespuestasAdaptativas:
    """Generador principal de respuestas personalizadas"""
    
    def __init__(self):
        # Configurar plantillas de respuesta por tono y tipo
        self._plantillas = self._inicializar_plantillas()
        
    def generar_respuesta(
        self, 
        contexto: ContextoUsuario, 
        tipo_respuesta: TipoRespuesta
    ) -> str:
        """
        Genera una respuesta adaptativa basada en el contexto completo del usuario.
        
        Args:
            contexto: Contexto completo del usuario
            tipo_respuesta: Tipo de respuesta a generar
            
        Returns:
            String con la respuesta personalizada
        """
        try:
            # 1. Determinar el tono apropiado
            tono = self._determinar_tono(contexto)
            
            # 2. Generar respuesta base
            respuesta_base = self._generar_respuesta_base(contexto, tipo_respuesta, tono)
            
            # 3. Agregar elementos personalizados
            respuesta_personalizada = self._personalizar_respuesta(respuesta_base, contexto)
            
            # 4. Agregar recomendaciones específicas
            respuesta_final = self._agregar_recomendaciones_contextuales(respuesta_personalizada, contexto)
            
            logger.info(f"Respuesta generada para usuario {contexto.user_id}: tono={tono.value}, tipo={tipo_respuesta.value}")
            return respuesta_final
            
        except Exception as e:
            logger.error(f"Error generando respuesta adaptativa: {e}")
            return self._respuesta_fallback(contexto)
    
    def _determinar_tono(self, contexto: ContextoUsuario) -> TonoRespuesta:
        """Determina el tono apropiado basado en el contexto del usuario"""
        
        # Prioridad 1: Riesgo crítico detectado
        if contexto.alertas:
            alertas_criticas = [a for a in contexto.alertas if a.nivel == NivelAlerta.CRITICO]
            if alertas_criticas:
                return TonoRespuesta.URGENTE
        
        # Prioridad 2: Predicción ML de riesgo alto
        if contexto.ml_prediccion and contexto.ml_prediccion.get("categoria") == "ALTO":
            return TonoRespuesta.URGENTE
        elif contexto.ml_prediccion and contexto.ml_prediccion.get("categoria") == "MEDIO":
            return TonoRespuesta.EMPÁTICO
            
        # Prioridad 3: Estado emocional actual
        if contexto.estado_emocional_actual in ["dificil", "mal", "muy_mal"]:
            return TonoRespuesta.EMPÁTICO
        elif contexto.estado_emocional_actual == "bien":
            # Verificar si realmente va bien o solo hoy
            if contexto.metricas and contexto.metricas.dias_bien >= contexto.metricas.dias_dificil:
                return TonoRespuesta.CELEBRATORIO
            else:
                return TonoRespuesta.ALENTADOR
                
        # Prioridad 4: Métricas generales
        if contexto.metricas:
            if contexto.metricas.cumplimiento_porcentaje >= 80 and contexto.metricas.tendencia == "mejorando":
                return TonoRespuesta.CELEBRATORIO
            elif contexto.metricas.cumplimiento_porcentaje < 40:
                return TonoRespuesta.EMPÁTICO
            elif contexto.metricas.tendencia == "empeorando":
                return TonoRespuesta.EMPÁTICO
            else:
                return TonoRespuesta.ALENTADOR
                
        return TonoRespuesta.NEUTRAL
    
    def _generar_respuesta_base(
        self, 
        contexto: ContextoUsuario, 
        tipo: TipoRespuesta, 
        tono: TonoRespuesta
    ) -> str:
        """Genera la respuesta base según tipo y tono"""
        
        plantillas = self._plantillas.get(tipo, {}).get(tono, [])
        if not plantillas:
            return self._respuesta_fallback(contexto)
        
        # Seleccionar plantilla apropiada (podríamos hacer esto más inteligente)
        import random
        plantilla = random.choice(plantillas)
        
        # Reemplazar variables en la plantilla
        return plantilla.format(
            nombre=contexto.nombre,
            cumplimiento=getattr(contexto.metricas, 'cumplimiento_porcentaje', 0) if contexto.metricas else 0,
            dias_bien=getattr(contexto.metricas, 'dias_bien', 0) if contexto.metricas else 0,
            dias_dificil=getattr(contexto.metricas, 'dias_dificil', 0) if contexto.metricas else 0,
            tendencia=getattr(contexto.metricas, 'tendencia', 'estable') if contexto.metricas else 'estable'
        )
    
    def _personalizar_respuesta(self, respuesta_base: str, contexto: ContextoUsuario) -> str:
        """Personaliza la respuesta con detalles específicos del usuario"""
        
        personalizaciones = []
        
        # Agregar información sobre racha positiva/negativa
        if contexto.metricas:
            if contexto.metricas.racha_actual_negativa > 0:
                if contexto.metricas.racha_actual_negativa == 1:
                    personalizaciones.append("Recuerda que mañana es una nueva oportunidad 💙")
                elif contexto.metricas.racha_actual_negativa >= 3:
                    personalizaciones.append("Has tenido algunos días difíciles seguidos. Estoy aquí para acompañarte.")
            
            # Celebrar cumplimiento alto
            if contexto.metricas.cumplimiento_porcentaje >= 90:
                personalizaciones.append("¡Tu constancia en los check-ins es ejemplar! 🎯")
                
        # Agregar información sobre predicción ML si es relevante
        if contexto.ml_prediccion and contexto.ml_prediccion.get("probabilidad"):
            prob = contexto.ml_prediccion["probabilidad"]
            if prob < 0.2:
                personalizaciones.append("Los indicadores muestran que estás en un buen camino 📈")
            elif prob > 0.6:
                personalizaciones.append("Algunos patrones sugieren que podríamos ajustar el enfoque juntos.")
        
        # Agregar personalizaciones a la respuesta
        if personalizaciones:
            respuesta_base += "\n\n" + " ".join(personalizaciones)
            
        return respuesta_base
    
    def _agregar_recomendaciones_contextuales(self, respuesta: str, contexto: ContextoUsuario) -> str:
        """Agrega recomendaciones específicas según el contexto"""
        
        recomendaciones = []
        
        # Recomendaciones basadas en alertas
        if contexto.alertas:
            for alerta in contexto.alertas[:2]:  # Máximo 2 alertas
                if alerta.nivel == NivelAlerta.CRITICO:
                    recomendaciones.append(f"🚨 {alerta.recomendacion}")
                elif alerta.nivel == NivelAlerta.PREOCUPANTE:
                    recomendaciones.append(f"⚠️ {alerta.recomendacion}")
        
        # Recomendaciones basadas en ML y métricas
        if contexto.ml_prediccion and contexto.ml_prediccion.get("categoria") in ["ALTO", "MEDIO"]:
            if contexto.metricas and contexto.metricas.cumplimiento_porcentaje < 60:
                recomendaciones.append("💙 Considera establecer recordatorios para tus check-ins diarios.")
            
            if contexto.metricas and contexto.metricas.dias_dificil > contexto.metricas.dias_bien:
                recomendaciones.append("🌱 ¿Te gustaría que conversemos sobre estrategias de bienestar?")
        
        # Recomendaciones motivacionales
        if contexto.metricas and contexto.metricas.tendencia == "mejorando":
            recomendaciones.append("✨ Continúa con lo que estás haciendo, va funcionando.")
        
        # Agregar recomendaciones si las hay
        if recomendaciones:
            respuesta += "\n\n**Sugerencias:**\n"
            for rec in recomendaciones[:3]:  # Máximo 3 recomendaciones
                respuesta += f"• {rec}\n"
                
        return respuesta
    
    def _respuesta_fallback(self, contexto: ContextoUsuario) -> str:
        """Respuesta de seguridad cuando algo falla"""
        return f"Hola {contexto.nombre} 💙\n\nGracias por conectar conmigo. Estoy aquí para acompañarte en lo que necesites."
    
    def _inicializar_plantillas(self) -> Dict:
        """Inicializa las plantillas de respuesta organizadas por tipo y tono"""
        
        return {
            TipoRespuesta.CHECK_IN_POSITIVO: {
                TonoRespuesta.CELEBRATORIO: [
                    "¡Qué alegría saber que te sientes bien hoy, {nombre}! 🌟\n\nTu constancia y actitud positiva son inspiradoras. Sigue así 💙",
                    "¡Excelente {nombre}! 😊\n\nEs genial verte mantener esa energía positiva. Tu bienestar es una prioridad y se nota que lo cuidas."
                ],
                TonoRespuesta.ALENTADOR: [
                    "Me alegra mucho saber que hoy te sientes bien, {nombre} 😊\n\nCada día positivo cuenta y es valioso.",
                    "¡Qué bueno escuchar eso, {nombre}! 💙\n\nEstos momentos de bienestar son importantes para tu equilibrio."
                ]
            },
            
            TipoRespuesta.CHECK_IN_NORMAL: {
                TonoRespuesta.NEUTRAL: [
                    "Gracias por compartir cómo te sientes, {nombre} 💙\n\nLos días normales también son valiosos para tu proceso.",
                    "Entiendo, {nombre}. Un día normal también es un día que cuenta 💙"
                ],
                TonoRespuesta.ALENTADOR: [
                    "Está bien tener días normales, {nombre} 💙\n\nLo importante es que sigues conectando conmigo y cuidando tu bienestar."
                ]
            },
            
            TipoRespuesta.CHECK_IN_DIFICIL: {
                TonoRespuesta.EMPÁTICO: [
                    "Gracias por confiar en mí y contarme que hoy ha sido difícil, {nombre} 💙\n\nLo que sientes es válido y no estás solo.",
                    "Siento que hoy haya sido un día complicado, {nombre} 💙\n\nTu valentía para compartir esto conmigo es admirable.",
                    "Te acompaño en este momento difícil, {nombre} 💙\n\nRecuerda que los días difíciles no duran, pero las personas fuertes sí."
                ],
                TonoRespuesta.URGENTE: [
                    "Gracias por contarme cómo te sientes, {nombre}. Tu confianza significa mucho 💙\n\n¿Te gustaría que conversemos sobre lo que está pasando? Estoy aquí para acompañarte."
                ]
            },
            
            TipoRespuesta.ANALISIS_PERSONAL: {
                TonoRespuesta.CELEBRATORIO: [
                    "¡{nombre}, tus resultados son realmente increíbles! 🎉\n\nTu dedicación se refleja claramente en tu {cumplimiento:.0f}% de cumplimiento y tu tendencia {tendencia}."
                ],
                TonoRespuesta.ALENTADOR: [
                    "Veo progreso en tu proceso, {nombre} 💙\n\nTu cumplimiento del {cumplimiento:.0f}% demuestra tu compromiso contigo mismo."
                ],
                TonoRespuesta.EMPÁTICO: [
                    "Gracias por permitirme acompañarte en este proceso, {nombre} 💙\n\nVeo que has tenido {dias_dificil} días difíciles, y quiero que sepas que eso no define tu valor."
                ]
            },
            
            TipoRespuesta.MOTIVACIONAL: {
                TonoRespuesta.ALENTADOR: [
                    "Recuerda {nombre}, cada pequeño paso cuenta en tu camino hacia el bienestar 💙\n\nEstoy orgulloso de tu perseverancia.",
                    "Tu proceso es único y valioso, {nombre} ✨\n\nCada día que te conectas conmigo es una muestra de tu fortaleza interior."
                ]
            },
            
            TipoRespuesta.RECURSOS_APOYO: {
                TonoRespuesta.EMPÁTICO: [
                    "{nombre}, quiero recordarte que tienes recursos y personas que te apoyan 💙\n\nNo dudes en buscar ayuda cuando la necesites."
                ],
                TonoRespuesta.URGENTE: [
                    "{nombre}, tu bienestar es lo más importante 💙\n\nSi sientes que necesitas apoyo adicional, no dudes en contactar a tu red de apoyo o servicios profesionales."
                ]
            }
        }


# ------------------------------------------------------------------ #
#  Funciones de utilidad para integración                             #
# ------------------------------------------------------------------ #

def generar_respuesta_check_in_adaptativa(
    user_id: str,
    nombre: str, 
    estado_emocional: str,
    metricas: Optional[MetricasEmocionales] = None,
    alertas: Optional[List[AlertaAnalisis]] = None,
    ml_prediccion: Optional[Dict] = None
) -> str:
    """
    Función de conveniencia para generar respuestas de check-in adaptativas.
    
    Args:
        user_id: ID del usuario
        nombre: Nombre del usuario
        estado_emocional: Estado emocional actual ("bien", "normal", "dificil")
        metricas: Métricas emocionales del análisis
        alertas: Lista de alertas detectadas
        ml_prediccion: Predicción del modelo ML
        
    Returns:
        Respuesta personalizada para el check-in
    """
    
    # Crear contexto
    contexto = ContextoUsuario(
        user_id=user_id,
        nombre=nombre,
        estado_emocional_actual=estado_emocional,
        metricas=metricas,
        alertas=alertas,
        ml_prediccion=ml_prediccion
    )
    
    # Determinar tipo de respuesta según estado emocional
    if estado_emocional == "bien":
        tipo = TipoRespuesta.CHECK_IN_POSITIVO
    elif estado_emocional == "normal":
        tipo = TipoRespuesta.CHECK_IN_NORMAL
    else:  # dificil, mal, muy_mal
        tipo = TipoRespuesta.CHECK_IN_DIFICIL
    
    # Generar respuesta
    generador = GeneradorRespuestasAdaptativas()
    return generador.generar_respuesta(contexto, tipo)


def generar_respuesta_analisis_adaptativa(
    user_id: str,
    nombre: str,
    metricas: MetricasEmocionales,
    alertas: List[AlertaAnalisis],
    ml_prediccion: Dict,
    puntuacion_riesgo: Dict
) -> str:
    """
    Función de conveniencia para generar respuestas de análisis adaptativas.
    
    Args:
        user_id: ID del usuario
        nombre: Nombre del usuario  
        metricas: Métricas emocionales del análisis
        alertas: Lista de alertas detectadas
        ml_prediccion: Predicción del modelo ML
        puntuacion_riesgo: Puntuación de riesgo heurística
        
    Returns:
        Respuesta personalizada para el análisis
    """
    
    # Crear contexto completo
    contexto = ContextoUsuario(
        user_id=user_id,
        nombre=nombre,
        estado_emocional_actual="",  # No aplicable para análisis
        metricas=metricas,
        alertas=alertas,
        ml_prediccion=ml_prediccion,
        puntuacion_riesgo=puntuacion_riesgo
    )
    
    # Generar respuesta de análisis
    generador = GeneradorRespuestasAdaptativas()
    return generador.generar_respuesta(contexto, TipoRespuesta.ANALISIS_PERSONAL)