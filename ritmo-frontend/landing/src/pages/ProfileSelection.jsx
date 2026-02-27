import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import { FiStar, FiBriefcase, FiGlobe, FiHeart, FiEye, FiLogOut } from 'react-icons/fi'
import { ThemeContext } from '../RootRouter'
import './ProfileSelection.css'

const profiles = [
  {
    id: 'joven',
    title: 'Joven',
    subtitle: '15-25 años',
    description: 'Tu espacio seguro para crecer y sentirte acompañado',
    color: '#8AAF8B',
    gradient: 'linear-gradient(135deg, #8AAF8B 0%, #a8c8a9 100%)',
    available: true,
    icon: FiStar,
    route: '/dashboard'
  },
  {
    id: 'migrante',
    title: 'Inmigrante',
    subtitle: 'Adaptación cultural',
    description: 'Apoyo emocional y guía práctica para tu nueva vida',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    available: true,
    icon: FiGlobe,
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
    icon: FiBriefcase,
    route: '/dashboard/adulto-activo'
  },
  {
    id: 'mayor_70',
    title: 'Adulto Mayor',
    subtitle: 'Bienestar senior',
    description: 'Cuidado, motivación y entretenimiento para cada día',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
    available: true,
    icon: FiHeart,
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
    icon: FiEye,
    route: '/dashboard/visual'
  }
]

export default function ProfileSelection() {
  const navigate = useNavigate()
  const { darkMode } = useContext(ThemeContext)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (!user) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  const handleProfileSelect = (profile) => {
    if (profile.available) {
      // Save selected profile to session
      const updatedUser = { ...user, selected_profile: profile.id }
      localStorage.setItem('ritmo_user', JSON.stringify(updatedUser))
      navigate(profile.route)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ritmo_user')
    navigate('/login')
  }

  const userName = user?.nombre?.split(' ')[0] || 'Amigo'
  const userEtapa = user?.etapa_vida || ''

  // Generar saludos más naturales y cercanos
  const getWelcomeMessage = () => {
    const messages = [
      `Hola ${userName}, qué bueno tenerte aquí`,
      `¡${userName}! Te estaba esperando`,
      `Bienvenido/a, ${userName}`,
      `Hola ${userName}, empecemos juntos`,
      `Me da mucha alegría verte, ${userName}`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getDescriptionMessage = () => {
    if (userEtapa) {
      const profileName = profiles.find(p => p.id === userEtapa)?.title || userEtapa.replace('_', ' ')
      return `Basándonos en nuestra conversación, creemos que el perfil "${profileName}" podría ser perfecto para ti. Pero puedes elegir el que más te guste`
    }
    return 'Elige el perfil que más se parezca a ti para comenzar esta experiencia personalizada'
  }

  return (
    <>
      <div className="simple-header">
        <motion.button
          className="logout-btn"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiLogOut />
          Cerrar sesión
        </motion.button>
      </div>
      
      <div className="profile-selection-page">
        <div className="profile-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <motion.div
          className="profile-selection-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="selection-header">
            <motion.img
              src="/image/3.png"
              alt="RITMO"
              className="ritmo-logo-selection"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {getWelcomeMessage()}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {getDescriptionMessage()}
            </motion.p>
          </div>

          <motion.div
            className="profiles-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {profiles.map((profile, index) => {
              const isRecommended = profile.id === userEtapa
              const IconComponent = profile.icon

              return (
                <motion.div
                  key={profile.id}
                  className={`profile-card ${isRecommended ? 'recommended' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  onClick={() => handleProfileSelect(profile)}
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isRecommended && (
                    <motion.div
                      className="recommended-badge"
                      style={{ backgroundColor: profile.color }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      🎆 Este es el mejor para ti
                    </motion.div>
                  )}

                  <div className="profile-card-inner">
                    <motion.div
                      className="profile-icon"
                      style={{ background: profile.gradient }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent size={32} color="white" />
                    </motion.div>

                    <h3>{profile.title}</h3>
                    <span className="profile-subtitle">{profile.subtitle}</span>
                    <p className="profile-description">{profile.description}</p>

                    <motion.div
                      className="profile-action"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>{isRecommended ? 'Usar este perfil' : 'Seleccionar'}</span>
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>

                  <div
                    className="profile-card-glow"
                    style={{ background: profile.gradient, opacity: isRecommended ? 0.2 : 0.1 }}
                  />
                </motion.div>
              )
            })}
          </motion.div>

          <motion.p
            className="info-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Shield size={16} />
            Tu información está protegida y es confidencial
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}
