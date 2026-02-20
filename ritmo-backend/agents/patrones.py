"""
Agente de Patrones y Señales Web
Infiere el estado del usuario basado en patrones de comportamiento web
"""

import logging
from typing import List, Tuple
from models.schemas import SenalesWeb, PerfilUsuario, EstadoInferido

# Configurar logging
logger = logging.getLogger(__name__)


def inferir_estado(señales: SenalesWeb, perfil: PerfilUsuario) -> EstadoInferido:
    """
    Infiere el estado emocional del usuario basado en patrones de comportamiento web
    
    Args:
        señales: Señales del comportamiento web del usuario
        perfil: Perfil del usuario para contexto adicional
        
    Returns:
        EstadoInferido: Estado inferido con nivel de confianza y señales detectadas
    """
    try:
        # Inicializar sistema de puntuación
        puntos = 0
        señales_detectadas = []
        
        # Aplicar reglas de puntuación
        puntos, señales_detectadas = _aplicar_reglas_puntuacion(señales, puntos, señales_detectadas)
        
        # Determinar estado basado en puntuación
        estado = _determinar_estado(puntos, señales)
        
        # Determinar nivel de confianza
        confianza = _determinar_confianza(señales)
        
        # Determinar recomendación para orquestador
        recomendacion = _determinar_recomendacion(puntos, señales)
        
        logger.info(f"Pattern analysis completed: {estado} (confidence: {confianza}, points: {puntos})")
        
        return EstadoInferido(
            estado=estado,
            confianza=confianza,
            señales_detectadas=señales_detectadas
        )
        
    except Exception as e:
        logger.error(f"Error inferring user state: {e}")
        raise


def _aplicar_reglas_puntuacion(señales: SenalesWeb, puntos: int, señales_detectadas: List[str]) -> Tuple[int, List[str]]:
    """
    Aplica las reglas de puntuación basadas en las señales detectadas
    
    Args:
        señales: Señales del comportamiento web
        puntos: Puntuación inicial
        señales_detectadas: Lista de señales detectadas
        
    Returns:
        Tuple con puntuación actualizada y señales detectadas
    """
    # Acceso en madrugada (+2 puntos)
    if señales.es_madrugada:
        puntos += 2
        señales_detectadas.append("acceso_madrugada")
    
    # Checkin emocional difícil (+2 puntos)
    if señales.checkin_emocional == "dificil":
        puntos += 2
        señales_detectadas.append("checkin_emocional_dificil")
    
    # Días sin registrar actividad
    if señales.dias_sin_registrar >= 5:
        puntos += 2
        señales_detectadas.append("inactividad_prolongada")
    elif señales.dias_sin_registrar >= 3:
        puntos += 1
        señales_detectadas.append("inactividad_moderada")
    
    # Duración de sesión anterior muy corta (+1 punto)
    if señales.duracion_sesion_anterior_seg < 30:
        puntos += 1
        señales_detectadas.append("sesion_muy_corta")
    
    # Tiempo de respuesta alto (+1 punto)
    if señales.tiempo_respuesta_usuario_seg > 300:
        puntos += 1
        señales_detectadas.append("respuesta_lenta")
    
    # Frecuencia de accesos muy alta - posible ansiedad (+1 punto)
    if señales.frecuencia_accesos_hoy > 10:
        puntos += 1
        señales_detectadas.append("accesos_compulsivos")
    
    return puntos, señales_detectadas


def _determinar_estado(puntos: int, señales: SenalesWeb) -> str:
    """
    Determina el estado emocional basado en la puntuación obtenida
    
    Args:
        puntos: Puntuación total obtenida
        señales: Señales para contexto adicional
        
    Returns:
        str: Estado inferido del usuario
    """
    if puntos <= 1:
        return "estable"
    elif puntos <= 3:
        # Diferenciar entre cansancio y desconexión
        if señales.tiempo_respuesta_usuario_seg > 300 or señales.duracion_sesion_anterior_seg < 30:
            return "cansancio"
        else:
            return "desconexion"
    else:  # 4+ puntos
        # Diferenciar entre aislamiento y ansiedad
        if señales.frecuencia_accesos_hoy > 10:
            return "ansiedad"
        else:
            return "aislamiento"


def _determinar_confianza(señales: SenalesWeb) -> str:
    """
    Determina el nivel de confianza en la inferencia
    
    Args:
        señales: Señales del comportamiento web
        
    Returns:
        str: Nivel de confianza ("media" o "baja")
    """
    # Confianza media solo si hay checkin emocional explícito
    if señales.checkin_emocional is not None:
        return "media"
    
    # En todos los demás casos, confianza baja
    return "baja"


def _determinar_recomendacion(puntos: int, señales: SenalesWeb) -> str:
    """
    Determina la recomendación para el orquestador
    
    Args:
        puntos: Puntuación total obtenida
        señales: Señales para contexto adicional
        
    Returns:
        str: Recomendación para el orquestador
    """
    if puntos <= 1:
        # Estado estable - decidir entre esperar o rutina según la hora
        if _es_hora_de_rutina(señales.hora_acceso):
            return "rutina"
        else:
            return "esperar"
    else:
        # Estados preocupantes - contacto suave
        return "contacto_suave"


def _es_hora_de_rutina(hora_acceso: str) -> bool:
    """
    Determina si es una hora apropiada para sugerir rutinas
    
    Args:
        hora_acceso: Hora de acceso en formato HH:MM
        
    Returns:
        bool: True si es hora apropiada para rutinas
    """
    try:
        hora, minuto = map(int, hora_acceso.split(':'))
        hora_decimal = hora + minuto / 60
        
        # Horarios apropiados para rutinas (mañana y primera tarde)
        return (8 <= hora_decimal <= 12) or (14 <= hora_decimal <= 18)
        
    except ValueError:
        # Si no se puede parsear la hora, default a esperar
        return False


def _calcular_puntuacion_detalle(señales: SenalesWeb) -> dict:
    """
    Función helper para debugging que devuelve el desglose de puntuación
    
    Args:
        señales: Señales del comportamiento web
        
    Returns:
        dict: Desglose detallado de la puntuación
    """
    desglose = {
        "es_madrugada": 2 if señales.es_madrugada else 0,
        "checkin_emocional_dificil": 2 if señales.checkin_emocional == "dificil" else 0,
        "inactividad_prolongada": 2 if señales.dias_sin_registrar >= 5 else 0,
        "inactividad_moderada": 1 if 3 <= señales.dias_sin_registrar < 5 else 0,
        "sesion_muy_corta": 1 if señales.duracion_sesion_anterior_seg < 30 else 0,
        "respuesta_lenta": 1 if señales.tiempo_respuesta_usuario_seg > 300 else 0,
        "accesos_compulsivos": 1 if señales.frecuencia_accesos_hoy > 10 else 0
    }
    
    desglose["total"] = sum(desglose.values())
    return desglose


if __name__ == "__main__":
    """Pruebas del agente con señales extremas y normales"""
    from models.schemas import SenalesWeb, PerfilUsuario
    
    # Perfil de prueba
    perfil_test = PerfilUsuario(
        etapa="mayor_70", 
        nombre="Carmen", 
        modo_comunicacion="audio", 
        zona_horaria="Europe/Madrid"
    )
    
    print("PRUEBAS DEL AGENTE DE PATRONES Y SEÑALES")
    print("=" * 50)
    
    # Test 1: Señales extremas (máxima preocupación)
    print("\nTEST 1: SEÑALES EXTREMAS")
    print("-" * 30)
    
    señales_extremas = SenalesWeb(
        hora_acceso="03:22",
        dia_semana="miércoles",
        es_madrugada=True,
        frecuencia_accesos_hoy=15,
        duracion_sesion_anterior_seg=15,
        tiempo_respuesta_usuario_seg=450,
        dias_sin_registrar=6,
        checkin_emocional="dificil"
    )
    
    resultado_extremo = inferir_estado(señales_extremas, perfil_test)
    desglose_extremo = _calcular_puntuacion_detalle(señales_extremas)
    
    print(f"Estado: {resultado_extremo.estado}")
    print(f"Confianza: {resultado_extremo.confianza}")
    print(f"Señales detectadas: {resultado_extremo.señales_detectadas}")
    print(f"Puntuación total: {desglose_extremo['total']}")
    print(f"Desglose: {desglose_extremo}")
    
    # Test 2: Señales normales (estables)
    print("\nTEST 2: SEÑALES NORMALES")
    print("-" * 30)
    
    señales_normales = SenalesWeb(
        hora_acceso="10:15",
        dia_semana="lunes",
        es_madrugada=False,
        frecuencia_accesos_hoy=3,
        duracion_sesion_anterior_seg=180,
        tiempo_respuesta_usuario_seg=45,
        dias_sin_registrar=0,
        checkin_emocional="bien"
    )
    
    resultado_normal = inferir_estado(señales_normales, perfil_test)
    desglose_normal = _calcular_puntuacion_detalle(señales_normales)
    
    print(f"Estado: {resultado_normal.estado}")
    print(f"Confianza: {resultado_normal.confianza}")
    print(f"Señales detectadas: {resultado_normal.señales_detectadas}")
    print(f"Puntuación total: {desglose_normal['total']}")
    print(f"Desglose: {desglose_normal}")
    
    # Test 3: Señales moderadas (cansancio)
    print("\nTEST 3: SEÑALES MODERADAS")
    print("-" * 30)
    
    señales_moderadas = SenalesWeb(
        hora_acceso="14:30",
        dia_semana="martes",
        es_madrugada=False,
        frecuencia_accesos_hoy=2,
        duracion_sesion_anterior_seg=25,
        tiempo_respuesta_usuario_seg=350,
        dias_sin_registrar=3,
        checkin_emocional=None
    )
    
    resultado_moderado = inferir_estado(señales_moderadas, perfil_test)
    desglose_moderado = _calcular_puntuacion_detalle(señales_moderadas)
    
    print(f"Estado: {resultado_moderado.estado}")
    print(f"Confianza: {resultado_moderado.confianza}")
    print(f"Señales detectadas: {resultado_moderado.señales_detectadas}")
    print(f"Puntuación total: {desglose_moderado['total']}")
    print(f"Desglose: {desglose_moderado}")
    
    print("\n" + "=" * 50)
    print("TODOS LOS TESTS COMPLETADOS")