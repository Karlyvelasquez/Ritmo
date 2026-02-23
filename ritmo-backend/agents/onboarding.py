from typing import Dict, List, Optional, Tuple
import random
import logging
from dataclasses import dataclass

from models.schemas import OnboardingEstado, PreguntaOnboarding

logger = logging.getLogger(__name__)

@dataclass
class ClasificacionResult:
    etapa_detectada: str
    confianza: float
    scores: Dict[str, float]
    puede_clasificar: bool
    razon: str

class OnboardingAgent:
    """Agente inteligente para manejo del onboarding conversacional"""
    
    def __init__(self, min_preguntas: int = 3, max_preguntas: int = 6, umbral_confianza: float = 0.35):
        self.min_preguntas = min_preguntas
        self.max_preguntas = max_preguntas
        self.umbral_confianza = umbral_confianza
        self.banco_preguntas = self._inicializar_banco_preguntas()
        logger.info(f"OnboardingAgent inicializado: {min_preguntas}-{max_preguntas} preguntas, umbral: {umbral_confianza}")
        
    def _inicializar_banco_preguntas(self) -> Dict[str, List[PreguntaOnboarding]]:
        """Inicializa el banco de preguntas organizadas por categoría"""
        
        preguntas = {
            "edad_contexto": [
                PreguntaOnboarding(
                    id="edad_01",
                    categoria="edad_contexto",
                    pregunta="¿En qué momento de tu vida te encuentras ahora? Cuéntame un poco sobre tu situación actual.",
                    palabras_clave={
                        "joven": ["estudios", "universidad", "carrera", "primer trabajo", "independizarme", "futuro", "empezando", "estudiante"],
                        "adulto_activo": ["trabajo", "familia", "hijos", "carrera profesional", "estable", "responsabilidades", "proyectos"],
                        "inmigrante": ["llegué", "país", "adaptándome", "nuevo", "diferente", "extraño", "emigré", "dejé"],
                        "persona_mayor": ["jubilado", "retirado", "pensión", "nietos", "experiencia", "años", "etapa", "tranquila"]
                    },
                    peso=1.5
                ),
                PreguntaOnboarding(
                    id="edad_02",
                    categoria="edad_contexto",
                    pregunta="¿Qué planes o metas tienes para los próximos años?",
                    palabras_clave={
                        "joven": ["terminar", "graduarme", "conseguir trabajo", "viajar", "experiencias", "aprender"],
                        "adulto_activo": ["ascenso", "casa", "estabilidad", "ahorrar", "hijos", "crecimiento profesional"],
                        "inmigrante": ["establecerme", "documentos", "trabajo estable", "traer familia", "legalizar"],
                        "persona_mayor": ["disfrutar", "salud", "familia", "tranquilo", "hobbies", "viajar cuando pueda"]
                    },
                    peso=1.3
                )
            ],
            "tecnologia": [
                PreguntaOnboarding(
                    id="tech_01",
                    categoria="tecnologia",
                    pregunta="¿Cómo te adaptas a las nuevas tecnologías? ¿Te resulta fácil o complicado?",
                    palabras_clave={
                        "joven": ["fácil", "natural", "intuitivo", "rápido", "me gusta", "siempre", "desde pequeño"],
                        "adulto_activo": ["depende", "trabajo", "necesario", "aprendo", "útil", "práctica"],
                        "inmigrante": ["diferente", "nuevo", "aprendiendo", "necesito ayuda", "distinto a mi país"],
                        "persona_mayor": ["complicado", "difícil", "lento", "ayuda", "confuso", "prefiero simple"]
                    },
                    peso=1.2
                ),
                PreguntaOnboarding(
                    id="tech_02",
                    categoria="tecnologia",
                    pregunta="¿Prefieres hacer las cosas de forma digital o tradicional? ¿Por qué?",
                    palabras_clave={
                        "joven": ["digital", "rápido", "eficiente", "moderno", "siempre digital"],
                        "adulto_activo": ["mixto", "depende", "lo que funcione", "práctico", "eficiente"],
                        "inmigrante": ["aprendiendo", "tradicionalmente", "en mi país", "diferente"],
                        "persona_mayor": ["tradicional", "papel", "presencial", "como siempre", "seguro"]
                    },
                    peso=1.0
                )
            ],
            "familia": [
                PreguntaOnboarding(
                    id="fam_01",
                    categoria="familia",
                    pregunta="¿Cómo es tu situación familiar actual? ¿Vives solo, con familia, pareja?",
                    palabras_clave={
                        "joven": ["padres", "solo", "compañeros", "independiente", "novi@", "empezando"],
                        "adulto_activo": ["pareja", "esposo", "esposa", "hijos", "familia propia", "casa propia"],
                        "inmigrante": ["solo", "lejos", "familia en", "dejé", "extraño", "aquí solo"],
                        "persona_mayor": ["nietos", "viudo", "viuda", "hijos grandes", "familia extendida"]
                    },
                    peso=1.4
                ),
                PreguntaOnboarding(
                    id="fam_02",
                    categoria="familia",
                    pregunta="¿Qué papel juegas en tu familia o círculo cercano?",
                    palabras_clave={
                        "joven": ["hijo", "hija", "hermano", "estudiante", "aprendiendo"],
                        "adulto_activo": ["padre", "madre", "sostén", "responsable", "proveedor"],
                        "inmigrante": ["envío dinero", "apoyo", "distancia", "extraño"],
                        "persona_mayor": ["abuelo", "abuela", "consejos", "experiencia", "sabiduría"]
                    },
                    peso=1.3
                )
            ],
            "trabajo": [
                PreguntaOnboarding(
                    id="work_01",
                    categoria="trabajo",
                    pregunta="¿A qué te dedicas actualmente? Cuéntame sobre tu trabajo o actividades diarias.",
                    palabras_clave={
                        "joven": ["estudiante", "prácticas", "tiempo parcial", "buscando", "primer trabajo"],
                        "adulto_activo": ["empresa", "profesional", "carrera", "especialista", "manager", "años de experiencia"],
                        "inmigrante": ["cualquier trabajo", "documentos", "lo que sea", "supervivencia", "temporal"],
                        "persona_mayor": ["jubilado", "pensión", "retirado", "ya no trabajo", "antes trabajaba"]
                    },
                    peso=1.6
                ),
                PreguntaOnboarding(
                    id="work_02",
                    categoria="trabajo",
                    pregunta="¿Cómo ves tu futuro profesional o laboral?",
                    palabras_clave={
                        "joven": ["crecer", "aprender", "oportunidades", "carrera", "desarrollarme"],
                        "adulto_activo": ["estabilidad", "ascenso", "consolidar", "experiencia"],
                        "inmigrante": ["establecerme", "mejorar", "legal", "estable", "oportunidad"],
                        "persona_mayor": ["disfrutar", "descansar", "tranquilo", "familia", "salud"]
                    },
                    peso=1.2
                )
            ],
            "tiempo_libre": [
                PreguntaOnboarding(
                    id="free_01",
                    categoria="tiempo_libre",
                    pregunta="¿Qué haces en tu tiempo libre? ¿Cuáles son tus actividades favoritas?",
                    palabras_clave={
                        "joven": ["amigos", "fiesta", "videojuegos", "redes sociales", "deportes", "salir"],
                        "adulto_activo": ["familia", "ejercicio", "lectura", "hobbies", "poco tiempo libre"],
                        "inmigrante": ["trabajar", "poco tiempo", "familia lejana", "adaptándome"],
                        "persona_mayor": ["televisión", "caminar", "jardín", "nietos", "tranquilo", "lectura"]
                    },
                    peso=1.1
                ),
                PreguntaOnboarding(
                    id="free_02",
                    categoria="tiempo_libre",
                    pregunta="¿Prefieres actividades tranquilas en casa o salir y socializar?",
                    palabras_clave={
                        "joven": ["salir", "amigos", "socializar", "conocer gente", "aventura"],
                        "adulto_activo": ["depende", "balance", "familia", "mixto"],
                        "inmigrante": ["casa", "solo", "conocer gente", "difícil socializar"],
                        "persona_mayor": ["tranquilo", "casa", "cómodo", "familia cercana"]
                    },
                    peso=1.0
                )
            ]
        }
        
        # Convertir a objetos PreguntaOnboarding
        banco = {}
        for categoria, lista_preguntas in preguntas.items():
            banco[categoria] = lista_preguntas
            
        logger.info(f"Banco de preguntas inicializado: {sum(len(v) for v in banco.values())} preguntas")
        return banco
    
    def iniciar_onboarding(self, telegram_id: str, nombre: str, sesion_id: str) -> OnboardingEstado:
        """Inicia una nueva sesión de onboarding"""
        estado = OnboardingEstado(
            sesion_id=sesion_id,
            telegram_id=telegram_id,
            nombre=nombre,
            pregunta_actual=0,
            preguntas_hechas=[],
            respuestas=[],
            scores={
                "joven": 0.0,
                "adulto_activo": 0.0,
                "inmigrante": 0.0,
                "persona_mayor": 0.0
            },
            completado=False
        )
        
        logger.info(f"Onboarding iniciado para {telegram_id} (sesión: {sesion_id})")
        return estado
    
    def obtener_siguiente_pregunta(self, estado: OnboardingEstado) -> Tuple[str, OnboardingEstado]:
        """Selecciona dinámicamente la siguiente pregunta más útil"""
        
        # Si ya hizo el máximo de preguntas, terminar
        if estado.pregunta_actual >= self.max_preguntas:
            return self._finalizar_onboarding(estado)
        
        # Si ya hizo el mínimo y tiene confianza suficiente, puede terminar
        if estado.pregunta_actual >= self.min_preguntas:
            resultado = self._clasificar_usuario(estado)
            if resultado.puede_clasificar:
                return self._finalizar_onboarding(estado)
        
        # Seleccionar siguiente pregunta
        pregunta_seleccionada = self._seleccionar_pregunta_inteligente(estado)
        
        if not pregunta_seleccionada:
            return self._finalizar_onboarding(estado)
        
        # Actualizar estado
        estado.pregunta_actual += 1
        estado.preguntas_hechas.append({
            "id": pregunta_seleccionada.id,
            "categoria": pregunta_seleccionada.categoria,
            "pregunta": pregunta_seleccionada.pregunta
        })
        
        mensaje = f"Pregunta {estado.pregunta_actual}:\n\n{pregunta_seleccionada.pregunta}"
        
        logger.info(f"Pregunta {estado.pregunta_actual} seleccionada: {pregunta_seleccionada.id}")
        return mensaje, estado
    
    def procesar_respuesta(self, respuesta: str, estado: OnboardingEstado) -> Tuple[str, OnboardingEstado]:
        """Procesa la respuesta del usuario y actualiza puntuaciones"""
        
        # Guardar respuesta
        estado.respuestas.append(respuesta)
        
        # Obtener la última pregunta hecha
        if not estado.preguntas_hechas:
            logger.error("No hay preguntas registradas para procesar")
            return "Error interno. Reiniciando onboarding.", estado
        
        ultima_pregunta = estado.preguntas_hechas[-1]
        pregunta_obj = self._obtener_pregunta_por_id(ultima_pregunta["id"])
        
        if pregunta_obj:
            # Analizar respuesta y actualizar scores
            scores_pregunta = self._analizar_respuesta(respuesta, pregunta_obj)
            
            # Actualizar scores generales
            for etapa, score in scores_pregunta.items():
                estado.scores[etapa] += score * pregunta_obj.peso
        
        # Continuar con siguiente pregunta
        return self.obtener_siguiente_pregunta(estado)
    
    def _seleccionar_pregunta_inteligente(self, estado: OnboardingEstado) -> Optional[PreguntaOnboarding]:
        """Selecciona la pregunta más útil según el contexto actual"""
        
        # Obtener categorías ya preguntadas
        categorias_usadas = {p["categoria"] for p in estado.preguntas_hechas}
        preguntas_usadas = {p["id"] for p in estado.preguntas_hechas}
        
        # Estrategia: máximo 2 preguntas por categoría
        contador_categorias = {}
        for pregunta in estado.preguntas_hechas:
            cat = pregunta["categoria"]
            contador_categorias[cat] = contador_categorias.get(cat, 0) + 1
        
        # Filtrar preguntas candidatas
        candidatas = []
        for categoria, preguntas in self.banco_preguntas.items():
            # Máximo 2 preguntas por categoría
            if contador_categorias.get(categoria, 0) >= 2:
                continue
                
            for pregunta in preguntas:
                if pregunta.id not in preguntas_usadas:
                    candidatas.append(pregunta)
        
        if not candidatas:
            return None
        
        # Si es la primera pregunta, elegir de edad_contexto
        if estado.pregunta_actual == 0:
            candidatas_edad = [p for p in candidatas if p.categoria == "edad_contexto"]
            if candidatas_edad:
                return random.choice(candidatas_edad)
        
        # Estrategia inteligente: priorizar categorías no exploradas
        categorias_sin_usar = set(self.banco_preguntas.keys()) - categorias_usadas
        if categorias_sin_usar:
            candidatas_nuevas = [p for p in candidatas if p.categoria in categorias_sin_usar]
            if candidatas_nuevas:
                return random.choice(candidatas_nuevas)
        
        # Si todas las categorías tienen al menos una pregunta, elegir aleatoriamente
        return random.choice(candidatas)
    
    def _analizar_respuesta(self, respuesta: str, pregunta: PreguntaOnboarding) -> Dict[str, float]:
        """Analiza una respuesta y devuelve scores por etapa"""
        
        respuesta_lower = respuesta.lower()
        scores = {"joven": 0.0, "adulto_activo": 0.0, "inmigrante": 0.0, "persona_mayor": 0.0}
        
        # Buscar palabras clave de cada etapa
        for etapa, palabras_clave in pregunta.palabras_clave.items():
            score = 0.0
            
            for palabra in palabras_clave:
                if palabra.lower() in respuesta_lower:
                    score += 1.0
            
            # Normalizar por número de palabras clave
            if len(palabras_clave) > 0:
                scores[etapa] = score / len(palabras_clave)
        
        logger.debug(f"Análisis respuesta: {scores}")
        return scores
    
    def _clasificar_usuario(self, estado: OnboardingEstado) -> ClasificacionResult:
        """Clasifica al usuario basado en las respuestas actuales"""
        
        # Calcular scores finales
        scores_finales = estado.scores.copy()
        
        # Encontrar la etapa con mayor score
        etapa_ganadora = max(scores_finales, key=scores_finales.get)
        score_max = scores_finales[etapa_ganadora]
        
        # Encontrar segundo lugar
        scores_ordenados = sorted(scores_finales.values(), reverse=True)
        score_segundo = scores_ordenados[1] if len(scores_ordenados) > 1 else 0
        
        # Calcular confianza (diferencia entre primero y segundo lugar)
        if score_max > 0:
            confianza = (score_max - score_segundo) / score_max
        else:
            confianza = 0.0
        
        # Determinar si puede clasificar
        puede_clasificar = (
            score_max > 0.3 and  # Score mínimo absoluto
            confianza >= self.umbral_confianza  # Confianza suficiente
        )
        
        razon = ""
        if puede_clasificar:
            razon = f"Confianza suficiente: {confianza:.2f} (umbral: {self.umbral_confianza})"
        else:
            razon = f"Confianza insuficiente: {confianza:.2f} (umbral: {self.umbral_confianza})"
        
        resultado = ClasificacionResult(
            etapa_detectada=etapa_ganadora,
            confianza=confianza,
            scores=scores_finales,
            puede_clasificar=puede_clasificar,
            razon=razon
        )
        
        logger.info(f"Clasificación: {etapa_ganadora} (confianza: {confianza:.2f})")
        return resultado
    
    def _finalizar_onboarding(self, estado: OnboardingEstado) -> Tuple[str, OnboardingEstado]:
        """Finaliza el onboarding y determina la etapa final"""
        
        resultado = self._clasificar_usuario(estado)
        
        # Actualizar estado
        estado.completado = True
        estado.etapa_detectada = resultado.etapa_detectada
        estado.confianza = resultado.confianza
        
        # Generar mensaje de finalización
        if resultado.puede_clasificar:
            mensaje = f"¡Perfecto! He podido conocerte mejor. Basándome en nuestras respuestas, veo que te encuentras en la etapa de {self._humanizar_etapa(resultado.etapa_detectada)}.\n\nAhora voy a generar tu código secreto único..."
        else:
            # En caso de empate o poca confianza, usar heurística
            estado.etapa_detectada = "adulto_activo"  # Valor por defecto
            mensaje = "¡Gracias por responder! He recopilado suficiente información para configurar tu perfil.\n\nAhora voy a generar tu código secreto único..."
        
        logger.info(f"Onboarding finalizado: {estado.etapa_detectada} (confianza: {estado.confianza:.2f})")
        return mensaje, estado
    
    def _humanizar_etapa(self, etapa: str) -> str:
        """Convierte el nombre técnico de etapa a algo más humano"""
        humanizado = {
            "joven": "una etapa joven y de crecimiento",
            "adulto_activo": "una etapa activa de la vida con responsabilidades",
            "inmigrante": "un proceso de adaptación a un nuevo lugar",
            "persona_mayor": "una etapa de experiencia y sabiduría"
        }
        return humanizado.get(etapa, "una etapa interesante de la vida")
    
    def _obtener_pregunta_por_id(self, pregunta_id: str) -> Optional[PreguntaOnboarding]:
        """Encuentra una pregunta por su ID"""
        for categoria, preguntas in self.banco_preguntas.items():
            for pregunta in preguntas:
                if pregunta.id == pregunta_id:
                    return pregunta
        return None


# Instancia global del agente
onboarding_agent = OnboardingAgent()