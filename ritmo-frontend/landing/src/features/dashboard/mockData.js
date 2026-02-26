// Mock data for the dashboard

export const userData = {
  name: "Lucía",
  streak: 42,
  bestStreak: 12,
}

export const weekMoodData = [
  { day: "Mié", mood: "Bien", value: 3, color: "#8AAF8B" },
  { day: "Jue", mood: "Normal", value: 2, color: "#D1D5DB" },
  { day: "Vie", mood: "Bien", value: 3, color: "#8AAF8B" },
  { day: "Sáb", mood: "Difícil", value: 1, color: "#F0A8A8" },
  { day: "Dom", mood: "Normal", value: 2, color: "#D1D5DB" },
  { day: "Lun", mood: "Bien", value: 3, color: "#8AAF8B" },
  { day: "Mar", mood: "Normal", value: 2, color: "#D1D5DB" },
]

export const todayMood = "Normal"

export const habitsData = {
  completed: 3,
  total: 5,
  habits: [
    { id: 1, name: "Caminar 20 min", completed: true, streak: "5d" },
    { id: 2, name: "Dormir 7h+", completed: false, streak: "0d" },
    { id: 3, name: "Sin pantallas 1h antes", completed: true, streak: "3d" },
    { id: 4, name: "Hablar con alguien", completed: false, streak: "1d" },
    { id: 5, name: "Respiración consciente", completed: true, streak: "8d" },
  ]
}

export const playlistsData = [
  {
    id: 1,
    title: "Chill vibes",
    image: "/image/portada1.png",
    mood: "calma",
    featured: true,
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn"
  },
  {
    id: 2,
    title: "Brilla tu día",
    image: "/image/portada2.png",
    mood: "bien",
    featured: false,
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd"
  },
  {
    id: 3,
    title: "Feels",
    image: "/image/portada3.png",
    mood: "normal",
    featured: false,
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa"
  },
  {
    id: 4,
    title: "Energía bonita",
    image: "/image/portada4.png",
    mood: "bien",
    featured: false,
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n"
  },
]

export const chatMessages = [
  {
    id: 1,
    sender: "ritmo",
    message: "Buenos días, Lucía. Ayer fue un día difícil. ¿Cómo has dormido?",
    time: "08:00"
  },
  {
    id: 2,
    sender: "user",
    message: "Más o menos… me costó dormir",
    time: "09:25"
  },
  {
    id: 3,
    sender: "ritmo",
    message: "Es normal después de un día así. No tienes que hacer nada especial hoy. Solo cuídate",
    time: "09:26"
  }
]

// Retos diarios - lista ampliada y más creativa para jóvenes
export const dailyChallenges = [
  {
    id: 1,
    title: "Desconexión digital de 15 min",
    description: "Deja todos los dispositivos y haz algo analógico",
    icon: "📵",
    points: 15,
    category: "digital"
  },
  {
    id: 2,
    title: "Captura un momento inesperado",
    description: "Fotografía algo que te sorprenda hoy",
    icon: "📸",
    points: 20,
    category: "creative"
  },
  {
    id: 3,
    title: "Micromeditación: 3 respiraciones",
    description: "Inhala 4 seg, mantén 4 seg, exhala 6 seg. Repite x3",
    icon: "🫁",
    points: 10,
    category: "wellness"
  },
  {
    id: 4,
    title: "Descubre tu próxima canción favorita",
    description: "Explora un género musical que nunca escuches",
    icon: "🎵",
    points: 25,
    category: "music"
  },
  {
    id: 5,
    title: "Mensaje random de cariño",
    description: "Escribele algo bonito a alguien inesperado",
    icon: "💬",
    points: 20,
    category: "social"
  },
  {
    id: 6,
    title: "Estiramiento de oficina",
    description: "Cuello, hombros y muñecas. Tu cuerpo lo agradecerá",
    icon: "🧘",
    points: 15,
    category: "wellness"
  },
  {
    id: 7,
    title: "Sketch de tu estado de ánimo",
    description: "Dibuja cómo te sientes usando solo líneas y colores",
    icon: "✏️",
    points: 25,
    category: "creative"
  },
  {
    id: 8,
    title: "Caminata consciente",
    description: "15 min sin música, solo observando lo que te rodea",
    icon: "🚶",
    points: 20,
    category: "movement"
  },
  {
    id: 9,
    title: "Complimenta a un extraño",
    description: "Hazle el día mejor a alguien que no conoces",
    icon: "😊",
    points: 30,
    category: "social"
  },
  {
    id: 10,
    title: "Aprende una palabra nueva",
    description: "Encuentra una palabra genial y úsala en conversación",
    icon: "📚",
    points: 15,
    category: "learning"
  },
  {
    id: 11,
    title: "Baila una canción completa",
    description: "Que nadie te vea, solo muévete como quieras",
    icon: "💃",
    points: 20,
    category: "movement"
  },
  {
    id: 12,
    title: "Escribe 3 cosas por las que estás agradecido",
    description: "Pueden ser súper simples, como el café de la mañana",
    icon: "🙏",
    points: 15,
    category: "mindfulness"
  },
  {
    id: 13,
    title: "Reorganiza un espacio pequeño",
    description: "Tu escritorio, un cajón, solo algo que uses a diario",
    icon: "📦",
    points: 25,
    category: "productivity"
  },
  {
    id: 14,
    title: "Llama (no textes) a alguien querido",
    description: "5 minutos de conversación real, no mensajes",
    icon: "📞",
    points: 25,
    category: "social"
  },
  {
    id: 15,
    title: "Sesión de memes terapia",
    description: "5 min viendo memes que te hagan reír de verdad",
    icon: "😂",
    points: 10,
    category: "fun"
  },
  {
    id: 16,
    title: "Crear una playlist para tu 'yo' del futuro",
    description: "Música para la persona que quieres ser",
    icon: "🎧",
    points: 30,
    category: "music"
  },
  {
    id: 17,
    title: "Experimento culinario de 5 min",
    description: "Mezcla algo en la cocina sin usar receta",
    icon: "🍳",
    points: 20,
    category: "creative"
  },
  {
    id: 18,
    title: "Selfie con tu planta/mascota/objeto favorito",
    description: "Documenta un momento random de tu día",
    icon: "🤳",
    points: 15,
    category: "fun"
  },
  {
    id: 19,
    title: "Lee algo que no sea una pantalla",
    description: "Libro, revista, even the cereal box cuenta",
    icon: "📖",
    points: 20,
    category: "learning"
  },
  {
    id: 20,
    title: "Haz algo lindo por tu yo del futuro",
    description: "Prepara algo para mañana que te haga sonreír",
    icon: "🎁",
    points: 25,
    category: "selfcare"
  }
]

// Recomendaciones personalizadas - varían según mood y contexto
export const recommendations = [
  {
    id: 1,
    type: "activity",
    title: "Journaling de 5 min",
    subtitle: "Escribe lo primero que venga a tu mente",
    mood: ["normal", "difícil"],
    icon: "📝",
    color: "#8AAF8B"
  },
  {
    id: 2,
    type: "playlist",
    title: "Sesión de lo-fi beats",
    subtitle: "Música tranquila para concentrarte",
    mood: ["normal", "bien"],
    icon: "🎧",
    color: "#EC4899"
  },
  {
    id: 3,
    type: "video",
    title: "Video de gatitos 😺",
    subtitle: "3 minutos de pura ternura",
    mood: ["difícil", "normal"],
    icon: "🐱",
    color: "#F59E0B"
  },
  {
    id: 4,
    type: "exercise",
    title: "Yoga para principiantes",
    subtitle: "15 min de movimiento suave",
    mood: ["bien", "normal"],
    icon: "🧘‍♀️",
    color: "#8AAF8B"
  },
  {
    id: 5,
    type: "podcast",
    title: "Podcast: Historias reales",
    subtitle: "Episodio de 20 min para desconectar",
    mood: ["normal", "bien"],
    icon: "🎙️",
    color: "#3B82F6"
  },
  {
    id: 6,
    type: "game",
    title: "Mini juego de memoria",
    subtitle: "Ejercita tu mente jugando",
    mood: ["bien"],
    icon: "🎮",
    color: "#EC4899"
  },
  {
    id: 7,
    type: "reading",
    title: "Cuento corto inspirador",
    subtitle: "5 min de lectura ligera",
    mood: ["normal", "difícil"],
    icon: "📖",
    color: "#8AAF8B"
  },
  {
    id: 8,
    type: "art",
    title: "Colorea un mandala",
    subtitle: "Arte terapia digital",
    mood: ["difícil", "normal"],
    icon: "🎨",
    color: "#F59E0B"
  }
]

// Quotes motivacionales - aleatorios
export const motivationalQuotes = [
  "No todos los días van a ser increíbles, y está bien",
  "Tu ritmo es perfecto, no importa cuál sea",
  "Sentir no es debilidad, es ser humano",
  "Hoy solo tienes que ser tú, nada más",
  "Está bien tomarse las cosas con calma",
  "Tu bienestar no es negociable",
  "Pequeños pasos también cuentan",
  "No estás solo en esto, nunca",
  "Respira. Estás haciendo lo mejor que puedes",
  "Tus sentimientos son válidos, todos ellos",
  "No hay prisa por estar bien",
  "Eres más fuerte de lo que crees",
  "Está bien pedir ayuda cuando la necesitas",
  "Tu historia importa, y también tu presente",
  "Date permiso para descansar"
]

// Tips rápidos - aparecen aleatoriamente
export const quickTips = [
  {
    text: "Cuando te sientas ansioso, nombra 5 cosas que puedas ver a tu alrededor",
    category: "anxiety"
  },
  {
    text: "La regla 5-4-3-2-1: identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas",
    category: "grounding"
  },
  {
    text: "No tienes que responder mensajes al instante. Tu tiempo es tuyo",
    category: "boundaries"
  },
  {
    text: "Dormir bien no es un lujo, es una necesidad. Priórízalo",
    category: "sleep"
  },
  {
    text: "Si algo te da ansiedad hoy, pregúntate: ¿importará en 5 años?",
    category: "perspective"
  },
  {
    text: "Beber agua es autocuidado. Hidrátate",
    category: "health"
  },
  {
    text: "Está bien decir 'no' sin dar explicaciones largas",
    category: "boundaries"
  },
  {
    text: "Compararte con otros en redes sociales es comparar tu detrás de cámaras con el highlight reel de alguien más",
    category: "social"
  }
]

// Función helper para obtener contenido aleatorio
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

// Función para obtener reto del día (basado en fecha para que sea consistente en el día)
export const getDailyChallenge = () => {
  const today = new Date().getDate()
  return dailyChallenges[today % dailyChallenges.length]
}

// Función para obtener recomendaciones según mood
export const getRecommendationsForMood = (currentMood, count = 3) => {
  const filtered = recommendations.filter(rec =>
    rec.mood.includes(currentMood.toLowerCase())
  )
  // Mezclar y tomar las primeras 'count'
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count)
}
