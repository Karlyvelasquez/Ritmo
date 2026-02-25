// Mock data for the Joven Dashboard
// Structured to match backend schemas (schemas.py)

export const mockUser = {
  nombre: 'Alex',
  etapa_vida: 'joven',
  modo_comunicacion: 'texto',
  avatar: null,
}

// Last 7 days of check-in data
const today = new Date()
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const mockCheckInHistory = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(today)
  date.setDate(date.getDate() - (6 - i))
  const states = ['bien', 'bien', 'normal', 'dificil', 'bien', 'normal', 'bien']
  return {
    fecha: date.toISOString().split('T')[0],
    diaNombre: dayNames[date.getDay()],
    estado: states[i],
  }
})

// Simulated pre-loaded chat messages
export const mockChatMessages = [
  {
    id: 1,
    role: 'ritmo',
    text: 'Hola Alex. No tienes que contarme nada si no quieres. Solo quiero que sepas que estoy aqui.',
    timestamp: '10:00',
  },
  {
    id: 2,
    role: 'user',
    text: 'Hoy no fue un buen dia la verdad',
    timestamp: '10:02',
  },
  {
    id: 3,
    role: 'ritmo',
    text: 'Gracias por compartirlo. No hace falta que le pongas nombre a todo lo que sientes. A veces basta con reconocer que algo pesa.',
    timestamp: '10:03',
  },
  {
    id: 4,
    role: 'user',
    text: 'Es que siento que todo el mundo espera algo de mi y no puedo con todo',
    timestamp: '10:05',
  },
  {
    id: 5,
    role: 'ritmo',
    text: 'Eso que describes suena agotador. La presion de los demas puede sentirse como si cargaras algo que no te pertenece. No tienes que resolver todo hoy.',
    timestamp: '10:06',
  },
]

// Simulated RITMO responses for new messages
export const ritmoResponses = [
  'Escucho lo que me dices. No hay prisa para nada.',
  'Eso que sientes es completamente valido. Gracias por compartirlo conmigo.',
  'A veces las cosas pesan mas de lo que parecen. Esta bien tomarse un momento.',
  'No necesitas tener todas las respuestas ahora. Estoy aqui contigo.',
  'Lo que describes tiene sentido. No estas exagerando.',
  'Puedes tomarte el tiempo que necesites. No voy a ninguna parte.',
]

// Habits tracker
export const mockHabits = [
  {
    id: 1,
    nombre: 'Dormir 8h',
    icono: 'moon',
    completadoHoy: true,
    racha: 5,
    meta_semanal: 7,
    progreso_semanal: 5,
  },
  {
    id: 2,
    nombre: 'Salir a caminar',
    icono: 'footprints',
    completadoHoy: false,
    racha: 3,
    meta_semanal: 5,
    progreso_semanal: 3,
  },
  {
    id: 3,
    nombre: 'Meditar',
    icono: 'brain',
    completadoHoy: false,
    racha: 0,
    meta_semanal: 4,
    progreso_semanal: 1,
  },
  {
    id: 4,
    nombre: 'Beber agua',
    icono: 'droplet',
    completadoHoy: true,
    racha: 12,
    meta_semanal: 7,
    progreso_semanal: 6,
  },
  {
    id: 5,
    nombre: 'Escribir diario',
    icono: 'pencil',
    completadoHoy: false,
    racha: 2,
    meta_semanal: 3,
    progreso_semanal: 2,
  },
]

// Inferred emotional state (from EstadoInferido schema)
export const mockEstadoInferido = {
  estado_principal: 'cansancio',
  confianza: 0.78,
  emociones_detectadas: ['agotamiento', 'frustracion', 'deseo_de_aceptacion'],
  contexto: 'Presion social y academica percibida. Necesita validacion y espacio.',
}

// States config with colors
export const estadoConfig = {
  bien: { label: 'Bien', color: '#8AAF8B', colorLight: 'rgba(138, 175, 139, 0.15)' },
  normal: { label: 'Normal', color: '#EEE2D7', colorDark: '#b08d6f', colorLight: 'rgba(238, 226, 215, 0.4)' },
  dificil: { label: 'Dificil', color: '#1E3751', colorLight: 'rgba(30, 55, 81, 0.15)' },
}
