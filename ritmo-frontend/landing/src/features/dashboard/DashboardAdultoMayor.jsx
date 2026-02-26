import { Flame, Heart } from 'lucide-react'
import { useState, useEffect, createContext } from 'react'
import Sidebar from '../../components/Sidebar'
import WeekMoodChart from './components/WeekMoodChart'
import HabitsToday from './components/HabitsToday'
import ChatPreview from './components/ChatPreview'
import DailyChallenge from './components/DailyChallenge'
import QuoteOfDay from './components/QuoteOfDay'
import QuickTip from './components/QuickTip'
import AlertButton from './components/AlertButton'
import MotivationMessage from './components/MotivationMessage'
import CognitivePuzzle from './components/CognitivePuzzle'
import RutinaDiaria from './components/RutinaDiaria'
import EjerciciosSuaves from './components/EjerciciosSuaves'
import AgendaSimplificada from './components/AgendaSimplificada'
import { userData } from './mockData'
import './DashboardPage.css'

export const ThemeContext = createContext()

export default function DashboardAdultoMayor() {
    const [user] = useState(() => {
        const saved = localStorage.getItem('ritmo_user')
        return saved ? JSON.parse(saved) : null
    })

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('ritmo-dark-mode')
        return saved ? JSON.parse(saved) : false
    })

    const userName = user?.nombre?.split(' ')[0] || 'Amigo'

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return `¡Buenos días, ${userName}! ☀️`
        if (hour < 18) return `¡Buenas tardes, ${userName}! 👋`
        return `¡Buenas noches, ${userName}! 🌙`
    }

    const getGreetingEmoji = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "🌞"
        if (hour < 18) return "🌿"
        return "🌙"
    }

    const getWelcomeMessage = () => {
        const messages = [
            "Su bienestar es lo más importante. ¿Cómo se encuentra hoy? 🌿",
            "Un día más para cuidarse y disfrutar de lo que le gusta 💜",
            "La sabiduría que tiene usted vale más que cualquier cosa ✨",
            "Hoy también es un buen día para algo pequeño y especial 🌸",
            "Su experiencia llena de vida cada rincón de este espacio 🌟",
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

                    {/* Banner perfil adulto mayor */}
                    <div className="profile-banner" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' }}>
                        <span className="profile-banner-emoji">🌿</span>
                        <div>
                            <strong>Modo Adulto Mayor</strong>
                            <p>Bienestar, motivación y entretenimiento pensado para usted</p>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="grid-left">
                            <AlertButton />
                            <RutinaDiaria />
                            <EjerciciosSuaves />
                            <WeekMoodChart />
                            <DailyChallenge />
                        </div>

                        <div className="grid-right">
                            <AgendaSimplificada />
                            <HabitsToday />
                            <CognitivePuzzle />
                            <QuickTip />
                            <ChatPreview />
                        </div>
                    </div>
                </main>
            </div>
        </ThemeContext.Provider>
    )
}
