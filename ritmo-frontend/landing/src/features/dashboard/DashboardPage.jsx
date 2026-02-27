import { Flame, Heart, Mic, MicOff } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle, FiHeadphones, FiZap, FiTrendingUp } from 'react-icons/fi'
import Sidebar from '../../components/Sidebar'
import { ThemeContext } from '../../RootRouter'
import WeekMoodChart from './components/WeekMoodChart'
import HabitsInteractive from './components/HabitsInteractive'
import MusicPlaylists from './components/MusicPlaylists'
import ChatPreview from './components/ChatPreview'
import DailyChallenge from './components/DailyChallenge'
import Recommendations from './components/Recommendations'
import QuoteOfDay from './components/QuoteOfDay'
import QuickTip from './components/QuickTip'
import VoiceChatButton from './components/VoiceChatButton'
import MoodSection from './components/MoodSection'
import ChatRitmo from './components/ChatRitmo'
import PlaylistsRitmo from './components/PlaylistsRitmo'
import ProgressRitmo from './components/ProgressRitmo'
import AjustesJoven from './components/AjustesJoven'
import { userData } from './mockData'
import './DashboardPage.css'

export default function DashboardPage() {
  const { darkMode, toggleDark } = useContext(ThemeContext)
  const [activeSection, setActiveSection] = useState('inicio')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })

  // Configurar tema en el documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const userName = user?.nombre?.split(' ')[0] || 'Amigo'

  // Saludos más naturales y juveniles
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "¿Madrugando o aún despierto?"
    if (hour < 12) return `Buenos días, ${userName}`
    if (hour < 18) return `¡Hola, ${userName}!`
    if (hour < 22) return `Buenas noches, ${userName}`
    return "¡Noctámbulo detectado!"
  }

  const getWelcomeMessage = () => {
    const messages = [
      "Tu espacio, tu ritmo. ¿Cómo te sientes hoy?",
      "Cada día es una nueva oportunidad. ¿Qué tal si empezamos?",
      "No hay presión, solo posibilidades. Cuéntame qué tal tu día",
      "Estoy aquí para lo que necesites. ¿Exploramos juntos?",
      "Tu bienestar es lo más importante. ¿Por dónde empezamos?",
      "Hoy también cuenta. ¿Cómo podemos hacer que sea genial?"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'animo':
        return <MoodSection />
      case 'habitos':
        return <HabitsInteractive />
      case 'chat':
        return <ChatRitmo />
      case 'playlists':
        return <PlaylistsRitmo />
      case 'progreso':
        return <ProgressRitmo />
      case 'ajustes':
        return <AjustesJoven />
      default:
        return (
          <>
            <motion.div 
              className="dashboard-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="greeting-section">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {getGreeting()}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {getWelcomeMessage()}
                </motion.p>
              </div>

              <motion.div 
                className="action-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <VoiceChatButton />
                
                <div className="stats-mini">
                  <div className="stat-item streak">
                    <FiZap />
                    <span>{userData.streak} días</span>
                  </div>
                  <div className="stat-item progress">
                    <FiTrendingUp />
                    <span>Mejor racha: {userData.bestStreak}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="dashboard-grid young-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="grid-main">
                <QuoteOfDay />
                <DailyChallenge />
                <WeekMoodChart />
                <MusicPlaylists />
              </div>

              <div className="grid-sidebar">
                <HabitsInteractive />
                <ChatPreview />
                <QuickTip />
                <Recommendations />
              </div>
            </motion.div>
          </>
        )
    }
  }

  return (
    <div className="dashboard-layout young-edition">
      <Sidebar 
        darkMode={darkMode} 
        toggleDark={toggleDark} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      <div className="dashboard-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  )
}
