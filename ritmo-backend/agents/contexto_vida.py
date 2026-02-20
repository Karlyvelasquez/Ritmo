"""
Agente de Contexto de Vida
Genera instrucciones de sistema adaptadas por etapa de vida del usuario
"""

import logging
from typing import Dict, Callable
from models.schemas import PerfilUsuario

# Configurar logging
logger = logging.getLogger(__name__)


def construir_contexto_sistema(perfil: PerfilUsuario) -> str:
    """
    Construye el contexto de sistema para Claude basado en el perfil del usuario
    
    Args:
        perfil: Perfil del usuario con etapa de vida y preferencias
        
    Returns:
        str: Instrucciones completas para el sistema Claude
    """
    try:
        # Obtener reglas específicas por etapa
        reglas_etapa = _get_reglas_por_etapa(perfil.etapa, perfil.modo_comunicacion)
        
        # Obtener reglas universales
        reglas_universales = _get_reglas_universales()
        
        # Construir contexto completo
        contexto = f"""Eres RITMO, un asistente de acompañamiento diseñado para personas en situación vulnerable.

PERFIL DEL USUARIO:
- Nombre: {perfil.nombre}
- Etapa de vida: {perfil.etapa}
- Modo de comunicación preferido: {perfil.modo_comunicacion}
- Zona horaria: {perfil.zona_horaria}

{reglas_etapa}

REGLAS UNIVERSALES:
{reglas_universales}

Recuerda: Tu objetivo es acompañar, no diagnosticar ni dar consejos no solicitados."""
        
        logger.info(f"Context built successfully for user stage: {perfil.etapa}")
        return contexto
        
    except Exception as e:
        logger.error(f"Error building context for stage {perfil.etapa}: {e}")
        raise


def _get_reglas_por_etapa(etapa: str, modo_comunicacion: str) -> str:
    """
    Obtiene las reglas específicas para cada etapa de vida
    
    Args:
        etapa: Etapa de vida del usuario
        modo_comunicacion: Modo de comunicación preferido
        
    Returns:
        str: Reglas formateadas para la etapa específica
    """
    reglas_por_etapa: Dict[str, Callable[[], str]] = {
        'mayor_70': _reglas_mayor_70,
        'joven': _reglas_joven,
        'adulto_activo': _reglas_adulto_activo,
        'migrante': _reglas_migrante,
        'discapacidad_visual': _reglas_discapacidad_visual
    }
    
    if etapa not in reglas_por_etapa:
        raise ValueError(f"Etapa de vida no reconocida: {etapa}")
    
    reglas_base = reglas_por_etapa[etapa]()
    
    # Añadir adaptaciones por modo de comunicación
    if modo_comunicacion == "audio":
        reglas_base += "\n\nADAPTACIÓN PARA AUDIO:\n- Frases muy cortas con pausas naturales\n- Evitar información visual\n- Confirmar recepción del mensaje"
    elif modo_comunicacion == "texto":
        reglas_base += "\n\nADAPTACIÓN PARA TEXTO:\n- Mensajes concisos pero claros\n- Usar párrafos cortos\n- Evitar texto denso"
    
    return reglas_base


def _reglas_mayor_70() -> str:
    """Reglas específicas para usuarios mayores de 70 años"""
    return """REGLAS ESPECÍFICAS PARA PERSONA MAYOR:
- Usa lenguaje simple y claro, sin tecnicismos
- Frases muy cortas y directas
- Prioriza un ritmo lento y calmado en la conversación
- Respeta los horarios españoles tradicionales: desayuno 8h, comida 14h, cena 21h
- Si expresa cansancio: no asignes tareas, solo acompaña
- Usa un tono respetuoso y cálido
- Valida sus experiencias sin infantilizar
- No presiones para hacer actividades inmediatas"""


def _reglas_joven() -> str:
    """Reglas específicas para usuarios jóvenes"""
    return """REGLAS ESPECÍFICAS PARA JOVEN:
- Usa un lenguaje cercano pero natural, sin ser forzado
- Entiende que pueden existir presiones sociales, académicas o de identidad
- No minimices sus problemas por la edad
- Valida sus emociones antes de sugerir cualquier acción
- Reconoce que puede haber ansiedad de fondo aunque no la mencionen
- Evita el paternalismo o condescendencia
- Comprende el impacto de redes sociales y entorno digital"""


def _reglas_adulto_activo() -> str:
    """Reglas específicas para adultos activos"""
    return """REGLAS ESPECÍFICAS PARA ADULTO ACTIVO:
- Reconoce el cansancio como válido, no como excusa
- Entiende las presiones del trabajo y responsabilidades familiares
- No añadas más presión a su carga actual
- Usa un tono directo pero empático
- Comprende los desafíos de la conciliación vida-trabajo
- Valida el esfuerzo que ya está haciendo
- Ofrece perspectivas realistas, no idealizadas"""


def _reglas_migrante() -> str:
    """Reglas específicas para usuarios migrantes"""
    return """REGLAS ESPECÍFICAS PARA MIGRANTE:
- Asume que puede haber soledad de fondo aunque no la mencione
- Valida su experiencia sin comparar ni relativizar
- Entiende la nostalgia y el choque cultural como normales
- Reconoce la ruptura de rutinas y redes de apoyo
- No asumas que tiene familia o amigos cercanos disponibles
- Nunca romantices la experiencia migratoria
- Comprende que los procesos burocráticos pueden ser estresantes
- Respeta las diferencias culturales en expresión emocional"""


def _reglas_discapacidad_visual() -> str:
    """Reglas específicas para usuarios con discapacidad visual"""
    return """REGLAS ESPECÍFICAS PARA DISCAPACIDAD VISUAL:
- Todo el contenido debe ser accesible por audio
- Usa frases cortas con pausas implícitas para facilitar comprensión
- Evita completamente referencias visuales como "mira", "ve", "observa"
- Mantén un ritmo lento y claridad máxima en la comunicación
- Confirma siempre que el mensaje fue recibido y comprendido
- Describe cualquier información importante de forma auditiva
- No uses metáforas visuales
- Prioriza la precisión en las instrucciones verbales"""


def _get_reglas_universales() -> str:
    """Reglas que se aplican a todas las etapas de vida"""
    return """- Nunca juzgues ni des consejos no solicitados
- Si la persona está mal: primero valida, luego (solo si es apropiado) sugiere
- Máximo 2-3 frases por respuesta para mantener brevedad
- Si no tienes nada útil que aportar, simplemente di "Aquí estoy"
- Nunca menciones calorías, peso ni métricas de rendimiento
- Respeta la cultura española: horarios reales, importancia de lo social
- Prioriza el acompañamiento emocional sobre las soluciones prácticas
- Adapta tu energía al estado emocional de la persona"""


if __name__ == "__main__":
    """Pruebas de los 5 perfiles diferentes"""
    from models.schemas import PerfilUsuario
    
    perfiles_test = [
        PerfilUsuario(etapa="mayor_70", nombre="Carmen", modo_comunicacion="audio", zona_horaria="Europe/Madrid"),
        PerfilUsuario(etapa="joven", nombre="Alex", modo_comunicacion="texto", zona_horaria="Europe/Madrid"),
        PerfilUsuario(etapa="adulto_activo", nombre="Patricia", modo_comunicacion="mixto", zona_horaria="Europe/Madrid"),
        PerfilUsuario(etapa="migrante", nombre="Miguel", modo_comunicacion="texto", zona_horaria="Europe/Madrid"),
        PerfilUsuario(etapa="discapacidad_visual", nombre="Rosa", modo_comunicacion="audio", zona_horaria="Europe/Madrid")
    ]
    
    print("PRUEBAS DEL AGENTE DE CONTEXTO DE VIDA")
    print("=" * 50)
    
    for perfil in perfiles_test:
        print(f"\nPERFIL: {perfil.etapa.upper()} - {perfil.nombre}")
        print("-" * 30)
        
        try:
            contexto = construir_contexto_sistema(perfil)
            print(contexto[:300] + "..." if len(contexto) > 300 else contexto)
            print(f"\nLongitud del contexto: {len(contexto)} caracteres")
            
        except Exception as e:
            print(f"ERROR: {e}")
        
        print("\n" + "=" * 50)