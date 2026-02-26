import { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { ThemeContext } from '../RootRouter'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { darkMode, toggleDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileOpen(false)
    
    // Si no estamos en la página principal, navegar primero
    if (location.pathname !== '/') {
      navigate('/')
      // Esperar un poco para que se cargue la página y luego hacer scroll
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      // Si ya estamos en la página principal, hacer scroll directamente
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogoClick = () => {
    setMobileOpen(false)
    if (location.pathname === '/') {
      // Si ya estamos en la página principal, hacer scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Si estamos en otra página, navegar a la principal
      navigate('/')
    }
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <img src="/image/2.png" alt="RITMO" />
          <span>RITMO</span>
        </div>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <a onClick={() => scrollTo('features')}>Características</a>
          <a onClick={() => scrollTo('profiles')}>Perfiles</a>
          <a onClick={() => scrollTo('cta')}>Contacto</a>
          <button className="dark-toggle" onClick={() => {
            setMobileOpen(false)
            toggleDark()
          }} aria-label="Cambiar tema">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button className="btn-login" onClick={() => {
            setMobileOpen(false)
            navigate('/login')
          }}>
            Acceso
          </button>
        </div>

        <button
          className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </motion.nav>
  )
}
