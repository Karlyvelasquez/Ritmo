import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="section cta" id="cta">
      <motion.div
        className="cta-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <img src="/image/3.png" alt="RITMO" className="cta-logo" />

        <h2 className="cta-title">
          ¿Listo para un acompañamiento diferente?
        </h2>

        <p className="cta-desc">
          No necesitas instalar nada. No necesitas explicar nada.
          Solo entra, y RITMO se encarga del resto.
        </p>

        <div className="cta-buttons">
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
            <span>→</span>
          </motion.button>
          <motion.button
            className="btn-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Volver arriba
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
