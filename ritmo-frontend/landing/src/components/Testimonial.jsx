import { motion } from 'framer-motion'

export default function Testimonial() {
  return (
    <section className="section testimonial">
      <video
        className="testimonial-video-bg"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video/video.mp4" type="video/mp4" />
      </video>
      <div className="testimonial-video-overlay" />

      <motion.div
        className="testimonial-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <motion.span
          className="testimonial-quote-mark"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.6, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          "
        </motion.span>

        <p className="testimonial-quote">
          La mayoría de apps de bienestar esperan que tú las alimentes.
          RITMO hace lo contrario: te observa, te entiende, y a veces decide
          que lo mejor que puede hacer es no decir nada.
        </p>

        <div className="testimonial-divider" />

        <p className="testimonial-author">
          — Filosofía RITMO
        </p>

        <img src="/image/2.png" alt="RITMO" className="testimonial-logo" />
      </motion.div>
    </section>
  )
}
