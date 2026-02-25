import { Flame, Heart } from 'lucide-react'
import { useState, useEffect, createContext } from 'react'
import Sidebar from '../../components/Sidebar'
import WeekMoodChart from './components/WeekMoodChart'
import HabitsToday from './components/HabitsToday'
import MusicPlaylists from './components/MusicPlaylists'
import ChatPreview from './components/ChatPreview'
import DailyChallenge from './components/DailyChallenge'
import Recommendations from './components/Recommendations'
import QuoteOfDay from './components/QuoteOfDay'
import QuickTip from './components/QuickTip'
import { userData } from './mockData'
import './DashboardPage.css'

export const ThemeContext = createContext()

export default function DashboardPage() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ritmo-dark-mode')
    return saved ? JSON.parse(saved) : false
  })

  // Saludo dinámico según la hora
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "¿Aún despierto/a?"
    if (hour < 12) return `¡Buenos días, ${userName}! ☀️`
    if (hour < 18) return `¡Buenas tardes, ${userName}! 👋`
    if (hour < 22) return `¡Buenas noches, ${userName}! 🌙`
    return "¿No puedes dormir?"
  }

  const userName = user?.nombre?.split(' ')[0] || 'Amigo'

  const getGreetingEmoji = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "🌙"
    if (hour < 12) return "👋"
    if (hour < 18) return "✌️"
    if (hour < 22) return "🌆"
    return "🌙"
  }

  const getWelcomeMessage = () => {
    const messages = [
      "Un día normal también es un buen día. Estoy aquí si necesitas algo 💜",
      "No hay presión hoy. Solo sé tú 💚",
      "Cada día es diferente, y está bien ✨",
      "Pequeños pasos también cuentan 👣",
      "Tu ritmo es perfecto, sea cual sea 🎵",
      "Hoy solo tienes que aparecer, nada más 🌟"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('ritmo-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDark = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      <div className="dashboard-layout">
        <Sidebar darkMode={darkMode} toggleDark={toggleDark} />

        <main className="dashboard-content">
          <div className="dashboard-header">
            <div className="greeting">
              <h1>{getGreeting()} <span className="wave">{getGreetingEmoji()}</span></h1>
              <p>{getWelcomeMessage()}</p>
            </div>

            <div className="streak-badges">
              <div className="streak-badge fire">
                <Flame size={20} />
                <span><strong>{userData.streak}</strong> días juntos</span>
              </div>
              <div className="streak-badge heart">
                <Heart size={20} />
                <span><strong>{userData.bestStreak}</strong> días mejor racha</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-left">
              <QuoteOfDay />
              <WeekMoodChart />
              <DailyChallenge />
              <MusicPlaylists />
            </div>

            <div className="grid-right">
              <HabitsToday />
              <QuickTip />
              <Recommendations />
              <ChatPreview />
            </div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}
