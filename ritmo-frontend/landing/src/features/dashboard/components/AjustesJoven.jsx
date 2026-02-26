import { Settings, Bell, Eye, Palette, Volume2, Shield, User, Moon, Sun, Vibrate } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useContext } from 'react'
import { ThemeContext } from '../../../RootRouter'
import './AjustesJoven.css'

export default function AjustesJoven() {
  const { darkMode, toggleDark } = useContext(ThemeContext)
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      moodReminders: true,
      habitReminders: true,
      challenges: false,
      sounds: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      profileVisible: true
    },
    appearance: {
      animations: true,
      compactMode: false
    },
    accessibility: {
      largeText: false,
      highContrast: false,
      reducedMotion: false
    }
  })

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }))
  }

  const settingsSections = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      description: 'Configura cómo quieres que RITMO se comunique contigo',
      settings: [
        { key: 'push', label: 'Notificaciones push', description: 'Recibe recordatorios en tu móvil' },
        { key: 'moodReminders', label: 'Recordatorios de ánimo', description: 'Te preguntamos cómo te sientes' },
        { key: 'habitReminders', label: 'Recordatorios de hábitos', description: 'Impulsos suaves para tus rutinas' },
        { key: 'challenges', label: 'Desafíos diarios', description: 'Nuevas actividades cada día' },
        { key: 'sounds', label: 'Sonidos', description: 'Efectos de sonido en la app' }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: Shield,
      description: 'Tu información está segura. Tú decides qué compartir',
      settings: [
        { key: 'dataSharing', label: 'Compartir datos anónimos', description: 'Ayuda a mejorar RITMO para todos' },
        { key: 'analytics', label: 'Análisis de uso', description: 'Nos ayuda a personalizar tu experiencia' },
        { key: 'profileVisible', label: 'Perfil visible', description: 'Otros usuarios pueden ver tu progreso básico' }
      ]
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      description: 'Personaliza RITMO a tu gusto',
      settings: [
        { key: 'animations', label: 'Animaciones', description: 'Transiciones suaves y efectos visuales' },
        { key: 'compactMode', label: 'Modo compacto', description: 'Más información en menos espacio' }
      ]
    },
    {
      id: 'accessibility',
      title: 'Accesibilidad',
      icon: Eye,
      description: 'RITMO para todos, como debe ser',
      settings: [
        { key: 'largeText', label: 'Texto grande', description: 'Aumenta el tamaño de la fuente' },
        { key: 'highContrast', label: 'Alto contraste', description: 'Mejora la visibilidad del texto' },
        { key: 'reducedMotion', label: 'Movimiento reducido', description: 'Menos animaciones y transiciones' }
      ]
    }
  ]

  return (
    <div className="ajustes-joven-container">
      <motion.div 
        className="ajustes-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="title-section">
            <motion.div 
              className="settings-icon-wrapper"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Settings size={32} />
            </motion.div>
            <div>
              <h1>Ajustes</h1>
              <p>Personaliza RITMO para que se adapte perfectamente a ti</p>
            </div>
          </div>

          <motion.div 
            className="theme-toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={toggleDark}
              className={`theme-btn ${darkMode ? 'dark' : 'light'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              {darkMode ? 'Modo claro' : 'Modo oscuro'}
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="settings-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {settingsSections.map((section, index) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.id}
              className="settings-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <div className="section-header">
                <div className="section-title">
                  <Icon size={24} />
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="settings-list">
                {section.settings.map((setting) => (
                  <motion.div
                    key={setting.key}
                    className="setting-item"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="setting-info">
                      <span className="setting-label">{setting.label}</span>
                      <span className="setting-description">{setting.description}</span>
                    </div>
                    <button
                      className={`toggle-btn ${settings[section.id][setting.key] ? 'active' : ''}`}
                      onClick={() => handleToggle(section.id, setting.key)}
                    >
                      <div className="toggle-thumb"></div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div 
        className="ajustes-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="footer-info">
          <User size={16} />
          <span>Tus ajustes se guardan automáticamente</span>
        </div>
        <div className="version-info">
          <span>RITMO v1.0.0 - Perfil Joven</span>
        </div>
      </motion.div>
    </div>
  )
}