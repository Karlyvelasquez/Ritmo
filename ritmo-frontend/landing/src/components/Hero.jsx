import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiHeart, FiCpu, FiShield } from 'react-icons/fi'

export default function Hero() {
  const navigate = useNavigate()
  
  return (
    <section className="hero" id="hero">

      <div className="hero-content">
        {/* Text side */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="hero-badge-dot" />
            OdiseIA4Good 2026
          </motion.div>

          <h1 className="hero-title">
            Una IA que te{' '}
            <span className="highlight">acompaña</span>
            <br />
            No te juzga. Solo está.
          </h1>

          <p className="hero-subtitle">
            RITMO observa cómo estás, entiende tu contexto y decide la acción
            más humana posible: hablar, preguntar, sugerir, o simplemente
            quedarse en silencio.
          </p>

          <div className="hero-actions">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
            >
              Comenzar ahora
              <span>→</span>
            </motion.button>
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Saber más
            </motion.button>
          </div>
        </motion.div>

        {/* Visual side */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="hero-visual-container">
            <motion.div
              className="hero-orbit-ring hero-orbit-ring-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="hero-orbit-ring hero-orbit-ring-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
              className="hero-main-circle"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/image/3.png" alt="RITMO Logo" />
            </motion.div>

            {/* Floating cards with icons */}
            <motion.div
              className="hero-floating-card card-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div className="card-icon green"><FiHeart /></div>
                Acompañamiento
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-floating-card card-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div className="card-icon blue"><FiCpu /></div>
                Memoria continua
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-floating-card card-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <motion.div
                animate={{ y: [-2, 4, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div className="card-icon warm"><FiShield /></div>
                Privacidad
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
