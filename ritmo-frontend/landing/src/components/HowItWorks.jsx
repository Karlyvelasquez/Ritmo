import { motion } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Observa sin invadir',
    desc: '¿A qué hora entras? ¿Con qué frecuencia vuelves? ¿Cuánto tardas en responder? RITMO capta señales sutiles de comportamiento desde el navegador, sin instalar nada.',
  },
  {
    num: '02',
    title: 'Entiende tu contexto',
    desc: 'Un sistema de agentes inteligentes analiza patrones, evalúa tu estado y predice niveles de riesgo. Todo en tiempo real, adaptándose a tu etapa de vida.',
  },
  {
    num: '03',
    title: 'Decide la acción más humana',
    desc: '¿Hablo? ¿Cómo hablo? ¿Cuánto hablo? ¿O me quedo en silencio? El orquestador central decide la respuesta más empática y apropiada para ti.',
  },
  {
    num: '04',
    title: 'Se adapta a quien eres',
    desc: 'Persona mayor, joven, adulto activo, migrante o persona con discapacidad visual. RITMO ajusta su tono, ritmo y canal de comunicación a tu realidad.',
  },
]

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' },
  }),
}

export default function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Cómo funciona</span>
        <h2 className="section-title">
          Inteligencia que escucha antes de hablar
        </h2>
        <p className="section-desc">
          RITMO se conecta con tu vida real sin necesitar acceso al sistema
          operativo. Desde el propio navegador percibe cómo estás.
        </p>
      </motion.div>

      <div className="steps-container">
        <div className="steps-line" />
        {steps.map((step, i) => (
          <motion.div
            className="step-item"
            key={i}
            custom={i}
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              className="step-number"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {step.num}
            </motion.div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
