import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Brain, 
  Mic, 
  MicOff, 
  Zap, 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain,
  Wind,
  Sparkles,
  TreePine,
  Flower,
  Music,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Palette
} from 'lucide-react'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi'
import './MoodSection.css'

// Configuración de la API
const API_BASE_URL = 'http://localhost:8001'

// Funciones de API para checkins emocionales
const apiService = {
  // Guardar checkin emocional
  async guardarCheckinEmocional(estadoEmocional, contexto = null) {
    try {
      // Obtener información del usuario desde localStorage
      const ritmoUser = JSON.parse(localStorage.getItem('ritmo_user') || '{}')
      const userId = ritmoUser.id || localStorage.getItem('userId') || 'temp-user-123'
      const telegramId = ritmoUser.telegram_id || localStorage.getItem('telegramId') || null
      
      // Asegurarse de que telegram_id sea string si existe
      const telegramIdStr = telegramId ? String(telegramId) : null
      
      console.log('Guardando checkin:', { estadoEmocional, userId, telegramIdStr })
      
      const requestBody = {
        user_id: userId,
        estado_emocional: estadoEmocional,
        telegram_id: telegramIdStr,
        metodo: 'web_galaxia',
        mensaje_contexto: contexto
      }
      

      
      const response = await fetch(`${API_BASE_URL}/checkins/emocional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })



      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData)
        console.error('HTTP Error:', response.status, errorData)
        throw new Error(`HTTP error! status: ${response.status}. Response: ${errorData}`)
      }

      const data = await response.json()
      console.log('Checkin guardado exitosamente:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Error al guardar checkin emocional:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener último checkin
  async obtenerUltimoCheckin() {
    try {
      const ritmoUser = JSON.parse(localStorage.getItem('ritmo_user') || '{}')
      const userId = ritmoUser.id || localStorage.getItem('userId') || 'temp-user-123'
      
      const response = await fetch(`${API_BASE_URL}/checkins/usuario/${userId}/ultimo`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener último checkin:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener historial de checkins
  async obtenerHistorialCheckins(diasAtras = 7) {
    try {
      const ritmoUser = JSON.parse(localStorage.getItem('ritmo_user') || '{}')
      const userId = ritmoUser.id || localStorage.getItem('userId') || 'temp-user-123'
      
      const response = await fetch(`${API_BASE_URL}/checkins/usuario/${userId}/historial?dias_atras=${diasAtras}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener historial de checkins:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener estados emocionales disponibles
  async obtenerEstadosDisponibles() {
    try {
      const response = await fetch(`${API_BASE_URL}/checkins/estados-disponibles`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener estados disponibles:', error)
      return { success: false, error: error.message }
    }
  }
}

// Estados emocionales que coinciden con la API del backend
const emotions = [
  { 
    id: 'sereno', 
    label: 'Sereno', 
    color: '#4A90E2', 
    icon: '🧘', 
    energy: 0.4, 
    valence: 0.7,
    constellation: 'Aqua Serenitas',
    description: 'Como una superficie de agua calma'
  },
  { 
    id: 'radiante', 
    label: 'Radiante', 
    color: '#F5A623', 
    icon: '🌟', 
    energy: 0.9, 
    valence: 0.9,
    constellation: 'Luminara Solar',
    description: 'Energía que brilla desde dentro'
  },
  { 
    id: 'esperanzado', 
    label: 'Esperanzado', 
    color: '#7ED321', 
    icon: '🌅', 
    energy: 0.6, 
    valence: 0.8,
    constellation: 'Aurora Viridis',
    description: 'Mirando hacia un futuro brillante'
  },
  { 
    id: 'creativo', 
    label: 'Creativo', 
    color: '#9013FE', 
    icon: '🎨', 
    energy: 0.7, 
    valence: 0.8,
    constellation: 'Nebulosa Artística',
    description: 'Ideas fluyendo como estrellas'
  },
  { 
    id: 'conectado', 
    label: 'Conectado', 
    color: '#50E3C2', 
    icon: '🌊', 
    energy: 0.6, 
    valence: 0.9,
    constellation: 'Vínculo Cósmico',
    description: 'En sintonía con el universo'
  },
  { 
    id: 'reflexivo', 
    label: 'Reflexivo', 
    color: '#BD10E0', 
    icon: '🤔', 
    energy: 0.4, 
    valence: 0.5,
    constellation: 'Espejo Estelar',
    description: 'Contemplando las profundidades'
  },
  { 
    id: 'nostalgico', 
    label: 'Nostálgico', 
    color: '#B8E986', 
    icon: '🍃', 
    energy: 0.3, 
    valence: 0.4,
    constellation: 'Eco del Pasado',
    description: 'Conectado con memorias del pasado'
  },
  { 
    id: 'ansioso', 
    label: 'Ansioso', 
    color: '#F8E71C', 
    icon: '⚡', 
    energy: 0.8, 
    valence: 0.2,
    constellation: 'Tormenta Eléctrica',
    description: 'Como estrellas que titilan inquietas'
  },
  { 
    id: 'confundido', 
    label: 'Confundido', 
    color: '#8B572A', 
    icon: '🌫️', 
    energy: 0.4, 
    valence: 0.3,
    constellation: 'Laberinto de Niebla',
    description: 'Entre nebulosas de incertidumbre'
  },
  { 
    id: 'abrumado', 
    label: 'Abrumado', 
    color: '#D0021B', 
    icon: '🌪️', 
    energy: 0.7, 
    valence: 0.1,
    constellation: 'Tormenta Escarlata',
    description: 'Bajo el peso de galaxias'
  }
]

const moodSongs = {
  feliz: "Happy Vibes Mix - Música que eleva el alma",
  eufórico: "Energy Boost - Beats que hacen vibrar",
  relajado: "Chill Sessions - Sonidos para el alma",
  melancólico: "Healing Sounds - Acompañar la nostalgia",
  ansioso: "Calming Waves - Respirar con tranquilidad",
  motivado: "Power Up - Música para conquistar el mundo",
  confundido: "Clarity Mix - Sonidos para encontrar el camino",
  tranquilo: "Peaceful Moments - Serenidad sonora",
  enojado: "Release Tension - Canalizar la energía",
  nostálgico: "Memory Lane - Melodías del recuerdo"
}

export default function MoodSection() {
  const [currentMood, setCurrentMood] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [isVoiceAnalyzing, setIsVoiceAnalyzing] = useState(false)
  const [showGalaxy, setShowGalaxy] = useState(true)
  const [breathingGuide, setBreathingGuide] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [journalEntry, setJournalEntry] = useState('')
  const [moodPrediction, setMoodPrediction] = useState(null)
  const [contextFactors, setContextFactors] = useState({
    weather: 'sunny',
    sleep: 7,
    activity: 'work',
    energy: 0.7
  })

  // Estados para la gestión de API y persistencia
  const [isSavingMood, setIsSavingMood] = useState(false)
  const [lastSavedMood, setLastSavedMood] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Estado para el jardín emocional
  const [emotionalGarden, setEmotionalGarden] = useState([])
  const [hoveredConstellation, setHoveredConstellation] = useState(null)
  const [galaxyAnimation, setGalaxyAnimation] = useState(0)
  const canvasRef = useRef(null)
  const [breathingCycle, setBreathingCycle] = useState(0)
  const animationRef = useRef(null)
  
  // Estrellas de fondo estáticas (creadas una sola vez)
  const backgroundStarsRef = useRef(null)

  // Función para manejar selección de emoción con guardado en BD
  const handleEmotionSelect = async (emotion) => {
    setIsSavingMood(true)
    
    try {
      // Actualizar estado local inmediatamente para UX responsive
      setSelectedEmotion(emotion)
      setCurrentMood({
        ...emotion,
        timestamp: new Date(),
        source: 'manual',
        confidence: 1
      })
      
      // Agregar al historial local
      const newMoodEntry = {
        emotion: emotion.id,
        timestamp: new Date(),
        confidence: 1
      }
      setMoodHistory(prev => [...prev.slice(-9), newMoodEntry])
      
      // Guardar en localStorage también
      localStorage.setItem('moodHistory', JSON.stringify([...moodHistory.slice(-9), newMoodEntry]))
      
      // Efecto visual inmediato
      growPlant(emotion)
      setHoveredConstellation(emotion)
      
      console.log('Enviando a API:', emotion.id)
      
      // Guardar en base de datos
      const result = await apiService.guardarCheckinEmocional(
        emotion.id,
        journalEntry.trim() || null
      )
      
      console.log('Resultado de API:', result)
      
      if (result.success) {
        setLastSavedMood(result.data)
        
        // Limpiar el journal entry después de guardar
        setJournalEntry('')
        
        console.log('Checkin guardado exitosamente:', result.data)
      } else {
        console.error('Error al guardar:', result.error)
      }
      
    } catch (error) {
      console.error('Error inesperado en handleEmotionSelect:', error)
    } finally {
      setIsSavingMood(false)
      
      // Limpiar mensaje después de 4 segundos
      setTimeout(() => {
        setHoveredConstellation(null)
      }, 4000)
    }
  }

  // Cargar historial de checkins al inicializar
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingHistory(true)
      
      // Cargar desde localStorage primero para mostrar inmediatamente
      const storedUser = localStorage.getItem('user')
      const storedHistory = localStorage.getItem('moodHistory')
      
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          setMoodHistory(parsedHistory)
          
          if (parsedHistory.length > 0) {
            const lastMood = parsedHistory[parsedHistory.length - 1] // Usar el último elemento
            const emotion = emotions.find(e => e.id === lastMood.emotion)
            if (emotion) {
              setCurrentMood({
                ...emotion,
                timestamp: lastMood.timestamp ? new Date(lastMood.timestamp) : new Date(),
                source: 'local',
                confidence: lastMood.confidence || 1
              })
              setSelectedEmotion(emotion) // Establecer emoción seleccionada
            }
          }
        } catch (error) {
          console.error('Error parsing stored history:', error)
          // Limpiar localStorage si está corrupto
          localStorage.removeItem('moodHistory')
        }
      }
      
      setIsLoadingHistory(false)
    }

    loadUserData()
  }, []) // Solo ejecutar al montar el componente

  // Simulación de análisis de voz
  const analyzeVoice = async () => {
    setIsVoiceAnalyzing(true)
    
    // Simular proceso de análisis
    setTimeout(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      setCurrentMood({
        ...randomEmotion,
        confidence: Math.random() * 0.4 + 0.6,
        timestamp: new Date(),
        source: 'voice'
      })
      setIsVoiceAnalyzing(false)
      
      // Agregar a historial
      setMoodHistory(prev => [...prev.slice(-9), {
        emotion: randomEmotion.id,
        timestamp: new Date(),
        confidence: Math.random() * 0.4 + 0.6
      }])
    }, 3000)
  }

  // Predicción de ánimo basada en patrones
  useEffect(() => {
    if (moodHistory.length >= 3) {
      const recentMoods = moodHistory.slice(-3)
      const avgEnergy = recentMoods.reduce((acc, mood) => {
        const emotion = emotions.find(e => e.id === mood.emotion)
        // Validar que la emoción existe antes de acceder a sus propiedades
        return acc + (emotion?.energy || 0.5)  // Usar 0.5 como valor por defecto
      }, 0) / recentMoods.length

      const predictedEmotion = emotions.find(e => 
        Math.abs(e.energy - avgEnergy) < 0.2
      ) || emotions[0]

      setMoodPrediction({
        emotion: predictedEmotion,
        probability: Math.random() * 0.3 + 0.7,
        factors: ['Patrón de sueño', 'Actividad reciente', 'Historial emocional']
      })
    }
  }, [moodHistory])

  // Guía de respiración
  useEffect(() => {
    if (breathingGuide) {
      const interval = setInterval(() => {
        setBreathingCycle(prev => (prev + 1) % 4)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [breathingGuide])

  // Galaxia emocional canvas mejorada
  useEffect(() => {
    if (!showGalaxy || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Crear estrellas de fondo solo una vez
    if (!backgroundStarsRef.current) {
      backgroundStarsRef.current = [] 
      for (let i = 0; i < 80; i++) {
        backgroundStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.01
        })
      }
    }
      
      const drawGalaxy = () => {
        // Fondo del espacio profundo
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        )
        gradient.addColorStop(0, '#0a0a1a')
        gradient.addColorStop(0.3, '#1a0a2a')
        gradient.addColorStop(0.7, '#0a0a1a')
        gradient.addColorStop(1, '#000000')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Dibujar estrellas de fondo con efecto twinkle
        if (backgroundStarsRef.current) {
          backgroundStarsRef.current.forEach(star => {
            star.twinkle += star.twinkleSpeed;
            const brightness = (Math.sin(star.twinkle) + 1) * 0.5;
            const alpha = star.opacity * brightness;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de cruz para estrellas brillantes
            if (star.size > 1.5 && brightness > 0.7) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(star.x - star.size * 2, star.y);
              ctx.lineTo(star.x + star.size * 2, star.y);
              ctx.moveTo(star.x, star.y - star.size * 2);
              ctx.lineTo(star.x, star.y + star.size * 2);
              ctx.stroke();
            }
          });
        }
        
        // Dibujar nebulosas y constelaciones emocionales
        if (moodHistory && moodHistory.length > 0) {
          moodHistory.forEach((mood, index) => {
            const emotion = emotions.find(e => e.id === mood.emotion);
            if (!emotion) return;
            
            const progress = index / Math.max(moodHistory.length - 1, 1);
            const x = canvas.width * 0.15 + (progress * canvas.width * 0.7);
            const baseY = canvas.height / 2;
            const orbitRadius = 80 + Math.sin(progress * Math.PI * 2) * 40;
            const angle = galaxyAnimation * 0.003 + progress * Math.PI * 4;
            const y = baseY + Math.sin(angle) * orbitRadius * 0.25;
            
            const size = (mood.confidence * 25 + 15) * (1 + Math.sin(galaxyAnimation * 0.01) * 0.05);
            const pulseIntensity = Math.sin(galaxyAnimation * 0.008 + index) * 0.12 + 0.88;
          
          // Nebulosa de fondo
          const emotionColor = emotion.color || '#ffffff'
          const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
          nebulaGradient.addColorStop(0, emotionColor + '40')
          nebulaGradient.addColorStop(0.3, emotionColor + '20')
          nebulaGradient.addColorStop(0.6, emotionColor + '10')
          nebulaGradient.addColorStop(1, 'transparent')
          
          ctx.fillStyle = nebulaGradient
          ctx.beginPath()
          ctx.arc(x, y, size * 3 * pulseIntensity, 0, Math.PI * 2)
          ctx.fill()
          
          // Constelación principal (estrella central)
          const starGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
          starGradient.addColorStop(0, '#ffffff')
          starGradient.addColorStop(0.3, emotionColor)
          starGradient.addColorStop(0.7, emotionColor + 'aa')
          starGradient.addColorStop(1, emotionColor + '00')
          
          ctx.fillStyle = starGradient
          ctx.beginPath()
          ctx.arc(x, y, size * pulseIntensity, 0, Math.PI * 2)
          ctx.fill()
          
          // Rayos de luz emanando de la constelación
          const rayCount = 4 // Reducido de 6 a 4 para menos movimiento
          for (let i = 0; i < rayCount; i++) {
            const rayAngle = (i / rayCount) * Math.PI * 2 + galaxyAnimation * 0.001 // Reducido de 0.003 a 0.001
            const rayLength = size * 2 + Math.sin(galaxyAnimation * 0.006 + i) * size * 0.2 // Reducido de 0.012 y 0.3 a 0.006 y 0.2
            
            ctx.strokeStyle = emotionColor + '60'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(
              x + Math.cos(rayAngle) * rayLength,
              y + Math.sin(rayAngle) * rayLength
            )
            ctx.stroke()
          }
          
          // Partículas orbitales
          const particleCount = 4 // Reducido de 8 a 4 para menos movimiento
          for (let p = 0; p < particleCount; p++) {
            const particleAngle = (p / particleCount) * Math.PI * 2 + galaxyAnimation * 0.002 // Reducido de 0.005 a 0.002
            const particleDistance = size * 1.5 + Math.sin(galaxyAnimation * 0.006 + p) * size * 0.2
            const particleX = x + Math.cos(particleAngle) * particleDistance
            const particleY = y + Math.sin(particleAngle) * particleDistance
            const particleSize = 2 + Math.sin(galaxyAnimation * 0.005 + p) * 0.5 // Reducido de 0.01 y 0.8 a 0.005 y 0.5
            
            ctx.fillStyle = emotionColor + 'cc'
            ctx.beginPath()
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
            ctx.fill()
          }
          
          // Nombre de la constelación
          ctx.font = '14px "Plus Jakarta Sans", sans-serif'
          ctx.fillStyle = emotionColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          
          // Efecto de glow para el texto
          ctx.shadowColor = emotionColor
          ctx.shadowBlur = 10
          ctx.fillText(emotion.constellation, x, y + size + 10)
          ctx.shadowBlur = 0
          
          // Líneas conectoras entre constelaciones
          if (index > 0 && moodHistory[index - 1]) {
            const prevProgress = (index - 1) / Math.max(moodHistory.length - 1, 1)
            const prevX = canvas.width * 0.15 + (prevProgress * canvas.width * 0.7)
            const prevOrbitRadius = 80 + Math.sin(prevProgress * Math.PI * 2) * 40
            const prevAngle = galaxyAnimation * 0.003 + prevProgress * Math.PI * 4
            const prevY = baseY + Math.sin(prevAngle) * prevOrbitRadius * 0.2 // Reducido de 0.3 a 0.2
            
            // Buscar emoción anterior con validación
            const prevEmotion = emotions.find(e => e.id === moodHistory[index - 1].emotion)
            const prevColor = prevEmotion?.color || '#ffffff'
            const currentColor = emotion.color || '#ffffff'
            
            const connectionGradient = ctx.createLinearGradient(prevX, prevY, x, y)
            connectionGradient.addColorStop(0, prevColor + '60')
            connectionGradient.addColorStop(1, currentColor + '60')
            
            ctx.strokeStyle = connectionGradient
            ctx.lineWidth = 1
            ctx.setLineDash([5, 10])
            ctx.beginPath()
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(x, y)
            ctx.stroke()
            ctx.setLineDash([])
            }
          });
        }
      }
      
      let animationId
      
      const animate = () => {
        setGalaxyAnimation(prev => prev + 0.8) // Velocidad normal de animación
        drawGalaxy()
        animationId = requestAnimationFrame(animate)
      }
      
      animate()
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
  }, [showGalaxy, moodHistory, emotions])  // Incluir moodHistory y emotions para actualizar galaxia

  // Crecer plantas en el jardín emocional
  const growPlant = (emotion) => {
    setEmotionalGarden(prev => [...prev, {
      id: Date.now(),
      emotion: emotion.id,
      color: emotion.color,
      size: 1,
      type: Math.random() > 0.5 ? 'flower' : 'tree',
      timestamp: new Date()
    }])
  }

  return (
    <div className="mood-section">
      <motion.div 
        className="mood-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mood-title">
          <Heart className="mood-icon" />
          <div>
            <h1>Mi Universo Emocional</h1>
            <p>Explora, conecta y nutre tu mundo interior</p>
          </div>
        </div>
        
        <div className="mood-controls">
          <motion.button
            className="voice-analyzer"
            onClick={analyzeVoice}
            disabled={isVoiceAnalyzing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isVoiceAnalyzing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={20} />
                </motion.div>
                Analizando tu voz...
              </>
            ) : (
              <>
                <Mic size={20} />
                Detector de Ánimo por Voz
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <div className="mood-main-grid">
        {/* Galaxia Emocional */}
        <motion.div 
          className="galaxy-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <Sparkles size={20} />
            <h3>Galaxia Emocional</h3>
            <button 
              onClick={() => setShowGalaxy(!showGalaxy)}
              className="toggle-btn"
            >
              {showGalaxy ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showGalaxy && (
            <>
              <div className="galaxy-container">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={300}
                  className="galaxy-canvas"
                />
                {hoveredConstellation && (
                  <motion.div 
                    className="constellation-tooltip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h4>{hoveredConstellation.constellation}</h4>
                    <p>{hoveredConstellation.description}</p>
                    <div className="constellation-stats">
                      <span className="energy-level">
                        Energía: {Math.round(hoveredConstellation.energy * 100)}%
                      </span>
                      <span className="valence-level">
                        Positividad: {Math.round(hoveredConstellation.valence * 100)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="galaxy-legend">
                <div className="constellation-list">
                  {emotions.slice(0, 5).map((emotion) => (
                    <div 
                      key={emotion.id} 
                      className="constellation-item"
                      style={{ '--constellation-color': emotion.color }}
                      onMouseEnter={() => setHoveredConstellation(emotion)}
                      onMouseLeave={() => setHoveredConstellation(null)}
                    >
                      <div className="constellation-star"></div>
                      <span>{emotion.constellation}</span>
                    </div>
                  ))}
                </div>
                <p className="galaxy-description">
                  Tu viaje emocional representado como constelaciones vivientes en el cosmos interior. 
                  Cada emoción forma su propia nebulosa con características únicas.
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Selector de Emociones */}
        <motion.div 
          className="emotion-selector-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <Palette size={20} />
            <h3>¿Cómo te sientes ahora?</h3>
          </div>
          
          <div className="emotion-grid">
            {emotions.map((emotion) => (
              <motion.button
                key={emotion.id}
                className={`emotion-card ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`}
                style={{ '--emotion-color': emotion.color }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setHoveredConstellation(emotion)}
                onMouseLeave={() => {
                  if (selectedEmotion?.id !== emotion.id) {
                    setHoveredConstellation(null)
                  }
                }}
                onClick={() => handleEmotionSelect(emotion)}
                disabled={isSavingMood}
              >
                <div className="emotion-icon">{emotion.icon}</div>
                <div className="emotion-label">{emotion.label}</div>
                <div className="emotion-energy">
                  <div 
                    className="energy-bar" 
                    style={{ width: `${emotion.energy * 100}%` }}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Segunda fila - Jardín Emocional y Predictor */}
      <div className="mood-secondary-grid">
        {/* Jardín Emocional */}
        <motion.div 
          className="garden-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <Flower size={20} />
            <h3>Jardín Emocional</h3>
          </div>
          
          <div className="emotional-garden">
            {emotionalGarden.map((plant) => (
              <motion.div
                key={plant.id}
                className={`garden-plant ${plant.type}`}
                style={{ '--plant-color': plant.color }}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: plant.size, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20 
                }}
              >
                {plant.type === 'flower' ? <Flower size={24} /> : <TreePine size={24} />}
              </motion.div>
            ))}
          </div>
          
          <p className="garden-description">
            Cada emoción que sientes hace crecer una nueva planta en tu jardín interior
          </p>
        </motion.div>

        {/* Predictor de Ánimo */}
        {moodPrediction && (
          <motion.div 
            className="prediction-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <TrendingUp size={20} />
              <h3>Predicción Emocional</h3>
            </div>
            
            <div className="prediction-content">
              <div className="predicted-emotion">
                <span className="prediction-icon">{moodPrediction.emotion.icon}</span>
                <div>
                  <h4>{moodPrediction.emotion.label}</h4>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ 
                        width: `${moodPrediction.probability * 100}%`,
                        background: moodPrediction.emotion.color 
                      }} 
                    />
                  </div>
                  <p>{Math.round(moodPrediction.probability * 100)}% probable</p>
                </div>
              </div>
              
              <div className="prediction-factors">
                <h5>Basado en:</h5>
                {moodPrediction.factors.map((factor, index) => (
                  <span key={index} className="factor-tag">{factor}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Música Adaptativa */}
        {currentMood && (
          <motion.div 
            className="music-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header">
              <Music size={20} />
              <h3>Música para tu Estado</h3>
            </div>
            
            <div className="music-player">
              <div className="now-playing">
                <div 
                  className="album-art" 
                  style={{ background: currentMood.color }}
                >
                  <Music size={32} />
                </div>
                <div className="track-info">
                  <h4>{moodSongs[currentMood.id]}</h4>
                  <p>Personalizada para: {currentMood.label}</p>
                </div>
              </div>
              
              <div className="music-controls">
                <FiSkipBack size={20} />
                <FiPlay size={24} />
                <FiSkipForward size={20} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Guía de Respiración */}
      <AnimatePresence>
        {breathingGuide && (
          <motion.div 
            className="breathing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="breathing-guide">
              <button 
                className="close-breathing"
                onClick={() => setBreathingGuide(false)}
              >
                ×
              </button>
              
              <div className="breathing-circle">
                <motion.div 
                  className="breath-indicator"
                  animate={{ scale: breathingCycle < 2 ? 1.5 : 0.8 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Wind size={40} />
                </motion.div>
              </div>
              
              <div className="breathing-instruction">
                {breathingCycle === 0 && "Inhala profundamente..."}
                {breathingCycle === 1 && "Mantén el aire..."}
                {breathingCycle === 2 && "Exhala lentamente..."}
                {breathingCycle === 3 && "Pausa y relájate..."}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante para respiración */}
      <motion.button
        className="floating-breath-btn"
        onClick={() => setBreathingGuide(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(64, 224, 208, 0.3)",
            "0 0 40px rgba(64, 224, 208, 0.6)",
            "0 0 20px rgba(64, 224, 208, 0.3)"
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Wind size={24} />
      </motion.button>
    </div>
  )
}