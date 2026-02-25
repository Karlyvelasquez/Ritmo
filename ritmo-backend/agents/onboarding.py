from typing import Dict, List, Optional, Tuple
import random
import logging
from dataclasses import dataclass
import openai
import os

from models.schemas import OnboardingEstado, PreguntaOnboarding

logger = logging.getLogger(__name__)

# Configuración de OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
openai.api_key = OPENAI_API_KEY

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
                    palabras_clave={},
                    peso=1.5
                ),
                PreguntaOnboarding(
                    id="edad_02",
                    categoria="edad_contexto",
                    pregunta="¿Qué planes o metas tienes para los próximos años?",
                    palabras_clave={},
                    peso=1.0
                )
            ],
            "inmigracion": [
                PreguntaOnboarding(
                    id="migra_01",
                    categoria="inmigracion",
                    pregunta="¿Vives en tu país de origen o estás adaptándote a un nuevo lugar?",
                    palabras_clave={},
                    peso=2.0
                ),
                PreguntaOnboarding(
                    id="migra_02",
                    categoria="inmigracion",
                    pregunta="Si estás fuera de casa, ¿cuál ha sido el mayor reto al adaptarte a esta nueva cultura?",
                    palabras_clave={},
                    peso=1.8
                )
            ],
            "tecnologia": [
                PreguntaOnboarding(
                    id="tech_01",
                    categoria="tecnologia",
                    pregunta="¿Cómo te adaptas a las nuevas tecnologías? ¿Te resulta fácil o complicado?",
                    palabras_clave={},
                    peso=1.2
                ),
                PreguntaOnboarding(
                    id="tech_02",
                    categoria="tecnologia",
                    pregunta="¿Prefieres hacer las cosas de forma digital o tradicional? ¿Por qué?",
                    palabras_clave={},
                    peso=1.0
                )
            ],
            "trabajo": [
                PreguntaOnboarding(
                    id="work_01",
                    categoria="trabajo",
                    pregunta="¿A qué te dedicas actualmente? Cuéntame si estudias, trabajas o ya estás disfrutando de tu jubilación.",
                    palabras_clave={},
                    peso=1.6
                ),
                PreguntaOnboarding(
                    id="work_02",
                    categoria="trabajo",
                    pregunta="¿Sientes que tu rutina diaria es muy exigente o más bien tranquila?",
                    palabras_clave={},
                    peso=1.2
                )
            ],
            "tiempo_libre": [
                PreguntaOnboarding(
                    id="free_01",
                    categoria="tiempo_libre",
                    pregunta="¿Qué haces en tu tiempo libre? ¿Cuáles son tus actividades favoritas?",
                    palabras_clave={},
                    peso=1.1
                ),
                PreguntaOnboarding(
                    id="free_02",
                    categoria="tiempo_libre",
                    pregunta="¿Te gusta aprender cosas nuevas por internet o prefieres actividades más físicas/sociales?",
                    palabras_clave={},
                    peso=1.0
                )
            ],
            "discapacidad_visual": [
                PreguntaOnboarding(
                    id="visual_01",
                    categoria="discapacidad_visual",
                    pregunta="¿Tienes alguna dificultad para leer textos pequeños o prefieres que la interfaz sea muy clara y con voz?",
                    palabras_clave={},
                    peso=1.5
                ),
                PreguntaOnboarding(
                    id="visual_02",
                    categoria="discapacidad_visual",
                    pregunta="¿Usas habitualmente herramientas de accesibilidad en tu móvil u ordenador?",
                    palabras_clave={},
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
        """Analiza una respuesta utilizando GPT-4 y devuelve scores por etapa"""
        
        # Etapas válidas para clasificación
        etapas_validas = ["joven", "adulto_activo", "inmigrante", "adulto_mayor", "discapacidad_visual"]

        if pregunta.categoria == "discapacidad_visual":
            respuesta_lower = respuesta.lower()
            afirmativas = ["sí", "si", "claro", "por supuesto", "afirmativo", "tengo", "uso", "prefiero", "dificultad", "problema", "lector", "pantalla", "ampliador", "accesibilidad", "baja visión", "ceguera"]
            if any(palabra in respuesta_lower for palabra in afirmativas):
                return {etapa: (1.0 if etapa == "discapacidad_visual" else 0.0) for etapa in etapas_validas}        


        try:
            prompt = f"""Analiza esta respuesta del usuario para clasificarlo en un perfil.
            
Pregunta realizada: {pregunta.pregunta}
Respuesta del usuario: {respuesta}

Criterios de clasificación (Prioriza los rasgos específicos):
1. 'inmigrante': Menciona mudanza, vivir en otro país, nostalgia, retos de adaptación cultural, trámites migratorios o acento/jerga de otro lugar.
2. 'adulto_mayor': Menciona jubilación, nietos, medicación, salud de la edad, tiempo libre post-trabajo o dificultad técnica por edad (>65 años).
3. 'discapacidad_visual': Menciona dificultad significativa para ver, uso de lectores de pantalla, ceguera o fatiga visual extrema.
4. 'joven': Estudiante, primer empleo, vive con padres, lenguaje informal, soltero sin hijos (<25 años).
5. 'adulto_activo': Etapa intermedia (30-60 años), carrera profesional estable, hijos a cargo, hipoteca, vida laboral activa. 
   REGLA DE ORO: Solo asigna score alto aquí si NO hay rasgos claros de los perfiles anteriores.

Responde SOLO un JSON con scores de 0.0 a 1.0 para cada categoría:
{{"joven": 0.0, "adulto_activo": 0.0, "inmigrante": 0.0, "adulto_mayor": 0.0, "discapacidad_visual": 0.0}}"""
            
            completion = openai.ChatCompletion.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Eres un experto psicólogo y analista de perfiles. Tu misión es detectar rasgos específicos que diferencien a los usuarios. Siempre respondes con JSON sólido."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )

            # Procesar la respuesta de GPT-4
            gpt_response = completion['choices'][0]['message']['content'].strip()
            if "```json" in gpt_response:
                gpt_response = gpt_response.split("```json")[1].split("```")[0].strip()
            
            logger.debug(f"Respuesta GPT-4: {gpt_response}")
            
            # Intentar parsear como JSON
            import json
            try:
                scores = json.loads(gpt_response)
                # Validar que tenga todas las etapas y valores válidos
                valid_scores = {}
                for etapa in etapas_validas:
                    if etapa in scores and isinstance(scores[etapa], (int, float)):
                        valid_scores[etapa] = max(0.0, min(1.0, float(scores[etapa])))
                    else:
                        valid_scores[etapa] = 0.0
                return valid_scores
            except json.JSONDecodeError:
                logger.warning(f"GPT-4 no devolvió JSON válido: {gpt_response}")
                # Fallback: buscar etapas mencionadas en el texto
                scores = {etapa: 0.0 for etapa in etapas_validas}
                return scores
            
        except Exception as e:
            logger.error(f"Error al analizar respuesta con GPT-4: {e}")
            return {etapa: 0.0 for etapa in etapas_validas}
    
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
        # Bajamos el umbral para permitir clasificaciones más rápidas si hay señales claras
        puede_clasificar = (
            score_max > 0.4 and  # Score mínimo acumulado
            confianza >= self.umbral_confianza
        )
        
        razon = f"Max: {etapa_ganadora}({score_max:.2f}), Confianza: {confianza:.2f}"
        
        resultado = ClasificacionResult(
            etapa_detectada=etapa_ganadora,
            confianza=confianza,
            scores=scores_finales,
            puede_clasificar=puede_clasificar,
            razon=razon
        )
        
        logger.info(f"Clasificación actual: {etapa_ganadora} (conf: {confianza:.2f})")
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
            # En caso de duda, el perfil activo es el más polivalente
            estado.etapa_detectada = "adulto_activo"
            mensaje = "¡Gracias por compartir conmigo! He configurado un perfil estándar de Adulto Activo para ti, que podremos ajustar más adelante si lo necesitas."
        
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