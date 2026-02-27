import { motion } from 'framer-motion'
import { FiLinkedin } from 'react-icons/fi'

const members = [
  {
    name: 'Sofía Valencia',
    image: '/image/sofia.png',
    linkedin: 'https://www.linkedin.com/in/sofia-valencia-solano-66022a345/',
  },
  {
    name: 'Karly Velásquez',
    image: '/image/karly.png',
    linkedin: 'https://www.linkedin.com/in/karly-velasquez-acosta-a33065372/',
  },
  {
    name: 'Mariana Cruz',
    image: '/image/mariana.png',
    linkedin: 'https://www.linkedin.com/in/mariana-cruz-53a8531b0/',
  },
  {
    name: 'María José Ramírez',
    image: '/image/Mariajose.png',
    linkedin: 'https://www.linkedin.com/in/maria-jose-ramirez-montero-8b45052b3/',
  },
]

export default function Team() {
  return (
    <section className="section team" id="team">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Equipo detrás</h2>
        <p className="section-desc">
          Las personas que hacen posible RITMO
        </p>
      </motion.div>

      <div className="team-grid">
        {members.map((member, i) => (
          <motion.a
            key={member.name}
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="team-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
          >
            <div className="team-avatar-wrapper">
              <div className="team-avatar">
                <img src={member.image} alt={member.name} />
              </div>
            </div>
            <h3 className="team-name">{member.name}</h3>
            <span className="team-linkedin">
              <FiLinkedin /> LinkedIn
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
