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
                        "joven": [
                            # Situaciones típicamente juveniles
                            "estudiante", "universidad", "carrera", "estudios", "graduarme", "terminar carrera",
                            "primer empleo", "busco trabajo", "vivo con mis padres", "salir de casa", "independizarme",
                            "soltero", "soltera", "sin hijos", "20 años", "21 años", "22 años", "23 años", "24 años",
                            "recién graduado", "empezando", "principiante"
                        ],
                        "adulto_activo": [
                            # Estabilidad y responsabilidades
                            "trabajo estable", "casa propia", "hipoteca", "carrera consolidada", "experiencia laboral",
                            "años trabajando", "equipo a cargo", "responsabilidades laborales", "familia establecida",
                            "hijos", "colegio de los niños", "matrimonio", "pareja estable", "30 años", "35 años", "40 años"
                        ],
                        "migrante": [
                            # Países específicos
                            "Colombia", "Venezuela", "Argentina", "México", "Perú", "Ecuador", "Bolivia", "Chile",
                            "Uruguay", "Paraguay", "Marruecos", "Rumania", "Ucrania", "China", "Pakistán",
                            # Expresiones migratorias
                            "mudé", "país", "extranjero", "adaptando", "nueva cultura", "diferente país", 
                            "migré", "emigré", "inmigré", "vine de", "llegué de", "soy de", "no soy español"
                        ],
                        "mayor_70": [
                            # Jubilación y retiro
                            "jubilado", "jubilada", "pensión", "retirado", "retirada", "ya no trabajo", "dejé de trabajar",
                            "pensionista", "cobro pensión", "tercera edad", "adulto mayor",
                            # Edades
                            "60 años", "65 años", "70 años", "75 años", "80 años", "85 años",
                            "tengo 60", "tengo 65", "tengo 70", "tengo 75", "tengo 80", "tengo 85",
                            "más de 60", "más de 65", "mayor de 60", "mayor de 65",
                            # Familia y roles
                            "nietos", "nietas", "abuelo", "abuela", "bisabuelo", "bisabuela", "ser abuelo", "ser abuela",
                            # Salud y cuidados
                            "medicinas", "pastillas", "médico", "revisiones médicas", "tratamiento", "salud delicada",
                            "centro de salud", "especialista", "citas médicas"
                        ],
                        "discapacidad_visual": [
                            # Condiciones directas
                            "no veo bien", "veo mal", "ciego", "ciega", "ceguera", "baja visión", "casi no veo",
                            "perdí la vista", "problemas de vista", "dificultad visual", "muy poca vista",
                            # Herramientas y ayudas
                            "lector de pantalla", "talkback", "voiceover", "jaws", "nvda", "braille",
                            "bastón blanco", "perro guía", "gafas muy gruesas", "lupa", "ampliador",
                            "síntesis de voz", "el teléfono me habla", "me leen las cosas", "ayuda para leer"
                        ]
                    },
                    peso=2.0
                ),
                PreguntaOnboarding(
                    id="edad_02",
                    categoria="edad_contexto",
                    pregunta="¿Qué planes o metas tienes para los próximos años?",
                    palabras_clave={
                        "joven": ["terminar carrera", "conseguir trabajo", "independizarme", "viajar", "conocer gente", "empezar a trabajar", "graduarme", "primer empleo", "salir de casa"],
                        "adulto_activo": ["ascenso", "crecimiento profesional", "estabilidad económica", "plan de pensiones", "inversiones"],
                        "migrante": ["establecerme", "traer familia", "regularizar situación", "aprender idioma", "conseguir trabajo mejor", "papeles en regla", "residencia permanente"],
                        "mayor_70": ["disfrutar", "tranquilidad", "salud", "tiempo con familia", "hobbies", "viajar sin prisa", "cuidar salud", "nietos", "pasar tiempo"],
                        "discapacidad_visual": ["accesibilidad", "tecnología adaptada", "mantener independencia", "herramientas visuales"]
                    },
                    peso=1.0
                ),
                PreguntaOnboarding(
                    id="situacion_02",
                    categoria="situacion_actual",
                    pregunta="¿Cuál dirías que es tu principal preocupación o reto en este momento de tu vida?",
                    palabras_clave={
                        "joven": [
                            "encontrar trabajo", "terminar los estudios", "independizarme", "salir de casa",
                            "qué estudiar", "futuro profesional", "primer empleo", "experiencia laboral",
                            "dinero para estudios", "becas", "prácticas", "oposiciones"
                        ],
                        "adulto_activo": [
                            "equilibrio trabajo-familia", "cuidar a mis hijos", "educación de los niños",
                            "pagar la hipoteca", "ahorrar para el futuro", "ascender en el trabajo",
                            "conciliar", "estrés laboral", "responsabilidades"
                        ],
                        "migrante": [
                            "aprender el idioma", "encontrar trabajo aquí", "adaptar mis estudios", "homologar título",
                            "hacer amigos", "entender la cultura", "regularizar papeles", "conseguir residencia",
                            "traer a mi familia", "enviar dinero", "nostalgia", "extraño mi país"
                        ],
                        "mayor_70": [
                            "cuidar mi salud", "estar activo", "no ser una carga", "mantener independencia",
                            "tiempo con familia", "soledad", "aburrimiento", "actividades", "medicación"
                        ],
                        "discapacidad_visual": [
                            "movilidad", "independencia", "accesibilidad", "tecnología adaptada",
                            "orientación", "desplazamiento", "leer", "usar el ordenador", "autonomía"
                        ]
                    },
                    peso=1.8
                )
            ],
            "origen_cultural": [
                PreguntaOnboarding(
                    id="origen_01",
                    categoria="origen_cultural",
                    pregunta="¿De dónde eres originalmente? ¿Naciste en España o vienes de otro lugar?",
                    palabras_clave={
                        "migrante": [
                            # Países específicos - LA CLAVE PARA DETECTAR MIGRANTES
                            "Colombia", "Venezuela", "Argentina", "México", "Perú", "Ecuador", "Bolivia", "Chile",
                            "Uruguay", "Paraguay", "Honduras", "El Salvador", "Nicaragua", "Guatemala", "Cuba",
                            "República Dominicana", "Marruecos", "Rumania", "Ucrania", "Polonia", "China", "Pakistán",
                            # Expresiones claras de no ser español
                            "soy de", "vengo de", "nací en", "mi país es", "llegué desde", "vine desde",
                            "no soy español", "soy extranjero", "de fuera", "otro país", "mi tierra"
                        ],
                        "joven": ["España", "español", "española", "aquí", "siempre aquí", "nací aquí", "de aquí", "local"],
                        "adulto_activo": ["español", "de aquí", "nací en España", "toda la vida aquí"],
                        "mayor_70": ["español de toda la vida", "siempre en España", "de aquí"],
                        "discapacidad_visual": []
                    },
                    peso=3.0
                ),
                PreguntaOnboarding(
                    id="origen_02",
                    categoria="origen_cultural",
                    pregunta="Si no eres de España, ¿cuánto tiempo llevas aquí y qué ha sido lo más difícil?",
                    palabras_clave={
                        "migrante": [
                            # Tiempo en España
                            "llevo", "hace", "llegué hace", "desde hace", "meses aquí", "años aquí", "poco tiempo",
                            "recientemente", "recién llegado", "nuevo en España",
                            # Dificultades típicas
                            "el idioma", "hablar español", "entender", "acento", "expresiones", "palabras diferentes",
                            "los papeles", "burocracia", "trámites", "documentación", "permisos", "extranjería",
                            "encontrar trabajo", "buscar empleo", "sin contactos", "no conocía a nadie",
                            "nostalgia", "echo de menos", "extraño", "familia lejos", "solos aquí",
                            "costumbres", "cultura diferente", "todo es diferente", "no entendía cómo"
                        ],
                        "joven": ["no aplica", "siempre he estado aquí"],
                        "adulto_activo": ["no aplica", "soy español"],
                        "mayor_70": ["no aplica", "de aquí"],
                        "discapacidad_visual": []
                    },
                    peso=2.5
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
                        "mayor_70": ["complicado", "difícil", "lento", "confuso", "prefiero lo tradicional", "me cuesta", "necesito ayuda", "no entiendo", "me pierdo"],
                        "migrante": ["diferente", "distinto a mi país", "adaptándome", "aquí es diferente"],
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
                        "mayor_70": ["tradicional", "papel", "presencial", "persona a persona", "como siempre"],
                        "migrante": ["como en mi país", "diferente aquí"],
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
                        "mayor_70": ["jubilado", "jubilación", "pensión", "retirado", "ya no trabajo"],
                        "migrante": ["buscando trabajo", "trabajos temporales", "validar título", "empleo básico"],
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
                        "mayor_70": ["tranquila", "relajada", "sin prisa", "a mi ritmo", "peaceful"],
                        "migrante": ["incierta", "adaptándome", "cambiante"],
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
                        "mayor_70": ["jardín", "nietos", "pasear", "leer", "televisión", "radio", "visitas"],
                        "migrante": ["contactar familia", "videollamadas", "buscar comunidad"],
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
                        "mayor_70": ["físicas", "sociales", "presencial", "grupo", "persona a persona"],
                        "migrante": ["aprender idioma", "conocer gente"],
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
                        "mayor_70": ["algo", "gafas", "letra grande", "presbycia"],
                        "migrante": ["normal", "bien"]
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
                        "mayor_70": ["no", "no sé qué es"],
                        "migrante": ["no", "no conozco"]
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
                "migrante": 0.0,
                "mayor_70": 0.0,
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
        """Sistema de análisis mejorado que prioriza coincidencias específicas y usa puntuación inteligente"""
        
        etapas_validas = ["joven", "adulto_activo", "migrante", "mayor_70", "discapacidad_visual"]
        scores = {etapa: 0.0 for etapa in etapas_validas}
        respuesta_lower = respuesta.lower()
        
        # Análisis por etapa con diferentes estrategias
        for etapa, palabras_clave in pregunta.palabras_clave.items():
            if etapa not in etapas_validas or not palabras_clave:
                continue

            coincidencias_encontradas = []
            for palabra_clave in palabras_clave:
                if palabra_clave.lower() in respuesta_lower:
                    coincidencias_encontradas.append(palabra_clave)

            if coincidencias_encontradas:
                # Puntuación base por número de coincidencias
                score_base = len(coincidencias_encontradas)
                
                # BOOST ESPECIAL: Para perfiles únicos que son fáciles de detectar
                if etapa == "migrante" and pregunta.categoria == "origen_cultural":
                    # Si menciona país extranjero o situación migratoria = BOOST MASIVO
                    paises = ["colombia", "venezuela", "argentina", "méxico", "perú", "ecuador", "bolivia", "chile", 
                             "marruecos", "rumania", "ucrania", "china", "pakistan", "senegal", "nigeria"]
                    if any(pais in respuesta_lower for pais in paises):
                        score_base *= 3.0  # Triple puntuación para países
                    elif any(expr in respuesta_lower for expr in ["soy de", "vengo de", "nací en", "no soy español"]):
                        score_base *= 2.5  # Doble y medio para expresiones migratorias
                
                elif etapa == "mayor_70":
                    # Boost para edades y jubilación
                    edades_mayores = ["60 años", "65 años", "70 años", "75 años", "80 años", "jubilado", "pensión"]
                    if any(edad in respuesta_lower for edad in edades_mayores):
                        score_base *= 2.0
                
                elif etapa == "discapacidad_visual":
                    # Boost para menciones directas de problemas visuales
                    problemas_vista = ["no veo", "ciego", "ceguera", "lector de pantalla", "bastón blanco"]
                    if any(problema in respuesta_lower for problema in problemas_vista):
                        score_base *= 2.5
                
                elif etapa == "joven":
                    # Boost para situaciones típicamente juveniles
                    situaciones_jovenes = ["estudiante", "universidad", "vivo con mis padres", "primer empleo"]
                    if any(situacion in respuesta_lower for situacion in situaciones_jovenes):
                        score_base *= 1.5
                
                # Aplicar peso de la pregunta
                scores[etapa] = score_base * pregunta.peso
                
                if coincidencias_encontradas:
                    logger.debug(f"[{etapa}] {len(coincidencias_encontradas)} coincidencias (score: {scores[etapa]:.1f}): {coincidencias_encontradas[:3]}")
        
        logger.debug(f"Scores para '{respuesta[:50]}': {scores}")
        return scores
    
    def _clasificar_usuario(self, estado: OnboardingEstado) -> ClasificacionResult:
        """Clasificación inteligente que prioriza perfiles específicos y usa umbrales adaptativos"""
        
        scores_finales = estado.scores.copy()
        
        # Encontrar ganador y segundo lugar
        etapa_ganadora = max(scores_finales, key=scores_finales.get)
        score_max = scores_finales[etapa_ganadora]
        
        scores_ordenados = sorted(scores_finales.values(), reverse=True)
        score_segundo = scores_ordenados[1] if len(scores_ordenados) > 1 else 0
        margen = score_max - score_segundo
        
        # LÓGICA DE CLASIFICACIÓN INTELIGENTE
        
        # 1. Perfiles específicos con señales claras = clasificación directa
        if etapa_ganadora in ["migrante", "mayor_70", "discapacidad_visual"] and score_max >= 5.0:
            puede_clasificar = True
            confianza = min(1.0, margen / score_max) if score_max > 0 else 0
            razon = f"Perfil específico detectado con señal clara (score: {score_max:.1f})"
        
        # 2. Adulto activo necesita evidencia sólida pero no excesiva
        elif etapa_ganadora == "adulto_activo":
            if score_max >= 6.0 and margen >= 2.0:  # Umbral reducido de 8.0 a 6.0
                puede_clasificar = True
                confianza = margen / score_max
                razon = f"Adulto activo con evidencia sólida (score: {score_max:.1f}, margen: {margen:.1f})"
            else:
                # Adulto activo sin evidencia suficiente -> cambiar a joven
                etapa_ganadora = "joven"
                score_max = scores_finales.get("joven", 1.0)
                puede_clasificar = True
                confianza = 0.3
                razon = f"Insuficiente evidencia para adulto activo, reclasificado como joven"
        
        # 3. Joven con evidencia moderada
        elif etapa_ganadora == "joven" and score_max >= 3.0:
            puede_clasificar = True
            confianza = min(0.8, margen / score_max) if score_max > 0 else 0.3
            razon = f"Joven con evidencia moderada (score: {score_max:.1f})"
        
        # 4. Respuestas muy vagas -> joven por defecto
        else:
            if score_max < 2.0:
                etapa_ganadora = "joven"
                score_max = 1.0
                puede_clasificar = True
                confianza = 0.2
                razon = "Respuestas vagas, clasificado como joven (perfil neutro)"
            else:
                puede_clasificar = False
                confianza = 0.0
                razon = f"Evidencia insuficiente para clasificar (score máx: {score_max:.1f})"
        
        resultado = ClasificacionResult(
            etapa_detectada=etapa_ganadora,
            confianza=confianza,
            scores=scores_finales,
            puede_clasificar=puede_clasificar,
            razon=razon
        )
        
        logger.info(f"CLASIFICACIÓN FINAL: {etapa_ganadora} (score: {score_max:.1f}, confianza: {confianza:.2f})")
        logger.info(f"Scores completos: {scores_finales}")
        logger.info(f"Razón: {razon}")
        
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
            "migrante": "Inmigrante",
            "mayor_70": "Adulto Mayor",
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