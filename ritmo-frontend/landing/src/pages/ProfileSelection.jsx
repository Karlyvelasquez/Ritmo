import { useState, useEffect, createContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import './ProfileSelection.css'

export const ThemeContext = createContext()

const profiles = [
  {
    id: 'joven',
    title: 'Joven',
    subtitle: '15-25 años',
    description: 'Tu espacio seguro para crecer y sentirte acompañado',
    color: '#8AAF8B',
    gradient: 'linear-gradient(135deg, #8AAF8B 0%, #a8c8a9 100%)',
    available: true,
    emoji: '✨',
    route: '/dashboard'
  },
  {
    id: 'inmigrante',
    title: 'Inmigrante',
    subtitle: 'Adaptación cultural',
    description: 'Apoyo emocional y guía práctica para tu nueva vida',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    available: true,
    emoji: '🌍',
    route: '/dashboard/inmigrante'
  },
  {
    id: 'adulto_activo',
    title: 'Adulto Activo',
    subtitle: 'Productividad y equilibrio',
    description: 'Recursos para gestionar tu día a día, trabajo y bienestar personal',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    available: true,
    emoji: '💼',
    route: '/dashboard'
  },
  {
    id: 'adulto_mayor',
    title: 'Adulto Mayor',
    subtitle: 'Bienestar senior',
    description: 'Cuidado, motivación y entretenimiento para cada día',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    available: true,
    emoji: '🌿',
    route: '/dashboard/adulto-mayor'
  },
  {
    id: 'discapacidad_visual',
    title: 'Baja Visión',
    subtitle: 'Accesibilidad visual',
    description: 'Interfaz accesible diseñada para tu comodidad y autonomía',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
    available: true,
    emoji: '👁️',
    route: '/dashboard/visual'
  }
]

export default function ProfileSelection() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ritmo-dark-mode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    if (!user) {
      navigate('/onboarding')
    }
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode, user, navigate])

  const handleProfileSelect = (profile) => {
    if (profile.available) {
      // Save selected profile to session
      const updatedUser = { ...user, selected_profile: profile.id }
      localStorage.setItem('ritmo_user', JSON.stringify(updatedUser))
      navigate(profile.route)
    }
  }

  const userName = user?.nombre?.split(' ')[0] || 'Amigo'
  const userEtapa = user?.etapa_vida || ''

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
            <h1>¡Hola {userName}! 👋</h1>
            <p>
              {userEtapa
                ? `Según nuestro asistente, tu perfil ideal es ${userEtapa.replace('_', ' ')}. ¿Es correcto?`
                : 'Selecciona tu perfil para continuar'}
            </p>
          </div>

          <div className="profiles-grid">
            {profiles.map((profile, index) => {
              const isRecommended = profile.id === userEtapa
              const rotations = ['-1deg', '1deg', '-1deg', '1deg', '-0.5deg']

              return (
                <motion.div
                  key={profile.id}
                  className={`profile-card ${isRecommended ? 'recommended' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleProfileSelect(profile)}
                  style={{
                    transform: `rotate(${rotations[index] || '0deg'})`,
                    border: isRecommended ? `2px solid ${profile.color}` : 'none'
                  }}
                  whileHover={{ scale: 1.05, rotate: 0, y: -10 }}
                >
                  {isRecommended && (
                    <div className="recommended-badge" style={{ backgroundColor: profile.color }}>
                      Recomendado para ti
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

                    <div className="profile-action">
                      <span>{isRecommended ? 'Usar este perfil' : 'Entrar'}</span>
                      <ArrowRight size={20} />
                    </div>
                  </div>

                  <div
                    className="profile-card-glow"
                    style={{ background: profile.gradient, opacity: isRecommended ? 0.2 : 0.1 }}
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
