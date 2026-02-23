import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { ThemeContext } from '../App'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { darkMode, toggleDark } = useContext(ThemeContext)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/image/2.png" alt="RITMO" />
          <span>RITMO</span>
        </div>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <a onClick={() => scrollTo('features')}>Características</a>
          <a onClick={() => scrollTo('profiles')}>Perfiles</a>
          <a onClick={() => scrollTo('cta')}>Contacto</a>
          <button className="dark-toggle" onClick={toggleDark} aria-label="Cambiar tema">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button className="btn-login" onClick={() => window.location.href = '/login'}>
            Iniciar sesión
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
