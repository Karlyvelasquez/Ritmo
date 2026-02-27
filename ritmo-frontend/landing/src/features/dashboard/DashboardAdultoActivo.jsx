import { Briefcase, Target, Clock, Battery, TrendingUp, Brain, Heart, Zap, Users, ArrowRight } from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../../components/Sidebar'
import { ThemeContext } from '../../RootRouter'
import ProductivityHub from './components/ProductivityHub'
import EnergyMeter from './components/EnergyMeter'
import WorkLifeBalance from './components/WorkLifeBalance'
import PerformanceTracker from './components/PerformanceTracker'
import SmartGoals from './components/SmartGoals'
import StressManager from './components/StressManager'
import TimeBlocker from './components/TimeBlocker'
import ChatRitmo from './components/ChatRitmo'
import ProgressRitmo from './components/ProgressRitmo'
import './DashboardAdultoActivo.css'

export default function DashboardAdultoActivo() {
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

  const userName = user?.nombre?.split(' ')[0] || 'Profesional'

  // Saludos profesionales pero cálidos
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Madrugada productiva"
    if (hour < 9) return `Buenos días, ${userName}`
    if (hour < 12) return `Que tengas una mañana eficiente, ${userName}`
    if (hour < 14) return `¿Cómo va tu día, ${userName}?`
    if (hour < 18) return `Buena tarde, ${userName}`
    if (hour < 21) return `Cerrando el día fuerte, ${userName}`
    return "Tiempo de desconectar"
  }

  const getWelcomeMessage = () => {
    const messages = [
      "Tu productividad no define tu valor, pero puede potenciar tus sueños.",
      "Cada día es una oportunidad para optimizar tu impacto.",
      "El equilibrio no es perfección, es priorización inteligente.",
      "Tu energía es tu recurso más valioso. ¿Cómo la invertirás hoy?",
      "El éxito sostenible se construye con micro-hábitos consistentes.",
      "No se trata de hacer más, sino de hacer lo que importa mejor."
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
  }

  // Estadísticas dinámicas del día
  const getTodayStats = () => {
    const today = new Date()
    return {
      tasksCompleted: Math.floor(Math.random() * 8) + 2,
      energyLevel: Math.floor(Math.random() * 30) + 70,
      focusTime: Math.floor(Math.random() * 4) + 3,
      stressLevel: Math.floor(Math.random() * 40) + 20,
      workLifeBalance: Math.floor(Math.random() * 30) + 70
    }
  }

  const stats = getTodayStats()

  // Componentes del dashboard profesional
  const components = [
    {
      id: 'productivity',
      title: 'Centro de Productividad',
      description: 'Gestiona tareas, Pomodoro y reuniones',
      icon: Briefcase,
      section: 'productividad',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      performance: 85,
      actionText: 'Ver tareas pendientes'
    },
    {
      id: 'energy',
      title: 'Medidor de Energía',
      description: 'Optimiza tu rendimiento diario',
      icon: Battery,
      section: 'energia',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      performance: 78,
      actionText: 'Revisar niveles'
    },
    {
      id: 'goals',
      title: 'Objetivos SMART',
      description: 'Planifica y alcanza tus metas',
      icon: Target,
      section: 'objetivos',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      performance: 92,
      actionText: 'Actualizar progreso'
    },
    {
      id: 'balance',
      title: 'Equilibrio Vida-Trabajo',
      description: 'Mantén un balance saludable',
      icon: Heart,
      section: 'balance',
      gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
      performance: 67,
      actionText: 'Mejorar balance'
    },
    {
      id: 'performance',
      title: 'Análisis de Rendimiento',
      description: 'Insights y métricas profesionales',
      icon: TrendingUp,
      section: 'rendimiento',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      performance: 88,
      actionText: 'Ver analytics'
    },
    {
      id: 'stress',
      title: 'Gestión del Estrés',
      description: 'Técnicas y monitoreo avanzado',
      icon: Brain,
      section: 'estres',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      performance: 74,
      actionText: 'Reducir estrés'
    },
    {
      id: 'time',
      title: 'Bloques de Tiempo',
      description: 'Planificación avanzada del día',
      icon: Clock,
      section: 'tiempo',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      performance: 81,
      actionText: 'Optimizar horario'
    }
  ]

  const renderContent = () => {
    switch(activeSection) {
      case 'productividad':
        return <ProductivityHub />
      case 'objetivos':
        return <SmartGoals />
      case 'energia':
        return <EnergyMeter />
      case 'balance':
        return <WorkLifeBalance />
      case 'rendimiento':
        return <PerformanceTracker />
      case 'estres':
        return <StressManager />
      case 'tiempo':
        return <TimeBlocker />
      case 'chat':
        return <ChatRitmo />
      case 'progreso':
        return <ProgressRitmo />
      default:
        return (
          <>
            <motion.div 
              className="dashboard-overview professional-overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header Section */}
              <motion.div 
                className="overview-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="welcome-section">
                  <h1 className="welcome-title">{getGreeting()}</h1>
                  <p className="welcome-subtitle">{getWelcomeMessage()}</p>
                </div>
                
                <div className="daily-metrics">
                  <div className="metric-card energy">
                    <div className="metric-icon">
                      <Zap size={24} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{stats.energyLevel}%</span>
                      <span className="metric-label">Energía</span>
                    </div>
                  </div>
                  
                  <div className="metric-card productivity">
                    <div className="metric-icon">
                      <Target size={24} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{stats.tasksCompleted}</span>
                      <span className="metric-label">Tareas</span>
                    </div>
                  </div>
                  
                  <div className="metric-card focus">
                    <div className="metric-icon">
                      <Brain size={24} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{stats.focusTime}h</span>
                      <span className="metric-label">Focus</span>
                    </div>
                  </div>
                  
                  <div className="metric-card balance">
                    <div className="metric-icon">
                      <Heart size={24} />
                    </div>
                    <div className="metric-info">
                      <span className="metric-value">{stats.workLifeBalance}%</span>
                      <span className="metric-label">Balance</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions Grid */}
              <motion.div 
                className="quick-actions-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {components.map((component, index) => (
                  <motion.div
                    key={component.id}
                    className="action-card modern-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={() => handleSectionChange(component.section)}
                  >
                    <div className="card-background" style={{ background: component.gradient }} />
                    
                    <div className="card-content">
                      <div className="card-header-section">
                        <div className="icon-wrapper">
                          <component.icon size={28} />
                        </div>
                        <ArrowRight size={20} className="navigate-icon" />
                      </div>
                      
                      <div className="card-body">
                        <h3 className="card-title">{component.title}</h3>
                        <p className="card-description">{component.description}</p>
                      </div>
                      
                      <div className="card-footer">
                        <div className="progress-section">
                          <div className="progress-info">
                            <span className="progress-label">Progreso</span>
                            <span className="progress-value">{component.performance}%</span>
                          </div>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill"
                              style={{ 
                                width: `${component.performance}%`,
                                background: component.gradient
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="action-hint">
                          <span>{component.actionText}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Insights Section */}
              <motion.div 
                className="insights-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="insights-header">
                  <TrendingUp size={24} />
                  <h2>Insights Diarios</h2>
                </div>
                
                <div className="insights-grid">
                  <div className="insight-item peak-performance">
                    <div className="insight-icon">
                      <Zap size={20} />
                    </div>
                    <div className="insight-content">
                      <h4>Pico de Productividad</h4>
                      <p>Tu mejor momento es entre 10:00-12:00</p>
                    </div>
                  </div>
                  
                  <div className="insight-item stress-level">
                    <div className="insight-icon">
                      <Brain size={20} />
                    </div>
                    <div className="insight-content">
                      <h4>Nivel de Estrés</h4>
                      <p>Bajo - Mantén el equilibrio actual</p>
                    </div>
                  </div>
                  
                  <div className="insight-item recommendation">
                    <div className="insight-icon">
                      <Target size={20} />
                    </div>
                    <div className="insight-content">
                      <h4>Recomendación</h4>
                      <p>Toma un descanso cada 90 minutos</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )
    }
  }

  return (
    <div className="dashboard-layout active-professional-edition">
      <Sidebar 
        darkMode={darkMode} 
        toggleDark={toggleDark} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        profileType="adulto_activo"
      />
      
      <div className="dashboard-background professional-theme">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  )
}