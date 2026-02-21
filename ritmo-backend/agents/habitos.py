"""
Agente de Hábitos
Solo interviene cuando el usuario está en estado estable
Promueve rutinas saludables y el desarrollo de hábitos positivos
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, time
import random

from models.schemas import PerfilUsuario, ChatResponse

# Configurar logging
logger = logging.getLogger(__name__)


class AgenteHabitos:
    """Agente especializado en promover hábitos saludables"""
    
    def __init__(self):
        self.habitos_por_etapa = self._inicializar_habitos_por_etapa()
        self.momentos_rutina = self._inicializar_momentos_rutina()
    
    def _inicializar_habitos_por_etapa(self) -> Dict[str, Dict[str, List[str]]]:
        """Inicializa hábitos recomendados por etapa de vida"""
        return {
            "mayor_70": {
                "mañana": [
                    "Tomar un vaso de agua al despertar",
                    "Hacer 5 minutos de estiramientos suaves", 
                    "Leer las noticias con una taza de té",
                    "Caminar 10 minutos por casa o jardín"
                ],
                "tarde": [
                    "Llamar a un familiar o amigo",
                    "Hacer un puzzle o juego mental",
                    "Escuchar música relajante",
                    "Revisar fotos de recuerdos alegres"
                ],
                "noche": [
                    "Escribir 3 cosas buenas del día",
                    "Preparar la ropa para mañana",
                    "Hacer una infusión relajante",
                    "Leer unas páginas antes de dormir"
                ]
            },
            "adulto_activo": {
                "mañana": [
                    "Hacer 10 minutos de ejercicio o yoga",
                    "Planificar las 3 tareas más importantes del día",
                    "Desayunar sin prisa, disfrutando",
                    "Escribir o reflexionar 5 minutos"
                ],
                "tarde": [
                    "Tomar un descanso de 15 minutos sin pantallas",
                    "Salir a caminar o tomar aire fresco",
                    "Conectar con un ser querido",
                    "Hacer algo creativo durante 10 minutos"
                ],
                "noche": [
                    "Desconectar dispositivos 1 hora antes de dormir",
                    "Revisar y celebrar logros del día",
                    "Preparar todo para un mañana sin estrés",
                    "Hacer ejercicios de respiración"
                ]
            },
            "joven": {
                "mañana": [
                    "Hacer la cama al levantarse",
                    "Beber agua y hacer 5 minutos de movimiento",
                    "Escribir un objetivo claro para el día",
                    "Escuchar música motivadora"
                ],
                "tarde": [
                    "Tomar descansos activos cada 2 horas",
                    "Salir de casa aunque sea 20 minutos",
                    "Hacer algo que disfrutes sin sentir culpa",
                    "Conectar con amigos o familia"
                ],
                "noche": [
                    "Reflexionar sobre 1 cosa que aprendiste hoy",
                    "Organizar el espacio personal",
                    "Leer o estudiar algo que te interese",
                    "Establecer horario fijo para dormir"
                ]
            },
            "migrante": {
                "mañana": [
                    "Practicar 5 minutos del idioma local",
                    "Leer noticias del país de origem y actual",
                    "Hacer una lista de metas para el día",
                    "Contactar con la familia cuando sea posible"
                ],
                "tarde": [
                    "Explorar algo nuevo del país/ciudad",
                    "Conectar con otros migrantes o locales",
                    "Hacer un actividad que te recuerde casa",
                    "Buscar oportunidades de crecimiento"
                ],
                "noche": [
                    "Escribir sobre tu experiencia del día", 
                    "Planificar algo positivo para mañana",
                    "Mantener tradiciones importantes para ti",
                    "Celebrar pequeños progresos"
                ]
            },
            "discapacidad_visual": {
                "mañana": [
                    "Organizar el espacio según tus necesidades",
                    "Escuchar noticias o contenido de interés",
                    "Hacer ejercicios de movilidad o orientación",
                    "Planificar rutas y actividades del día"
                ],
                "tarde": [
                    "Practicar habilidades de vida independiente",
                    "Conectar con otros a través de audio/voz",
                    "Explorar contenido táctil o auditivo",
                    "Hacer actividades que disfrutes adaptadas"
                ],
                "noche": [
                    "Reflexionar usando audio o braille",
                    "Preparar herramientas para el día siguiente",
                    "Escuchar música, podcasts o audiolibros",
                    "Hacer ejercicios de relajación"
                ]
            }
        }
    
    def _inicializar_momentos_rutina(self) -> Dict[str, str]:
        """Define momentos óptimos para sugerir rutinas"""
        return {
            "mañana": "08:00-11:00",
            "tarde": "15:00-17:00", 
            "noche": "19:00-21:00"
        }


agente_habitos = AgenteHabitos()


async def generar_mensaje_habito(
    perfil: PerfilUsuario,
    dias_sin_actividad: int
) -> ChatResponse:
    """
    Genera mensaje de hábito personalizado para usuario en estado estable
    
    Args:
        perfil: Perfil del usuario
        dias_sin_actividad: Días sin actividad del usuario
        
    Returns:
        ChatResponse: Mensaje de hábito con tono alentador
    """
    try:
        logger.info(f"Generating habit message for {perfil.etapa} user")
        
        # 1. Determinar momento del día
        momento_dia = _determinar_momento_dia()
        
        # 2. Seleccionar hábito apropiado
        habito = _seleccionar_habito_personalizado(perfil, momento_dia, dias_sin_actividad)
        
        # 3. Generar mensaje motivacional
        mensaje = _construir_mensaje_habito(habito, perfil, momento_dia)
        
        # 4. Añadir elemento de seguimiento suave
        seguimiento = _generar_seguimiento_habito(habito, momento_dia)
        
        mensaje_completo = f"{mensaje} {seguimiento}"
        
        chat_response = ChatResponse(
            respuesta=mensaje_completo,
            tono="alentador",
            necesita_seguimiento=False  # Los hábitos no necesitan seguimiento urgente
        )
        
        logger.info("Habit message generated successfully")
        return chat_response
        
    except Exception as e:
        logger.error(f"Error generating habit message: {e}")
        return _generar_mensaje_habito_fallback(perfil)


def _determinar_momento_dia() -> str:
    """Determina el momento del día actual"""
    hora_actual = datetime.now().time()
    
    if time(6, 0) <= hora_actual <= time(11, 0):
        return "mañana"
    elif time(14, 0) <= hora_actual <= time(18, 0):
        return "tarde"
    elif time(19, 0) <= hora_actual <= time(22, 0):
        return "noche"
    else:
        return "tarde"  # Default para horas atípicas


def _seleccionar_habito_personalizado(
    perfil: PerfilUsuario, 
    momento_dia: str, 
    dias_sin_actividad: int
) -> str:
    """Selecciona hábito personalizado según perfil y momento"""
    
    habitos_etapa = agente_habitos.habitos_por_etapa.get(perfil.etapa, {})
    habitos_momento = habitos_etapa.get(momento_dia, [])
    
    if not habitos_momento:
        # Fallback a hábitos generales
        habitos_momento = [
            "Tomar un momento para respirar profundo",
            "Hacer algo que te haga sentir bien",
            "Conectar con alguien importante para ti"
        ]
    
    # Si hay muchos días sin actividad, priorizar hábitos más simples
    if dias_sin_actividad > 3:
        habitos_simples = [h for h in habitos_momento if any(palabra in h.lower() for palabra in ["respirar", "agua", "música", "caminar"])]
        if habitos_simples:
            habitos_momento = habitos_simples
    
    return random.choice(habitos_momento)


def _construir_mensaje_habito(
    habito: str, 
    perfil: PerfilUsuario, 
    momento_dia: str
) -> str:
    """Construye mensaje motivacional para el hábito"""
    
    # Saludos personalizados por momento
    saludos = {
        "mañana": [
            f"¡Buenos días, {perfil.nombre}!",
            f"Qué bueno verte por aquí, {perfil.nombre}",
            f"¡Hola, {perfil.nombre}! ¿Cómo amaneciste?"
        ],
        "tarde": [
            f"¡Hola, {perfil.nombre}!",
            f"Buenas tardes, {perfil.nombre}",
            f"¿Cómo va tu día, {perfil.nombre}?"
        ],
        "noche": [
            f"¡Hola, {perfil.nombre}!",
            f"Buenas noches, {perfil.nombre}",
            f"Espero que hayas tenido un buen día, {perfil.nombre}"
        ]
    }
    
    saludo = random.choice(saludos[momento_dia])
    
    # Conectores motivacionales
    conectores = [
        "Me preguntaba si te gustaría probar",
        "Tengo una idea que podría gustarte:",
        "¿Qué te parece si intentamos",
        "Se me ocurrió que podrías disfrutar",
        "¿Te animas a"
    ]
    
    conector = random.choice(conectores)
    
    # Motivación final
    motivaciones = [
        "Los pequeños cambios crean grandes resultados.",
        "Cada paso cuenta, por pequeño que sea.",
        "Es genial cuidarte de esta manera.",
        "Tu bienestar es importante.",
        "Te mereces estos momentos para ti."
    ]
    
    motivacion = random.choice(motivaciones)
    
    return f"{saludo} {conector} {habito.lower()}? {motivacion}"


def _generar_seguimiento_habito(habito: str, momento_dia: str) -> str:
    """Genera pregunta de seguimiento suave"""
    
    seguimientos = [
        "¿Te parece algo que podrías intentar?",
        "¿Crees que podría funcionar para ti?",
        "¿Qué opinas?",
        "¿Te suena bien?",
        "¿Te gustaría probarlo?"
    ]
    
    return random.choice(seguimientos)


def _generar_mensaje_habito_fallback(perfil: PerfilUsuario) -> ChatResponse:
    """Genera mensaje de fallback cuando hay errores"""
    
    mensajes_fallback = [
        f"Hola {perfil.nombre}, espero que estés teniendo un buen día. ¿Hay algo especial que te gustaría hacer hoy?",
        f"¡Qué bueno verte, {perfil.nombre}! A veces los pequeños momentos para nosotros mismos hacen la diferencia.",
        f"Hola {perfil.nombre}. ¿Cómo has estado? Me alegra saber de ti."
    ]
    
    return ChatResponse(
        respuesta=random.choice(mensajes_fallback),
        tono="alentador",
        necesita_seguimiento=False
    )


def obtener_habitos_por_etapa(etapa: str) -> Dict[str, List[str]]:
    """
    Obtiene todos los hábitos disponibles para una etapa de vida
    
    Args:
        etapa: Etapa de vida del usuario
        
    Returns:
        Dict con hábitos organizados por momento del día
    """
    return agente_habitos.habitos_por_etapa.get(etapa, {})


def es_buen_momento_para_habitos(hora_actual: str) -> bool:
    """
    Determina si es un buen momento para sugerir hábitos
    
    Args:
        hora_actual: Hora en formato HH:MM
        
    Returns:
        bool: True si es buen momento para hábitos
    """
    try:
        hora, minuto = map(int, hora_actual.split(':'))
        hora_decimal = hora + minuto / 60
        
        # Buenos momentos: mañana (8-11), tarde (15-17), noche temprana (19-21)
        return ((8 <= hora_decimal <= 11) or 
                (15 <= hora_decimal <= 17) or 
                (19 <= hora_decimal <= 21))
                
    except ValueError:
        return False