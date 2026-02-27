import { Flame, Heart } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import Sidebar from '../../components/Sidebar'
import { ThemeContext } from '../../RootRouter'
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
import MoodSection from './components/MoodSection'
import ChatRitmo from './components/ChatRitmo'
import PlaylistsRitmo from './components/PlaylistsRitmo'
import ProgressRitmo from './components/ProgressRitmo'
import HabitsInteractive from './components/HabitsInteractive'
import { userData } from './mockData'
import './DashboardPage.css'

export default function DashboardInmigrante() {
    const { darkMode, toggleDark } = useContext(ThemeContext)
    const [activeSection, setActiveSection] = useState('inicio')
    const [user] = useState(() => {
        const saved = localStorage.getItem('ritmo_user')
        return saved ? JSON.parse(saved) : null
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

    const handleSectionChange = (sectionId) => {
        setActiveSection(sectionId)
    }

    const renderContent = () => {
        switch (activeSection) {
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
                return <div><h2>Ajustes - En desarrollo</h2></div>
            default:
                return (
                    <>
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
                    </>
                )
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar
                darkMode={darkMode}
                toggleDark={toggleDark}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
            />

            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    )
}
