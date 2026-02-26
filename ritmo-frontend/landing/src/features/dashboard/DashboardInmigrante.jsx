import { Flame, Heart } from 'lucide-react'
import { useState, useEffect, createContext } from 'react'
import Sidebar from '../../components/Sidebar'
import WeekMoodChart from './components/WeekMoodChart'
import HabitsToday from './components/HabitsToday'
import ChatPreview from './components/ChatPreview'
import DailyChallenge from './components/DailyChallenge'
import QuoteOfDay from './components/QuoteOfDay'
import QuickTip from './components/QuickTip'
import CulturalTips from './components/CulturalTips'
import CountryGuide from './components/CountryGuide'
import FrasesUtiles from './components/FrasesUtiles'
import ChecklistAdaptacion from './components/ChecklistAdaptacion'
import CalendarioCultural from './components/CalendarioCultural'
import { userData } from './mockData'
import './DashboardPage.css'

export const ThemeContext = createContext()

export default function DashboardInmigrante() {
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
        if (hour < 6) return "¿Aún despierto/a?"
        if (hour < 12) return `¡Buenos días, ${userName}! ☀️`
        if (hour < 18) return `¡Buenas tardes, ${userName}! 👋`
        return `¡Buenas noches, ${userName}! 🌙`
    }

    const getGreetingEmoji = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "🌅"
        if (hour < 18) return "🌍"
        return "🌙"
    }

    const getWelcomeMessage = () => {
        const messages = [
            "Adapatarse toma tiempo, y está bien. Estoy aquí contigo 🌍",
            "Cada día es un nuevo paso en tu nueva vida 💛",
            "Tu valentía de empezar de nuevo es admirable ✨",
            "Estás construyendo algo increíble, poco a poco 🌱",
            "No estás solo/a en este camino 💛",
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

                    {/* Banner perfil inmigrante */}
                    <div className="profile-banner" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}>
                        <span className="profile-banner-emoji">🌍</span>
                        <div>
                            <strong>Modo Inmigrante</strong>
                            <p>Apoyo emocional + guía para tu adaptación en España</p>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="grid-left">
                            <FrasesUtiles />
                            <ChecklistAdaptacion />
                            <QuoteOfDay />
                            <WeekMoodChart />
                            <DailyChallenge />
                            <CulturalTips />
                        </div>

                        <div className="grid-right">
                            <CalendarioCultural />
                            <HabitsToday />
                            <QuickTip />
                            <CountryGuide />
                            <ChatPreview />
                        </div>
                    </div>
                </main>
            </div>
        </ThemeContext.Provider>
    )
}
