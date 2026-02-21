"""
Agente de Predicción ML
Integra el modelo de predicción de riesgo con el orquestador
Conecta la funcionalidad ML del telegram-bot con el backend principal
"""

import logging
from typing import Optional, Dict, List, Tuple
import os
import numpy as np
from datetime import datetime, timedelta
import asyncio

from models.schemas import PrediccionRiesgo, PerfilUsuario
from db.sesiones import obtener_historial_usuario

# Configurar logging
logger = logging.getLogger(__name__)

# Intentar importar funcionalidades ML del telegram-bot
CargarModeloRiesgo = None
extraer_caracteristicas_riesgo = None
MotorAnalisis = None
NivelAlerta = None

try:
    import sys
    bot_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "telegram-bot")
    if bot_path not in sys.path:
        sys.path.append(bot_path)
    
    # Importar predictor ML del telegram-bot
    from entrenar_modelo_riesgo import CargarModeloRiesgo, extraer_caracteristicas_riesgo
    from motor_analisis import MotorAnalisis, NivelAlerta
    
    ML_DISPONIBLE = True
    logger.info("ML prediction modules loaded successfully")
    
except (ImportError, ModuleNotFoundError) as e:
    logger.warning(f"ML modules not available: {e}. Using fallback predictions.")
    ML_DISPONIBLE = False
except Exception as e:
    logger.warning(f"Unexpected error loading ML modules: {e}. Using fallback predictions.")
    ML_DISPONIBLE = False


class PredictorRiesgoML:
    """Predictor de riesgo usando modelos ML entrenados"""
    
    def __init__(self):
        self.modelo_cargado = False
        self.modelo = None
        self.scaler = None
        self.motor_analisis = None
        
        if ML_DISPONIBLE:
            self._inicializar_modelo()
    
    def _inicializar_modelo(self):
        """Inicializa el modelo ML de predicción de riesgo"""
        try:
            # Intentar cargar modelo entrenado
            cargador = CargarModeloRiesgo()
            self.modelo, self.scaler = cargador.cargar_modelo_entrenado()
            
            if self.modelo and self.scaler:
                self.modelo_cargado = True
                logger.info("ML risk prediction model loaded successfully")
            else:
                logger.warning("ML model not found, training new model")
                # Entrenar modelo si no existe
                self.modelo, self.scaler = cargador.entrenar_modelo()
                self.modelo_cargado = (self.modelo is not None)
            
            # Inicializar motor de análisis
            self.motor_analisis = MotorAnalisis()
            
        except Exception as e:
            logger.error(f"Error initializing ML model: {e}")
            self.modelo_cargado = False
    
    async def predecir_riesgo_completo(
        self,
        user_id: str,
        mensaje_actual: str,
        perfil: PerfilUsuario
    ) -> Optional[PrediccionRiesgo]:
        """
        Genera predicción completa de riesgo usando ML y análisis de patrones
        
        Args:
            user_id: ID del usuario
            mensaje_actual: Mensaje actual del usuario
            perfil: Perfil del usuario
            
        Returns:
            PrediccionRiesgo o None si no se puede predecir
        """
        try:
            if not self.modelo_cargado:
                return await self._prediccion_heuristica(mensaje_actual, perfil)
            
            logger.info(f"Generating ML risk prediction for user: {user_id}")
            
            # 1. Obtener historial del usuario
            historial = await obtener_historial_usuario(user_id, dias_atras=30)
            
            # 2. Extraer características para ML
            caracteristicas = await self._extraer_caracteristicas_ml(
                usuario_id=user_id,
                mensaje_actual=mensaje_actual,
                perfil=perfil,
                historial=historial
            )
            
            # 3. Realizar predicción ML
            probabilidad_riesgo = self._predecir_con_modelo(caracteristicas)
            
            # 4. Analizar patrones históricos
            analisis_patrones = await self._analizar_patrones_historicos(historial)
            
            # 5. Combinar predicción ML con análisis de patrones
            prediccion_final = self._combinar_predicciones(
                probabilidad_riesgo,
                analisis_patrones,
                mensaje_actual
            )
            
            logger.info(f"Risk prediction completed: {prediccion_final.nivel_riesgo} "
                       f"(probability: {prediccion_final.probabilidad_riesgo:.2f})")
            
            return prediccion_final
            
        except Exception as e:
            logger.error(f"Error in ML risk prediction: {e}")
            return await self._prediccion_heuristica(mensaje_actual, perfil)
    
    async def _extraer_caracteristicas_ml(
        self,
        usuario_id: str,
        mensaje_actual: str,
        perfil: PerfilUsuario,
        historial: List[Dict]
    ) -> np.ndarray:
        """Extrae características para el modelo ML"""
        
        try:
            # Usar función del telegram-bot si está disponible
            if ML_DISPONIBLE:
                caracteristicas = extraer_caracteristicas_riesgo(
                    mensaje=mensaje_actual,
                    historial_checkins=historial,
                    perfil_usuario=perfil
                )
                return np.array(caracteristicas).reshape(1, -1)
            
            # Fallback: características básicas manuales
            return self._extraer_caracteristicas_basicas(mensaje_actual, historial, perfil)
            
        except Exception as e:
            logger.error(f"Error extracting ML features: {e}")
            return self._extraer_caracteristicas_basicas(mensaje_actual, historial, perfil)
    
    def _extraer_caracteristicas_basicas(
        self,
        mensaje: str,
        historial: List[Dict],
        perfil: PerfilUsuario
    ) -> np.ndarray:
        """Extrae características básicas sin dependencias ML externas"""
        
        # Análisis básico del mensaje
        mensaje_lower = mensaje.lower()
        
        # Características del mensaje (0-1)
        palabras_riesgo = ["mal", "terrible", "no puedo", "ayuda", "solo", "triste", "morir"]
        palabras_positivas = ["bien", "mejor", "feliz", "gracias", "genial"]
        
        puntuacion_riesgo = sum(1 for palabra in palabras_riesgo if palabra in mensaje_lower)
        puntuacion_positiva = sum(1 for palabra in palabras_positivas if palabra in mensaje_lower)
        
        # Características del historial
        total_mensajes = len(historial)
        mensajes_recientes = len([m for m in historial if self._es_reciente(m.get("timestamp", ""))])
        
        # Características del perfil
        factor_etapa = {
            "joven": 0.8,
            "adulto_activo": 0.6,
            "mayor_70": 0.7,
            "migrante": 0.9,
            "discapacidad_visual": 0.8
        }.get(perfil.etapa, 0.6)
        
        # Vector de características básicas
        caracteristicas = [
            min(puntuacion_riesgo / 3.0, 1.0),  # Normalized risk score
            min(puntuacion_positiva / 2.0, 1.0),  # Normalized positive score
            min(total_mensajes / 100.0, 1.0),  # Normalized message count
            min(mensajes_recientes / 10.0, 1.0),  # Recent activity
            factor_etapa,  # Life stage factor
            len(mensaje) / 200.0,  # Message length factor
            1.0 if "?" in mensaje else 0.0,  # Has questions
            1.0 if "!" in mensaje else 0.0,  # Has exclamations
        ]
        
        return np.array(caracteristicas).reshape(1, -1)
    
    def _predecir_con_modelo(self, caracteristicas: np.ndarray) -> float:
        """Realiza predicción usando el modelo ML cargado"""
        
        try:
            # Normalizar características
            caracteristicas_normalizadas = self.scaler.transform(caracteristicas)
            
            # Realizar predicción
            probabilidad = self.modelo.predict_proba(caracteristicas_normalizadas)[0][1]
            
            return float(probabilidad)
            
        except Exception as e:
            logger.error(f"Error in ML prediction: {e}")
            # Fallback: cálculo básico heurístico
            return float(np.mean(caracteristicas[0][:3]))  # Promedio de características de riesgo
    
    async def _analizar_patrones_historicos(self, historial: List[Dict]) -> Dict:
        """Analiza patrones en el historial del usuario"""
        
        if not historial:
            return {"patron_tendencia": "neutral", "nivel_alerta": "normal"}
        
        try:
            if ML_DISPONIBLE and self.motor_analisis:
                # Usar motor de análisis del telegram-bot
                metricas = self.motor_analisis.calcular_metricas_emocionales(historial)
                alertas = self.motor_analisis.generar_alertas(metricas)
                
                return {
                    "patron_tendencia": metricas.tendencia,
                    "nivel_alerta": alertas[0].nivel.value if alertas else "normal",
                    "racha_negativa": metricas.racha_actual_negativa
                }
            
            # Análisis básico manual
            return self._analizar_patrones_basicos(historial)
            
        except Exception as e:
            logger.error(f"Error analyzing historical patterns: {e}")
            return {"patron_tendencia": "neutral", "nivel_alerta": "normal"}
    
    def _analizar_patrones_basicos(self, historial: List[Dict]) -> Dict:
        """Análisis básico de patrones sin dependencias externas"""
        
        # Contar tipos de mensajes en el historial
        mensajes_negativos = 0
        mensajes_positivos = 0
        
        for mensaje in historial[-10:]:  # Últimos 10 mensajes
            texto = mensaje.get("mensaje_usuario", "").lower()
            if any(palabra in texto for palabra in ["mal", "triste", "difícil", "cansado"]):
                mensajes_negativos += 1
            elif any(palabra in texto for palabra in ["bien", "mejor", "feliz", "genial"]):
                mensajes_positivos += 1
        
        # Determinar tendencia
        if mensajes_negativos > mensajes_positivos * 2:
            tendencia = "empeorando"
            nivel_alerta = "preocupante"
        elif mensajes_positivos > mensajes_negativos:
            tendencia = "mejorando"
            nivel_alerta = "normal"
        else:
            tendencia = "estable"
            nivel_alerta = "atencion"
        
        return {
            "patron_tendencia": tendencia,
            "nivel_alerta": nivel_alerta,
            "racha_negativa": mensajes_negativos
        }
    
    def _combinar_predicciones(
        self,
        probabilidad_ml: float,
        patrones_historicos: Dict,
        mensaje_actual: str
    ) -> PrediccionRiesgo:
        """Combina predicción ML con análisis de patrones"""
        
        # Ajustar probabilidad según patrones históricos
        factor_patron = {
            "empeorando": 1.3,
            "estable": 1.0,
            "mejorando": 0.7,
            "neutral": 1.0
        }.get(patrones_historicos.get("patron_tendencia", "neutral"), 1.0)
        
        factor_alerta = {
            "critico": 1.5,
            "preocupante": 1.2,
            "atencion": 1.0,
            "normal": 0.8
        }.get(patrones_historicos.get("nivel_alerta", "normal"), 1.0)
        
        # Probabilidad ajustada
        probabilidad_ajustada = min(probabilidad_ml * factor_patron * factor_alerta, 1.0)
        
        # Determinar nivel de riesgo
        if probabilidad_ajustada >= 0.8:
            nivel = "critico"
        elif probabilidad_ajustada >= 0.6:
            nivel = "alto"
        elif probabilidad_ajustada >= 0.4:
            nivel = "medio"
        else:
            nivel = "bajo"
        
        # Identificar factores de riesgo
        factores_riesgo = self._identificar_factores_riesgo(
            mensaje_actual, patrones_historicos, probabilidad_ajustada
        )
        
        # Calcular confianza del modelo
        confianza = 0.8 if self.modelo_cargado else 0.6
        
        return PrediccionRiesgo(
            probabilidad_riesgo=probabilidad_ajustada,
            nivel_riesgo=nivel,
            factores_riesgo=factores_riesgo,
            confianza_modelo=confianza
        )
    
    def _identificar_factores_riesgo(
        self,
        mensaje: str,
        patrones: Dict,
        probabilidad: float
    ) -> List[str]:
        """Identifica factores específicos que contribuyen al riesgo"""
        
        factores = []
        mensaje_lower = mensaje.lower()
        
        # Factores del mensaje actual
        if any(palabra in mensaje_lower for palabra in ["no puedo", "terrible", "desesperado"]):
            factores.append("lenguaje_crisis")
        
        if any(palabra in mensaje_lower for palabra in ["solo", "nadie", "aislado"]):
            factores.append("aislamiento_social")
        
        if any(palabra in mensaje_lower for palabra in ["cansado", "agotado", "sin_energia"]):
            factores.append("cansancio_extremo")
        
        # Factores de patrones históricos
        if patrones.get("patron_tendencia") == "empeorando":
            factores.append("tendencia_negativa")
        
        if patrones.get("racha_negativa", 0) > 3:
            factores.append("racha_estados_negativos")
        
        # Factores de probabilidad alta
        if probabilidad > 0.7:
            factores.append("multiples_indicadores")
        
        return factores if factores else ["evaluacion_general"]
    
    async def _prediccion_heuristica(
        self, 
        mensaje: str, 
        perfil: PerfilUsuario
    ) -> PrediccionRiesgo:
        """Predicción heurística básica cuando ML no está disponible"""
        
        mensaje_lower = mensaje.lower()
        puntuacion_riesgo = 0
        factores = []
        
        # Palabras de alto riesgo
        palabras_criticas = ["suicidio", "morir", "acabar", "no puedo más"]
        if any(palabra in mensaje_lower for palabra in palabras_criticas):
            puntuacion_riesgo += 0.8
            factores.append("lenguaje_crisis")
        
        # Palabras de riesgo medio
        palabras_riesgo = ["mal", "terrible", "desesperado", "solo", "triste"]
        puntuacion_riesgo += sum(0.2 for palabra in palabras_riesgo if palabra in mensaje_lower)
        if puntuacion_riesgo > 0.2:
            factores.append("emociones_negativas")
        
        # Ajustar por etapa de vida
        factores_etapa = {
            "mayor_70": 0.1,
            "migrante": 0.15,
            "discapacidad_visual": 0.1
        }
        puntuacion_riesgo += factores_etapa.get(perfil.etapa, 0)
        
        # Limitar a 1.0
        puntuacion_riesgo = min(puntuacion_riesgo, 1.0)
        
        # Determinar nivel
        if puntuacion_riesgo >= 0.7:
            nivel = "alto"
        elif puntuacion_riesgo >= 0.4:
            nivel = "medio"
        else:
            nivel = "bajo"
        
        return PrediccionRiesgo(
            probabilidad_riesgo=puntuacion_riesgo,
            nivel_riesgo=nivel,
            factores_riesgo=factores if factores else ["evaluacion_heuristica"],
            confianza_modelo=0.5  # Confianza baja para predicción heurística
        )
    
    def _es_reciente(self, timestamp_str: str, horas: int = 24) -> bool:
        """Determina si un timestamp es reciente"""
        try:
            if isinstance(timestamp_str, str):
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            else:
                return False
            
            limite = datetime.utcnow() - timedelta(hours=horas)
            return timestamp >= limite
            
        except Exception:
            return False


# Instancia global del predictor
predictor_riesgo = PredictorRiesgoML()


async def predecir_riesgo(
    user_id: str,
    mensaje: str,
    perfil: PerfilUsuario
) -> Optional[PrediccionRiesgo]:
    """
    Función pública para predecir riesgo
    
    Args:
        user_id: ID del usuario
        mensaje: Mensaje del usuario
        perfil: Perfil del usuario
        
    Returns:
        PrediccionRiesgo o None si no se puede predecir
    """
    return await predictor_riesgo.predecir_riesgo_completo(user_id, mensaje, perfil)