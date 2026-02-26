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
    
    def __init__(self, min_preguntas: int = 3, max_preguntas: int = 6, umbral_confianza: float = 0.25):
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
                        "joven": ["estudiante", "universidad", "carrera", "primer empleo", "vivo con mis padres", "soltero", "sin hijos", "estudiando", "20 años", "21 años", "22 años", "23 años", "24 años", "recién graduado", "busco trabajo"],
                        "adulto_activo": ["trabajo estable", "casa propia", "hipoteca", "carrera consolidada", "ascenso profesional", "experiencia laboral", "años trabajando", "equipo a cargo", "responsabilidades laborales"],
                        "inmigrante": ["mudé", "país", "extranjero", "adaptando", "nueva cultura", "diferente país", "migré", "emigré", "inmigré", "visa", "residencia", "papeles", "otro lugar", "vine de", "llegué de"],
                        "adulto_mayor": ["jubilado", "jubilación", "pensión", "nietos", "medicinas", "salud", "tercera edad", "60 años", "65 años", "70 años", "retirado", "abuelo", "abuela", "ya no trabajo", "tiempo libre"],
                        "discapacidad_visual": ["vista", "ojos", "leer", "dificultad visual", "gafas gruesas", "ceguera", "baja visión", "no veo bien"]
                    },
                    peso=1.5
                ),
                PreguntaOnboarding(
                    id="edad_02",
                    categoria="edad_contexto",
                    pregunta="¿Qué planes o metas tienes para los próximos años?",
                    palabras_clave={
                        "joven": ["terminar carrera", "conseguir trabajo", "independizarme", "viajar", "conocer gente", "empezar a trabajar", "graduarme", "primer empleo", "salir de casa"],
                        "adulto_activo": ["ascenso", "crecimiento profesional", "estabilidad económica", "plan de pensiones", "inversiones"],
                        "inmigrante": ["establecerme", "traer familia", "regularizar situación", "aprender idioma", "conseguir trabajo mejor", "papeles en regla", "residencia permanente"],
                        "adulto_mayor": ["disfrutar", "tranquilidad", "salud", "tiempo con familia", "hobbies", "viajar sin prisa", "cuidar salud", "nietos", "pasar tiempo"],
                        "discapacidad_visual": ["accesibilidad", "tecnología adaptada", "mantener independencia", "herramientas visuales"]
                    },
                    peso=1.0
                )
            ],
            "inmigracion": [
                PreguntaOnboarding(
                    id="migra_01",
                    categoria="inmigracion",
                    pregunta="¿Vives en tu país de origen o estás adaptándote a un nuevo lugar?",
                    palabras_clave={
                        "inmigrante": ["nuevo lugar", "adaptándome", "otro país", "extranjero", "fuera de casa", "emigré", "mudé", "visa", "residencia", "distinto país", "nueva cultura", "llegué aquí", "vine de", "mi país", "acento"],
                        "joven": ["país de origen", "mismo lugar", "aquí nací", "toda la vida aquí", "local"],
                        "adulto_activo": ["mismo país", "siempre aquí", "de aquí", "ciudadano"],
                        "adulto_mayor": ["toda la vida aquí", "mismo lugar siempre", "nacido aquí", "nunca me fui"],
                        "discapacidad_visual": ["conocido", "familiar el lugar", "me oriento bien"]
                    },
                    peso=2.0
                ),
                PreguntaOnboarding(
                    id="migra_02",
                    categoria="inmigracion",
                    pregunta="Si estás fuera de casa, ¿cuál ha sido el mayor reto al adaptarte a esta nueva cultura?",
                    palabras_clave={
                        "inmigrante": ["idioma", "costumbres", "documentos", "nostalgia", "familia lejos", "diferencias culturales", "adaptación", "burocracia", "trámites", "extraño mi país", "cultura diferente", "no entiendo", "acostumbrarme"],
                        "joven": ["no aplica", "no me fui", "siempre aquí"],
                        "adulto_activo": ["no he emigrado", "siempre local", "no aplica"],
                        "adulto_mayor": ["nunca me fui", "local", "no aplica"],
                        "discapacidad_visual": ["accesibilidad", "movilidad", "orientación"]
                    },
                    peso=1.8
                )
            ],
            "tecnologia": [
                PreguntaOnboarding(
                    id="tech_01",
                    categoria="tecnologia",
                    pregunta="¿Cómo te adaptas a las nuevas tecnologías? ¿Te resulta fácil o complicado?",
                    palabras_clave={
                        "joven": ["fácil", "rápido", "intuitivo", "sin problemas", "nativo digital", "me encanta", "siempre uso", "redes sociales", "apps"],
                        "adulto_activo": ["me esfuerzo", "gradualmente", "con práctica", "cuando necesito"],
                        "adulto_mayor": ["complicado", "difícil", "lento", "confuso", "prefiero lo tradicional", "me cuesta", "necesito ayuda", "no entiendo", "me pierdo"],
                        "inmigrante": ["diferente", "distinto a mi país", "adaptándome", "aquí es diferente"],
                        "discapacidad_visual": ["accesible", "lector de pantalla", "ayudas técnicas", "adaptaciones", "voz"]
                    },
                    peso=1.2
                ),
                PreguntaOnboarding(
                    id="tech_02",
                    categoria="tecnologia",
                    pregunta="¿Prefieres hacer las cosas de forma digital o tradicional? ¿Por qué?",
                    palabras_clave={
                        "joven": ["digital", "app", "móvil", "online", "internet", "rápido", "cómodo"],
                        "adulto_activo": ["combinación", "depende", "ambos", "híbrido"],
                        "adulto_mayor": ["tradicional", "papel", "presencial", "persona a persona", "como siempre"],
                        "inmigrante": ["como en mi país", "diferente aquí"],
                        "discapacidad_visual": ["accesible", "que funcione", "compatible"]
                    },
                    peso=1.0
                )
            ],
            "trabajo": [
                PreguntaOnboarding(
                    id="work_01",
                    categoria="trabajo",
                    pregunta="¿A qué te dedicas actualmente? Cuéntame si estudias, trabajas o ya estás disfrutando de tu jubilación.",
                    palabras_clave={
                        "joven": ["estudio", "estudiante", "universidad", "carrera", "primer empleo", "prácticas", "becario"],
                        "adulto_activo": ["trabajo", "empleado", "profesional", "empresa", "oficina", "jefe", "equipo", "proyecto"],
                        "adulto_mayor": ["jubilado", "jubilación", "pensión", "retirado", "ya no trabajo"],
                        "inmigrante": ["buscando trabajo", "trabajos temporales", "validar título", "empleo básico"],
                        "discapacidad_visual": ["trabajo adaptado", "tecnología asistiva"]
                    },
                    peso=1.6
                ),
                PreguntaOnboarding(
                    id="work_02",
                    categoria="trabajo",
                    pregunta="¿Sientes que tu rutina diaria es muy exigente o más bien tranquila?",
                    palabras_clave={
                        "joven": ["exigente", "estresante", "mucho que estudiar", "presión"],
                        "adulto_activo": ["muy exigente", "mucha presión", "responsabilidades", "ocupado", "horarios apretados"],
                        "adulto_mayor": ["tranquila", "relajada", "sin prisa", "a mi ritmo", "peaceful"],
                        "inmigrante": ["incierta", "adaptándome", "cambiante"],
                        "discapacidad_visual": ["adaptada", "organizada", "rutinaria"]
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
                        "joven": ["videojuegos", "redes sociales", "fiesta", "amigos", "deportes", "música", "netflix"],
                        "adulto_activo": ["familia", "ejercicio", "leer", "cocinar", "series", "hobbies", "tiempo con hijos"],
                        "adulto_mayor": ["jardín", "nietos", "pasear", "leer", "televisión", "radio", "visitas"],
                        "inmigrante": ["contactar familia", "videollamadas", "buscar comunidad"],
                        "discapacidad_visual": ["audiolibros", "radio", "música", "actividades auditivas"]
                    },
                    peso=1.1
                ),
                PreguntaOnboarding(
                    id="free_02",
                    categoria="tiempo_libre",
                    pregunta="¿Te gusta aprender cosas nuevas por internet o prefieres actividades más físicas/sociales?",
                    palabras_clave={
                        "joven": ["internet", "online", "cursos", "youtube", "tutorials"],
                        "adulto_activo": ["combinación", "ambos", "depende del tema"],
                        "adulto_mayor": ["físicas", "sociales", "presencial", "grupo", "persona a persona"],
                        "inmigrante": ["aprender idioma", "conocer gente"],
                        "discapacidad_visual": ["audio", "podcasts", "contenido accesible"]
                    },
                    peso=1.0
                )
            ],
            "discapacidad_visual": [
                PreguntaOnboarding(
                    id="visual_01",
                    categoria="discapacidad_visual",
                    pregunta="¿Tienes alguna dificultad para leer textos pequeños o prefieres que la interfaz sea muy clara y con voz?",
                    palabras_clave={
                        "discapacidad_visual": ["sí", "si", "dificultad", "problema", "textos pequeños", "interfaz clara", "voz", "lector", "pantalla", "ampliador", "gafas gruesas", "baja visión"],
                        "joven": ["no", "bien", "normal", "sin problemas"],
                        "adulto_activo": ["no", "normal", "bien"],
                        "adulto_mayor": ["algo", "gafas", "letra grande", "presbycia"],
                        "inmigrante": ["normal", "bien"]
                    },
                    peso=1.5
                ),
                PreguntaOnboarding(
                    id="visual_02",
                    categoria="discapacidad_visual",
                    pregunta="¿Usas habitualmente herramientas de accesibilidad en tu móvil u ordenador?",
                    palabras_clave={
                        "discapacidad_visual": ["sí", "si", "lector de pantalla", "ampliador", "contraste", "voz", "talkback", "voiceover", "jaws", "nvda"],
                        "joven": ["no", "no necesito"],
                        "adulto_activo": ["no", "no uso"],
                        "adulto_mayor": ["no", "no sé qué es"],
                        "inmigrante": ["no", "no conozco"]
                    },
                    peso=1.3
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
                "adulto_mayor": 0.0,
                "discapacidad_visual": 0.0
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
        """Analiza una respuesta usando coincidencias de palabras clave y devuelve scores por etapa"""
        
        # Etapas válidas para clasificación
        etapas_validas = ["joven", "adulto_activo", "inmigrante", "adulto_mayor", "discapacidad_visual"]
        
        # Inicializar scores en 0
        scores = {etapa: 0.0 for etapa in etapas_validas}
        
        # Convertir respuesta a minúsculas para comparación
        respuesta_lower = respuesta.lower()
        
        # Analizar coincidencias con palabras clave de la pregunta
        for etapa, palabras_clave in pregunta.palabras_clave.items():
            if etapa in etapas_validas:
                coincidencias = 0
                palabras_encontradas = []
                
                for palabra_clave in palabras_clave:
                    if palabra_clave.lower() in respuesta_lower:
                        coincidencias += 1
                        palabras_encontradas.append(palabra_clave)
                
                # Calcular score basado en coincidencias
                if len(palabras_clave) > 0:
                    score_base = coincidencias / len(palabras_clave)
                    
                    # Bonus por coincidencias múltiples (más específico)
                    if coincidencias > 1:
                        score_base += 0.3 * (coincidencias - 1)
                    
                    # Bonus extra para perfiles específicos (inmigrante, adulto_mayor, discapacidad_visual)
                    if etapa in ["inmigrante", "adulto_mayor", "discapacidad_visual"] and coincidencias > 0:
                        score_base += 0.2  # Boost para perfiles específicos
                    
                    scores[etapa] += score_base
                    
                    if palabras_encontradas:
                        logger.debug(f"Etapa {etapa}: {len(palabras_encontradas)} coincidencias: {palabras_encontradas}")
        
        # Normalizar scores para que estén entre 0 y 1
        max_score = max(scores.values()) if scores.values() else 0
        if max_score > 1.0:
            for etapa in scores:
                scores[etapa] = min(1.0, scores[etapa])
        
        # Logging para debug
        logger.debug(f"Análisis de respuesta '{respuesta[:50]}...': {scores}")
        
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
            confianza = (score_max - score_segundo) / score_max if score_max > 0 else 0
        else:
            confianza = 0.0
        
        # Determinar si puede clasificar - umbrales más estrictos para adulto_activo
        umbral_minimo = 0.3 if etapa_ganadora == "adulto_activo" else 0.2
        umbral_confianza = 0.4 if etapa_ganadora == "adulto_activo" else self.umbral_confianza
        
        puede_clasificar = (
            score_max >= umbral_minimo and
            confianza >= umbral_confianza
        )
        
        # Si no hay suficiente información específica, 'joven' es más neutral que 'adulto_activo'
        if not puede_clasificar and score_max < 0.1:
            etapa_ganadora = "joven"  # Más neutral que adulto_activo
            score_max = 0.1
            confianza = 0.1
        
        razon = f"Max: {etapa_ganadora}({score_max:.2f}), Confianza: {confianza:.2f}, Umbral: {umbral_minimo}"
        
        resultado = ClasificacionResult(
            etapa_detectada=etapa_ganadora,
            confianza=confianza,
            scores=scores_finales,
            puede_clasificar=puede_clasificar,
            razon=razon
        )
        
        logger.info(f"Clasificación actual: {etapa_ganadora} (conf: {confianza:.2f}, score: {score_max:.2f})")
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
            mensaje = f"¡Perfecto! He podido conocerte mejor. Basándome en lo que me has contado, te he asignado el perfil de {self._humanizar_etapa(resultado.etapa_detectada)}.\n\nEste perfil está diseñado especialmente para personas en tu situación actual."
        else:
            # Si no hay confianza suficiente, usar el perfil con mayor score pero avisar
            # Ya no usar automáticamente "adulto_activo"
            mensaje = f"Gracias por compartir conmigo. He configurado el perfil de {self._humanizar_etapa(resultado.etapa_detectada)} basándome en tus respuestas.\n\nSi sientes que no es el adecuado, podrás ajustarlo más adelante."
        
        logger.info(f"Onboarding finalizado como: {estado.etapa_detectada}")
        return mensaje, estado
    
    def _humanizar_etapa(self, etapa: str) -> str:
        """Convierte el nombre técnico de etapa a algo más humano"""
        humanizado = {
            "joven": "Joven",
            "adulto_activo": "Adulto Activo",
            "inmigrante": "Inmigrante",
            "adulto_mayor": "Adulto Mayor",
            "discapacidad_visual": "Baja Visión"
        }
        return humanizado.get(etapa, "Perfil General")
    
    def _obtener_pregunta_por_id(self, pregunta_id: str) -> Optional[PreguntaOnboarding]:
        """Encuentra una pregunta por su ID"""
        for categoria, preguntas in self.banco_preguntas.items():
            for pregunta in preguntas:
                if pregunta.id == pregunta_id:
                    return pregunta
        return None


# Instancia global del agente
onboarding_agent = OnboardingAgent()