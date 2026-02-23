import { motion } from 'framer-motion'
import { FiUser, FiBookOpen, FiBriefcase, FiGlobe, FiEye } from 'react-icons/fi'

const profiles = [
  {
    icon: <FiUser />,
    name: 'Persona mayor (+70)',
    desc: 'Frases cortas, ritmo lento, prioridad audio. Nunca la apresura. Acompaña sin exigir.',
  },
  {
    icon: <FiBookOpen />,
    name: 'Joven',
    desc: 'Cercano sin ser forzado. Valida antes de sugerir. Entiende la ansiedad que no se sabe nombrar.',
  },
  {
    icon: <FiBriefcase />,
    name: 'Adulto activo',
    desc: 'Reconoce el cansancio como válido. No añade presión. Tono directo y respetuoso.',
  },
  {
    icon: <FiGlobe />,
    name: 'Migrante o refugiado',
    desc: 'Entiende el desarraigo. Valida sin comparar. No asume red de apoyo cercana.',
  },
  {
    icon: <FiEye />,
    name: 'Discapacidad visual',
    desc: 'Todo por audio, sin referencias visuales. Pausas, claridad máxima, accesibilidad total.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function Profiles() {
  return (
    <section className="section profiles" id="profiles">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Adaptación</span>
        <h2 className="section-title">
          Se adapta a tu etapa de vida
        </h2>
        <p className="section-desc">
          RITMO no trata a todos igual. Entiende que cada persona vive una
          realidad diferente y ajusta cómo se comunica.
        </p>
      </motion.div>

      <div className="profiles-grid">
        {profiles.map((p, i) => (
          <motion.div
            className="profile-card"
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="profile-icon">{p.icon}</div>
            <div className="profile-info">
              <h4>{p.name}</h4>
              <p>{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
