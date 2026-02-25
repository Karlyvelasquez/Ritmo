import { useState, useEffect, createContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Stethoscope, Shield, ArrowRight } from 'lucide-react'
import './ProfileSelection.css'

export const ThemeContext = createContext()

const profiles = [
  {
    id: 'joven',
    title: 'Joven',
    subtitle: '15-25 años',
    description: 'Tu espacio seguro para crecer y sentirte acompañado',
    icon: Sparkles,
    color: '#8AAF8B',
    gradient: 'linear-gradient(135deg, #8AAF8B 0%, #a8c8a9 100%)',
    available: true,
    emoji: '✨'
  },
  {
    id: 'padre',
    title: 'Padre/Madre',
    subtitle: 'Apoyo familiar',
    description: 'Herramientas para acompañar a tu hijo/a en su bienestar',
    icon: Heart,
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    available: false,
    emoji: '💜'
  },
  {
    id: 'profesional',
    title: 'Profesional',
    subtitle: 'Salud mental',
    description: 'Panel profesional para seguimiento y análisis',
    icon: Stethoscope,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    available: false,
    emoji: '🩺'
  }
]

export default function ProfileSelection() {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ritmo-dark-mode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleProfileSelect = (profile) => {
    if (profile.id === 'joven') {
      navigate('/dashboard')
    }
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className="profile-selection-page">
        <motion.div 
          className="profile-selection-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button className="back-home" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>

          <div className="selection-header">
            <motion.img 
              src="/image/2.png" 
              alt="RITMO" 
              className="ritmo-logo-selection"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <h1>¿Quién eres? 👋</h1>
            <p>Selecciona tu perfil para continuar</p>
          </div>

          <div className="profiles-grid">
            {profiles.map((profile, index) => {
              const Icon = profile.icon
              return (
                <motion.div
                  key={profile.id}
                  className={`profile-card ${!profile.available ? 'disabled' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleProfileSelect(profile)}
                  style={{
                    transform: `rotate(${index === 0 ? '-2deg' : index === 1 ? '1deg' : '-1deg'})`
                  }}
                  whileHover={profile.available ? { 
                    scale: 1.05, 
                    rotate: 0,
                    y: -10 
                  } : {}}
                >
                  {!profile.available && (
                    <div className="coming-soon-badge">
                      Próximamente 🚀
                    </div>
                  )}

                  <div className="profile-card-inner">
                    <div 
                      className="profile-icon"
                      style={{ background: profile.gradient }}
                    >
                      <span className="profile-emoji">{profile.emoji}</span>
                    </div>

                    <h3>{profile.title}</h3>
                    <span className="profile-subtitle">{profile.subtitle}</span>
                    <p className="profile-description">{profile.description}</p>

                    {profile.available && (
                      <div className="profile-action">
                        <span>Entrar</span>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </div>

                  <div 
                    className="profile-card-glow"
                    style={{ background: profile.gradient, opacity: 0.1 }}
                  />
                </motion.div>
              )
            })}
          </div>

          <p className="info-text">
            <Shield size={16} />
            Tu información está protegida y es confidencial
          </p>
        </motion.div>
      </div>
    </ThemeContext.Provider>
  )
}
