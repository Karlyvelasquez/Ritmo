import { motion } from 'framer-motion'

const features = [
  {
    color: 'sage',
    title: 'Acompañamiento proactivo',
    desc: 'RITMO no espera a que le escribas. Si detecta señales de aislamiento o malestar, es él quien abre la conversación.',
  },
  {
    color: 'navy',
    title: 'El silencio como feature',
    desc: 'A veces la respuesta correcta es no decir nada. RITMO sabe cuándo ese día no hace falta hablar.',
  },
  {
    color: 'warm',
    title: 'Memoria continua',
    desc: 'Recuerda lo que importa entre sesiones. Si ayer mencionaste algo, hoy pregunta cómo te fue.',
  },
  {
    color: 'sage',
    title: 'Bot de Telegram',
    desc: 'Habla con RITMO como si fuera un amigo. La IA reconoce quién eres y continúa donde lo dejaron.',
  },
  {
    color: 'navy',
    title: 'Panel para investigadores',
    desc: 'Tendencias agregadas y anonimizadas. Sin datos individuales. Solo conocimiento para actuar.',
  },
  {
    color: 'warm',
    title: 'Privacidad por diseño',
    desc: 'RITMO no vigila. No controla. Las señales que recoge son para entender, no para juzgar.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function Features() {
  return (
    <section className="section features" id="features">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Características</span>
        <h2 className="section-title">
          Diseñado para acompañar, no para controlar
        </h2>
        <p className="section-desc">
          Cada funcionalidad está pensada con un principio humano: respetar,
          entender y acompañar sin invadir.
        </p>
      </motion.div>

      <motion.div
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {features.map((f, i) => (
          <motion.div className="feature-card" key={i} variants={cardVariants}>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
