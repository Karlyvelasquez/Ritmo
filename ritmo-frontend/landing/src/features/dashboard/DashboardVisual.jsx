import { Flame, Heart } from 'lucide-react'
import { useState, useEffect, createContext } from 'react'
import Sidebar from '../../components/Sidebar'
import WeekMoodChart from './components/WeekMoodChart'
import HabitsToday from './components/HabitsToday'
import ChatPreview from './components/ChatPreview'
import DailyChallenge from './components/DailyChallenge'
import QuoteOfDay from './components/QuoteOfDay'
import QuickTip from './components/QuickTip'
import Recommendations from './components/Recommendations'
import { userData } from './mockData'
import './DashboardPage.css'
import './DashboardVisual.css'

export const ThemeContext = createContext()

export default function DashboardVisual() {
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
        if (hour < 12) return "👋"
        if (hour < 18) return "✌️"
        return "🌙"
    }

    const getWelcomeMessage = () => {
        const messages = [
            "Este es tu espacio, pensado para ti y para tu comodidad 💙",
            "Cada función aquí está adaptada para facilitar tu día ✨",
            "Tu autonomía es nuestra prioridad. Estamos aquí para ti 💙",
            "Diseñado para que todo sea claro y fácil de usar 👁️",
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
            <div className="dashboard-layout dashboard-visual-mode">
                <Sidebar darkMode={darkMode} toggleDark={toggleDark} />

                <main className="dashboard-content">
                    <div className="dashboard-header">
                        <div className="greeting">
                            <h1>{getGreeting()} <span className="wave">{getGreetingEmoji()}</span></h1>
                            <p>{getWelcomeMessage()}</p>
                        </div>

                        <div className="streak-badges">
                            <div className="streak-badge fire">
                                <Flame size={24} />
                                <span><strong>{userData.streak}</strong> días juntos</span>
                            </div>
                            <div className="streak-badge heart">
                                <Heart size={24} />
                                <span><strong>{userData.bestStreak}</strong> días mejor racha</span>
                            </div>
                        </div>
                    </div>

                    {/* Banner perfil discapacidad visual */}
                    <div className="profile-banner" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)' }}>
                        <span className="profile-banner-emoji">👁️</span>
                        <div>
                            <strong>Modo Accesibilidad Visual</strong>
                            <p>Interfaz de alto contraste, tipografía grande y botones amplios</p>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="grid-left">
                            <QuoteOfDay />
                            <WeekMoodChart />
                            <DailyChallenge />
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
