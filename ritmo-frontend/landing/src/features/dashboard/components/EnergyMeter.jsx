import { Battery, Zap, TrendingUp, Coffee, Moon, Sun, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import './EnergyMeter.css'

export default function EnergyMeter({ isPreview = false }) {
  const [currentEnergy, setCurrentEnergy] = useState(75)
  const [energyHistory, setEnergyHistory] = useState([
    { time: '08:00', level: 85, activity: 'morning routine' },
    { time: '10:00', level: 92, activity: 'deep work' },
    { time: '12:00', level: 78, activity: 'meetings' },
    { time: '14:00', level: 65, activity: 'lunch break' },
    { time: '16:00', level: 75, activity: 'current' }
  ])

  const [energyTips, setEnergyTips] = useState([
    { icon: Coffee, text: 'Considera tomar un café o té', priority: 'medium' },
    { icon: Activity, text: '5 min de ejercicio ligero', priority: 'high' },
    { icon: Sun, text: 'Sal a tomar aire fresco', priority: 'low' }
  ])

  const getEnergyColor = (level) => {
    if (level >= 80) return '#10b981'
    if (level >= 60) return '#f59e0b'
    if (level >= 40) return '#f97316'
    return '#ef4444'
  }

  const getEnergyStatus = (level) => {
    if (level >= 80) return { text: 'Óptima', emoji: '🚀' }
    if (level >= 60) return { text: 'Buena', emoji: '⚡' }
    if (level >= 40) return { text: 'Moderada', emoji: '🔋' }
    return { text: 'Baja', emoji: '🪫' }
  }

  const updateEnergy = (newLevel) => {
    setCurrentEnergy(newLevel)
    // Añadir a historial
    const now = new Date()
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    setEnergyHistory(prev => [...prev.slice(-4), {
      time: timeString,
      level: newLevel,
      activity: 'manual update'
    }])
  }

  const energyStatus = getEnergyStatus(currentEnergy)

  if (isPreview) {
    return (
      <motion.div 
        className="energy-meter-preview professional-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="card-header">
          <div className="card-title">
            <Battery size={20} />
            <h3>Nivel de Energía</h3>
          </div>
          <span className="energy-badge" style={{ color: getEnergyColor(currentEnergy) }}>
            {energyStatus.emoji} {energyStatus.text}
          </span>
        </div>

        <div className="energy-gauge-preview">
          <div className="gauge-container">
            <svg width="120" height="60" viewBox="0 0 120 60">
              <path
                d="M 20 50 A 40 40 0 0 1 100 50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <motion.path
                d="M 20 50 A 40 40 0 0 1 100 50"
                stroke={getEnergyColor(currentEnergy)}
                strokeWidth="8"
                fill="none"
                strokeDasharray={126}
                strokeDashoffset={126 - (126 * currentEnergy) / 100}
                initial={{ strokeDashoffset: 126 }}
                animate={{ strokeDashoffset: 126 - (126 * currentEnergy) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="gauge-center">
              <span className="energy-value">{currentEnergy}%</span>
            </div>
          </div>
        </div>

        <div className="energy-trend">
          <TrendingUp size={14} />
          <span>+5% vs. ayer</span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="energy-meter-container">
      <motion.div 
        className="energy-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div className="title-section">
            <Zap size={32} />
            <div>
              <h1>Gestión de Energía</h1>
              <p>Tu energía es tu recurso más valioso. Gestionémosla sabiamente.</p>
            </div>
          </div>
          
          <div className="current-status">
            <div className="status-display">
              <span className="status-emoji">{energyStatus.emoji}</span>
              <div>
                <span className="status-text">{energyStatus.text}</span>
                <span className="energy-percentage">{currentEnergy}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="energy-dashboard">
        <motion.div 
          className="energy-gauge-section professional-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <h3>Nivel Actual</h3>
            <Battery size={20} />
          </div>

          <div className="main-gauge">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Energy level arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                stroke={getEnergyColor(currentEnergy)}
                strokeWidth="12"
                fill="none"
                strokeDasharray={502}
                strokeDashoffset={502 - (502 * currentEnergy) / 100}
                initial={{ strokeDashoffset: 502 }}
                animate={{ strokeDashoffset: 502 - (502 * currentEnergy) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="gauge-center-main">
              <span className="main-energy-value">{currentEnergy}%</span>
              <span className="energy-status-text">{energyStatus.text}</span>
            </div>
          </div>

          <div className="energy-controls">
            <button 
              className="energy-btn decrease"
              onClick={() => updateEnergy(Math.max(0, currentEnergy - 10))}
            >
              - Menos energía
            </button>
            <button 
              className="energy-btn increase"
              onClick={() => updateEnergy(Math.min(100, currentEnergy + 10))}
            >
              + Más energía
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="energy-history professional-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <h3>Historial de Hoy</h3>
            <TrendingUp size={20} />
          </div>

          <div className="history-chart">
            {energyHistory.map((entry, index) => (
              <motion.div
                key={index}
                className="history-point"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="time-label">{entry.time}</div>
                <div 
                  className="energy-bar"
                  style={{ 
                    height: `${entry.level}%`,
                    backgroundColor: getEnergyColor(entry.level)
                  }}
                />
                <div className="level-label">{entry.level}%</div>
              </motion.div>
            ))}
          </div>

          <div className="energy-insights">
            <div className="insight">
              <Sun size={16} />
              <span>Pico máximo: 10:00 AM (92%)</span>
            </div>
            <div className="insight">
              <Moon size={16} />
              <span>Valle mínimo: 14:00 PM (65%)</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="energy-recommendations professional-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <h3>Recomendaciones Inteligentes</h3>
            <Zap size={20} />
          </div>

          <div className="recommendations-list">
            {energyTips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <motion.div
                  key={index}
                  className={`recommendation ${tip.priority}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ x: 4 }}
                >
                  <div className="rec-icon">
                    <Icon size={18} />
                  </div>
                  <span className="rec-text">{tip.text}</span>
                  <button className="rec-action">Hecho</button>
                </motion.div>
              )
            })}
          </div>

          <div className="energy-patterns">
            <h4>Patrones Detectados</h4>
            <div className="pattern">
              <span className="pattern-icon">📈</span>
              <div className="pattern-info">
                <span className="pattern-title">Mejor momento para trabajo profundo</span>
                <span className="pattern-detail">9:00 - 11:00 AM</span>
              </div>
            </div>
            <div className="pattern">
              <span className="pattern-icon">⏰</span>
              <div className="pattern-info">
                <span className="pattern-title">Hora óptima para descanso</span>
                <span className="pattern-detail">2:00 - 2:30 PM</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}