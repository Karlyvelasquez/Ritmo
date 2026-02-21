"""
Motor de Análisis Contextual para RITMO
Analiza patrones de check-ins y detecta tendencias emocionales

Funcionalidades:
- Cumplimiento semanal (7 días completos)
- Detección de tendencias negativas (días "difícil" consecutivos)  
- Métricas agregadas (distribución emocional semanal/mensual)
- Alertas automáticas (patrones preocupantes)
- Recomendaciones personalizadas
"""

import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from database import DatabaseManager
import csv
import os
import joblib
import numpy as np

logger = logging.getLogger(__name__)


class NivelAlerta(Enum):
    """Niveles de alerta para patrones detectados"""
    NORMAL = "normal"
    ATENCION = "atencion" 
    PREOCUPANTE = "preocupante"
    CRITICO = "critico"


@dataclass
class MetricasEmocionales:
    """Métricas emocionales de un período"""
    total_checkins: int
    dias_bien: int
    dias_normal: int
    dias_dificil: int
    racha_actual_negativa: int  # Días consecutivos "difícil"
    cumplimiento_porcentaje: float
    tendencia: str  # "mejorando", "estable", "empeorando"


@dataclass
class AlertaAnalisis:
    """Alerta generada por el análisis"""
    nivel: NivelAlerta
    tipo: str  # "cumplimiento_bajo", "tendencia_negativa", "racha_dificil"
    mensaje: str
    recomendacion: str
    dias_consecutivos: Optional[int] = None
    porcentaje_cumplimiento: Optional[float] = None


class MotorAnalisisContextual:
    """Motor principal de análisis de patrones emocionales"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        
        # Configuración de umbrales
        self.UMBRAL_CUMPLIMIENTO_CRITICO = 30.0  # % mínimo aceptable
        self.UMBRAL_CUMPLIMIENTO_BAJO = 50.0     # % que genera alerta
        self.UMBRAL_RACHA_ATENCION = 2           # días consecutivos "difícil"
        self.UMBRAL_RACHA_CRITICA = 4            # días consecutivos críticos
        
    # ------------------------------------------------------------------ #
    #  Análisis principal                                                  #
    # ------------------------------------------------------------------ #
    
    async def analizar_usuario_completo(
        self, 
        user_id: str, 
        periodo_dias: int = 7
    ) -> Dict[str, any]:
        """
        Análisis completo de un usuario en el período especificado.
        
        Args:
            user_id: ID del usuario a analizar
            periodo_dias: Días hacia atrás a analizar (defecto: 7)
            
        Returns:
            Dict con métricas, alertas y recomendaciones
        """
        try:
            logger.info(f"Iniciando análisis completo para usuario {user_id} ({periodo_dias} días)")
            
            # 1. Obtener datos de check-ins
            checkins = await self.db.obtener_checkins_periodo(user_id, periodo_dias)
            
            # 2. Calcular métricas emocionales
            metricas = self._calcular_metricas_emocionales(checkins, periodo_dias)
            
            # 3. Detectar alertas y patrones preocupantes
            alertas = self._detectar_alertas(metricas, checkins)
            
            # 4. Generar recomendaciones
            recomendaciones = self._generar_recomendaciones(metricas, alertas)
            
            # 5. Calcular puntuación de riesgo (heurístico)
            puntuacion_riesgo = self._calcular_puntuacion_riesgo(metricas, alertas)
            
            # 6. Predicción ML de riesgo (si modelo disponible)
            ml_pred = self.predecir_riesgo_usuario(metricas, alertas)
            
            resultado = {
                "user_id": user_id,
                "fecha_analisis": datetime.utcnow().isoformat(),
                "periodo_dias": periodo_dias,
                "metricas": metricas,
                "alertas": alertas,
                "recomendaciones": recomendaciones,
                "puntuacion_riesgo": puntuacion_riesgo,
                "ml_prediccion": ml_pred,
                "resumen": self._generar_resumen_textual(metricas, alertas)
            }
            
            logger.info(f"Análisis completado para usuario {user_id}: {len(alertas)} alertas detectadas")
            return resultado
            
        except Exception as e:
            logger.error(f"Error en análisis completo para usuario {user_id}: {e}")
            return {"error": str(e), "user_id": user_id}
    
    def _calcular_metricas_emocionales(
        self, 
        checkins: List[Dict], 
        periodo_dias: int
    ) -> MetricasEmocionales:
        """Calcula métricas emocionales del período"""
        
        # Inicializar contadores
        total_checkins = len(checkins)
        dias_bien = 0
        dias_normal = 0 
        dias_dificil = 0
        
        # Contar por estado emocional
        estados_consecutivos = []
        for checkin in reversed(checkins):  # Más antiguo a más reciente
            estado = checkin.get('estado_emocional', 'normal')
            estados_consecutivos.append(estado)
            
            if estado == 'bien':
                dias_bien += 1
            elif estado == 'normal':
                dias_normal += 1
            elif estado in ['dificil', 'mal', 'muy_mal']:
                dias_dificil += 1
        
        # Calcular racha actual negativa (días consecutivos difíciles al final)
        racha_actual = 0
        for estado in reversed(estados_consecutivos):
            if estado in ['dificil', 'mal', 'muy_mal']:
                racha_actual += 1
            else:
                break
        
        # Calcular cumplimiento
        cumplimiento_porcentaje = (total_checkins / periodo_dias) * 100 if periodo_dias > 0 else 0
        
        # Detectar tendencia (comparar primera vs segunda mitad)
        tendencia = self._detectar_tendencia_emocional(estados_consecutivos)
        
        return MetricasEmocionales(
            total_checkins=total_checkins,
            dias_bien=dias_bien,
            dias_normal=dias_normal,
            dias_dificil=dias_dificil,
            racha_actual_negativa=racha_actual,
            cumplimiento_porcentaje=cumplimiento_porcentaje,
            tendencia=tendencia
        )
    
    def _detectar_tendencia_emocional(self, estados: List[str]) -> str:
        """Detecta si la tendencia emocional está mejorando, estable o empeorando"""
        
        if len(estados) < 4:
            return "insuficiente_data"
        
        # Dividir en dos mitades
        mitad = len(estados) // 2
        primera_mitad = estados[:mitad]
        segunda_mitad = estados[mitad:]
        
        # Convertir estados a puntuaciones (-1: difícil, 0: normal, 1: bien)
        def estado_a_puntuacion(estado):
            if estado == 'bien':
                return 1
            elif estado in ['dificil', 'mal', 'muy_mal']:
                return -1
            else:
                return 0
        
        puntuacion_primera = sum(estado_a_puntuacion(e) for e in primera_mitad) / len(primera_mitad)
        puntuacion_segunda = sum(estado_a_puntuacion(e) for e in segunda_mitad) / len(segunda_mitad)
        
        diferencia = puntuacion_segunda - puntuacion_primera
        
        if diferencia > 0.3:
            return "mejorando"
        elif diferencia < -0.3:
            return "empeorando"
        else:
            return "estable"
    
    def _detectar_alertas(
        self, 
        metricas: MetricasEmocionales, 
        checkins: List[Dict]
    ) -> List[AlertaAnalisis]:
        """Detecta alertas basadas en métricas y patrones"""
        
        alertas = []
        
        # 1. Alerta por cumplimiento bajo
        if metricas.cumplimiento_porcentaje < self.UMBRAL_CUMPLIMIENTO_CRITICO:
            alertas.append(AlertaAnalisis(
                nivel=NivelAlerta.CRITICO,
                tipo="cumplimiento_critico",
                mensaje=f"Cumplimiento muy bajo: {metricas.cumplimiento_porcentaje:.1f}%",
                recomendacion="Contacto inmediato recomendado. Revisar barreras para check-ins.",
                porcentaje_cumplimiento=metricas.cumplimiento_porcentaje
            ))
        elif metricas.cumplimiento_porcentaje < self.UMBRAL_CUMPLIMIENTO_BAJO:
            alertas.append(AlertaAnalisis(
                nivel=NivelAlerta.ATENCION,
                tipo="cumplimiento_bajo", 
                mensaje=f"Cumplimiento bajo: {metricas.cumplimiento_porcentaje:.1f}%",
                recomendacion="Ofrecer recordatorios gentiles o revisar horarios de check-in.",
                porcentaje_cumplimiento=metricas.cumplimiento_porcentaje
            ))
        
        # 2. Alerta por racha negativa
        if metricas.racha_actual_negativa >= self.UMBRAL_RACHA_CRITICA:
            alertas.append(AlertaAnalisis(
                nivel=NivelAlerta.CRITICO,
                tipo="racha_critica",
                mensaje=f"Racha crítica: {metricas.racha_actual_negativa} días consecutivos difíciles",
                recomendacion="Intervención profesional recomendada. Contactar red de apoyo.",
                dias_consecutivos=metricas.racha_actual_negativa
            ))
        elif metricas.racha_actual_negativa >= self.UMBRAL_RACHA_ATENCION:
            alertas.append(AlertaAnalisis(
                nivel=NivelAlerta.ATENCION,
                tipo="racha_negativa",
                mensaje=f"Racha preocupante: {metricas.racha_actual_negativa} días consecutivos difíciles",
                recomendacion="Ofrecer recursos de apoyo y acompañamiento adicional.",
                dias_consecutivos=metricas.racha_actual_negativa
            ))
        
        # 3. Alerta por tendencia empeorando
        if metricas.tendencia == "empeorando":
            nivel = NivelAlerta.PREOCUPANTE if metricas.dias_dificil > 2 else NivelAlerta.ATENCION
            alertas.append(AlertaAnalisis(
                nivel=nivel,
                tipo="tendencia_negativa",
                mensaje="Tendencia emocional empeorando en los últimos días",
                recomendacion="Explorar factores recientes. Ofrecer estrategias de afrontamiento."
            ))
        
        # 4. Alerta por alta proporción de días difíciles
        if metricas.total_checkins > 0:
            proporcion_dificil = metricas.dias_dificil / metricas.total_checkins
            if proporcion_dificil > 0.6:  # Más del 60% días difíciles
                alertas.append(AlertaAnalisis(
                    nivel=NivelAlerta.PREOCUPANTE,
                    tipo="alta_proporcion_dificil",
                    mensaje=f"{proporcion_dificil:.0%} de días reportados como difíciles",
                    recomendacion="Revisar estrategias de bienestar y recursos disponibles."
                ))
        
        return alertas
    
    def _generar_recomendaciones(
        self, 
        metricas: MetricasEmocionales, 
        alertas: List[AlertaAnalisis]
    ) -> List[str]:
        """Genera recomendaciones personalizadas basadas en el análisis"""
        
        recomendaciones = []
        
        # Recomendaciones por alertas existentes
        for alerta in alertas:
            if alerta.recomendacion and alerta.recomendacion not in recomendaciones:
                recomendaciones.append(alerta.recomendacion)
        
        # Recomendaciones adicionales por patrones
        if metricas.cumplimiento_porcentaje > 80:
            recomendaciones.append("¡Excelente constancia! Mantén el hábito de check-ins diarios.")
        
        if metricas.tendencia == "mejorando":
            recomendaciones.append("Tendencia positiva detectada. Continúa con las estrategias actuales.")
        
        if metricas.dias_bien > metricas.dias_dificil and metricas.total_checkins > 3:
            recomendaciones.append("Predominan los días positivos. Identifica qué factores contribuyen.")
        
        # Recomendación por defecto si no hay específicas
        if not recomendaciones:
            recomendaciones.append("Continúa con check-ins regulares para monitorear tu bienestar.")
        
        return recomendaciones
    
    def _calcular_puntuacion_riesgo(
        self, 
        metricas: MetricasEmocionales, 
        alertas: List[AlertaAnalisis]
    ) -> Dict[str, any]:
        """Calcula puntuación de riesgo de 0-100"""
        
        puntuacion = 0
        factores = {}
        
        # Factor 1: Cumplimiento (0-25 puntos)
        if metricas.cumplimiento_porcentaje < 30:
            puntuacion += 25
            factores["cumplimiento"] = 25
        elif metricas.cumplimiento_porcentaje < 50:
            puntuacion += 15
            factores["cumplimiento"] = 15
        elif metricas.cumplimiento_porcentaje < 70:
            puntuacion += 5
            factores["cumplimiento"] = 5
        
        # Factor 2: Racha negativa (0-30 puntos)
        if metricas.racha_actual_negativa >= 4:
            puntuacion += 30
            factores["racha_negativa"] = 30
        elif metricas.racha_actual_negativa >= 2:
            puntuacion += 15
            factores["racha_negativa"] = 15
        
        # Factor 3: Proporción días difíciles (0-25 puntos)
        if metricas.total_checkins > 0:
            proporcion_dificil = metricas.dias_dificil / metricas.total_checkins
            if proporcion_dificil > 0.7:
                puntuacion += 25
                factores["proporcion_dificil"] = 25
            elif proporcion_dificil > 0.5:
                puntuacion += 15
                factores["proporcion_dificil"] = 15
        
        # Factor 4: Tendencia (0-20 puntos)
        if metricas.tendencia == "empeorando":
            puntuacion += 20
            factores["tendencia"] = 20
        
        # Determinar categoría de riesgo
        if puntuacion >= 70:
            categoria = "ALTO"
        elif puntuacion >= 40:
            categoria = "MEDIO"
        elif puntuacion >= 15:
            categoria = "BAJO"
        else:
            categoria = "MINIMO"
        
        return {
            "puntuacion": min(puntuacion, 100),  # Cap at 100
            "categoria": categoria,
            "factores": factores
        }
    
    def _generar_resumen_textual(
        self, 
        metricas: MetricasEmocionales, 
        alertas: List[AlertaAnalisis]
    ) -> str:
        """Genera resumen textual del análisis"""
        
        # Cumplimiento
        if metricas.cumplimiento_porcentaje >= 80:
            cumplimiento_desc = "excelente"
        elif metricas.cumplimiento_porcentaje >= 60:
            cumplimiento_desc = "bueno"
        elif metricas.cumplimiento_porcentaje >= 40:
            cumplimiento_desc = "regular"
        else:
            cumplimiento_desc = "bajo"
        
        # Estado emocional predominante
        if metricas.dias_bien >= metricas.dias_normal and metricas.dias_bien >= metricas.dias_dificil:
            estado_predominante = "positivo"
        elif metricas.dias_dificil > metricas.dias_bien:
            estado_predominante = "difícil"
        else:
            estado_predominante = "estable"
        
        # Número de alertas críticas
        alertas_criticas = len([a for a in alertas if a.nivel == NivelAlerta.CRITICO])
        
        resumen = (
            f"Cumplimiento {cumplimiento_desc} ({metricas.cumplimiento_porcentaje:.0f}%), "
            f"estado predominante {estado_predominante}, "
            f"tendencia {metricas.tendencia}"
        )
        
        if alertas_criticas > 0:
            resumen += f" - ⚠️ {alertas_criticas} alerta(s) crítica(s)"
        
        return resumen
    

    # ------------------------------------------------------------------ #
    #  Análisis de múltiples usuarios                                     #
    # ------------------------------------------------------------------ #
    async def generar_reporte_masivo(self, periodo_dias: int = 7) -> Dict[str, any]:
        """Genera reporte de análisis para todos los usuarios activos"""
        try:
            logger.info(f"Iniciando reporte masivo de análisis ({periodo_dias} días)")
            result = self.db.client.table("usuarios").select("id, nombre, telegram_id").not_.is_("telegram_id", "null").execute()
            if not result.data:
                return {"error": "No hay usuarios activos para analizar"}
            usuarios = result.data
            reportes_individuales = []
            alertas_globales = {"criticas": 0, "atencion": 0, "preocupantes": 0}
            for usuario in usuarios:
                user_id = usuario["id"]
                nombre = usuario.get("nombre", "Usuario")
                try:
                    analisis = await self.analizar_usuario_completo(user_id, periodo_dias)
                    analisis["nombre"] = nombre
                    reportes_individuales.append(analisis)
                    for alerta in analisis.get("alertas", []):
                        if alerta.nivel == NivelAlerta.CRITICO:
                            alertas_globales["criticas"] += 1
                        elif alerta.nivel == NivelAlerta.PREOCUPANTE:
                            alertas_globales["preocupantes"] += 1
                        elif alerta.nivel == NivelAlerta.ATENCION:
                            alertas_globales["atencion"] += 1
                except Exception as e:
                    logger.error(f"Error analizando usuario {user_id}: {e}")
            usuarios_con_alertas_criticas = len([r for r in reportes_individuales if any(a.nivel == NivelAlerta.CRITICO for a in r.get("alertas", []))])
            cumplimiento_promedio = sum(r.get("metricas", {}).get("cumplimiento_porcentaje", 0) for r in reportes_individuales) / len(reportes_individuales) if reportes_individuales else 0
            reporte_final = {
                "fecha_reporte": datetime.utcnow().isoformat(),
                "periodo_dias": periodo_dias,
                "total_usuarios_analizados": len(reportes_individuales),
                "alertas_globales": alertas_globales,
                "usuarios_con_alertas_criticas": usuarios_con_alertas_criticas,
                "cumplimiento_promedio": cumplimiento_promedio,
                "reportes_individuales": reportes_individuales
            }
            logger.info(f"Reporte masivo completado: {len(reportes_individuales)} usuarios analizados")
            return reporte_final
        except Exception as e:
            logger.error(f"Error en reporte masivo: {e}")
            return {"error": str(e)}

    # ------------------------------------------------------------------ #
    #  ML: Exportar features y predecir riesgo                           #
    # ------------------------------------------------------------------ #
    async def exportar_features_riesgo_csv(self, output_path: str = "features_riesgo.csv", periodo_dias: int = 14):
        """
        Exporta un CSV con features relevantes para entrenamiento ML de riesgo de abandono.
        Cada fila es un usuario, columnas = features extraídas.
        Args:
            output_path: Ruta del archivo CSV a guardar
            periodo_dias: Días a analizar por usuario (default: 14)
        """
        try:
            logger.info(f"Exportando features de riesgo a {output_path}...")
            result = self.db.client.table("usuarios").select("id, nombre, telegram_id").not_.is_("telegram_id", "null").execute()
            if not result.data:
                logger.warning("No hay usuarios activos para exportar features")
                return False
            usuarios = result.data
            columnas = [
                "user_id", "nombre", "total_checkins", "cumplimiento_porcentaje", "dias_bien", "dias_normal", "dias_dificil",
                "racha_actual_negativa", "tendencia", "alertas_criticas", "alertas_preocupantes", "alertas_atencion"
            ]
            with open(output_path, mode="w", newline='', encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=columnas)
                writer.writeheader()
                for usuario in usuarios:
                    user_id = usuario["id"]
                    nombre = usuario.get("nombre", "Usuario")
                    analisis = await self.analizar_usuario_completo(user_id, periodo_dias)
                    metricas = analisis.get("metricas")
                    alertas = analisis.get("alertas", [])
                    n_criticas = len([a for a in alertas if a.nivel.value == "critico"])
                    n_preocupantes = len([a for a in alertas if a.nivel.value == "preocupante"])
                    n_atencion = len([a for a in alertas if a.nivel.value == "atencion"])
                    row = {
                        "user_id": user_id,
                        "nombre": nombre,
                        "total_checkins": getattr(metricas, "total_checkins", 0),
                        "cumplimiento_porcentaje": getattr(metricas, "cumplimiento_porcentaje", 0),
                        "dias_bien": getattr(metricas, "dias_bien", 0),
                        "dias_normal": getattr(metricas, "dias_normal", 0),
                        "dias_dificil": getattr(metricas, "dias_dificil", 0),
                        "racha_actual_negativa": getattr(metricas, "racha_actual_negativa", 0),
                        "tendencia": getattr(metricas, "tendencia", ""),
                        "alertas_criticas": n_criticas,
                        "alertas_preocupantes": n_preocupantes,
                        "alertas_atencion": n_atencion
                    }
                    writer.writerow(row)
            logger.info(f"✅ Features exportadas a {os.path.abspath(output_path)}")
            return True
        except Exception as e:
            logger.error(f"Error exportando features de riesgo: {e}")
            return False

    def predecir_riesgo_usuario(self, metricas: MetricasEmocionales, alertas: List[AlertaAnalisis], modelo_path: str = "modelo_riesgo.pkl") -> dict:
        """
        Predice el riesgo de abandono usando el modelo entrenado y las métricas actuales del usuario.
        Args:
            metricas: MetricasEmocionales del usuario
            alertas: Lista de alertas generadas
            modelo_path: Ruta al modelo entrenado (pkl)
        Returns:
            dict con probabilidad de riesgo y categoría
        """
        try:
            modelo = joblib.load(modelo_path)
            n_criticas = len([a for a in alertas if a.nivel.value == "critico"])
            n_preocupantes = len([a for a in alertas if a.nivel.value == "preocupante"])
            n_atencion = len([a for a in alertas if a.nivel.value == "atencion"])
            features = np.array([
                metricas.cumplimiento_porcentaje,
                metricas.dias_bien,
                metricas.dias_normal,
                metricas.dias_dificil,
                metricas.racha_actual_negativa,
                n_criticas,
                n_preocupantes,
                n_atencion
            ]).reshape(1, -1)
            prob = modelo.predict_proba(features)[0, 1]
            categoria = (
                "ALTO" if prob >= 0.7 else
                "MEDIO" if prob >= 0.4 else
                "BAJO" if prob >= 0.15 else
                "MINIMO"
            )
            return {"probabilidad": float(prob), "categoria": categoria}
        except Exception as e:
            logger.error(f"Error prediciendo riesgo ML: {e}")
            return {"probabilidad": None, "categoria": "N/A", "error": str(e)}


# ------------------------------------------------------------------ #
#  Funciones de utilidad                                               #
# ------------------------------------------------------------------ #

def formatear_metricas_para_usuario(metricas: MetricasEmocionales) -> str:
    """Formatea métricas para mostrar al usuario de forma amigable"""
    
    # Emojis por estado
    if metricas.cumplimiento_porcentaje >= 80:
        emoji_cumplimiento = "🎯"
    elif metricas.cumplimiento_porcentaje >= 60:
        emoji_cumplimiento = "✅"
    else:
        emoji_cumplimiento = "⚠️"
    
    if metricas.tendencia == "mejorando":
        emoji_tendencia = "📈"
    elif metricas.tendencia == "empeorando":
        emoji_tendencia = "📉"
    else:
        emoji_tendencia = "➡️"
    
    mensaje = (
        f"{emoji_cumplimiento} **Cumplimiento**: {metricas.cumplimiento_porcentaje:.0f}%\n"
        f"😊 Días bien: {metricas.dias_bien}\n"
        f"😐 Días normales: {metricas.dias_normal}\n"
        f"😔 Días difíciles: {metricas.dias_dificil}\n"
        f"{emoji_tendencia} Tendencia: {metricas.tendencia}\n"
    )
    
    if metricas.racha_actual_negativa > 0:
        mensaje += f"Racha actual difícil: {metricas.racha_actual_negativa} días\n"
    
    return mensaje


def formatear_alertas_para_usuario(alertas: List[AlertaAnalisis]) -> str:
    """Formatea alertas para mostrar al usuario"""
    
    if not alertas:
        return "No se detectaron patrones preocupantes"
    
    mensaje = "**Observaciones importantes:**\n\n"
    
    for alerta in alertas:
        if alerta.nivel == NivelAlerta.CRITICO:
            emoji = "🚨"
        elif alerta.nivel == NivelAlerta.PREOCUPANTE:
            emoji = "⚠️"
        else:
            emoji = "💙"
        
        mensaje += f"{emoji} {alerta.mensaje}\n"
        mensaje += f"{alerta.recomendacion}\n\n"
    
    return mensaje


