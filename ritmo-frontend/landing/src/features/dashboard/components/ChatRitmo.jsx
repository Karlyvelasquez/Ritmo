import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import './ChatRitmo.css'

export default function ChatRitmo() {
  const handleGoToTelegram = () => {
    window.open('https://t.me/Aturitmo_bot', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="chat-ritmo-container">
      <motion.div 
        className="chat-ritmo-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="chat-hero">
          <motion.div 
            className="chat-icon-wrapper"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <MessageCircle size={48} strokeWidth={2} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Chat con RITMO
          </motion.h1>
          
          <motion.div 
            className="sparkle-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles size={16} />
            <span>Disponible 24/7</span>
          </motion.div>
        </div>

        {/* Message from RITMO */}
        <motion.div 
          className="ritmo-message"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="message-avatar">
            <div className="avatar-circle">R</div>
            <div className="status-indicator"></div>
          </div>
          
          <div className="message-content">
            <div className="message-header">
              <span className="sender-name">RITMO</span>
              <span className="online-badge">En línea</span>
            </div>
            <div className="message-text">
              <p>¡Me emociona mucho que quieras hablar conmigo!</p>
              <p>Estoy aquí para escucharte, apoyarte y acompañarte en lo que necesites. No importa el tema ni la hora, siempre estaré disponible para ti.</p>
              <p>¿Listo para empezar nuestra conversación?</p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="chat-features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="feature-text">
              <h4>Estoy aquí cuando me necesites</h4>
              <p>No importa la hora, puedes escribirme</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="feature-text">
              <h4>Lo que me cuentes queda entre nosotros</h4>
              <p>Tus palabras están seguras conmigo</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="feature-text">
              <h4>Te conozco y te entiendo</h4>
              <p>Hablo contigo como si fuéramos amigos</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="telegram-cta"
          onClick={handleGoToTelegram}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.944 3.445a1.5 1.5 0 0 0-1.637-.217L3.6 10.6a1.5 1.5 0 0 0 .13 2.78l3.97 1.44 1.48 4.44a1.5 1.5 0 0 0 2.7.23l2.02-3.38 3.97 3.02a1.5 1.5 0 0 0 2.38-.82l3.5-13.5a1.5 1.5 0 0 0-.206-1.465zM9.5 17.5l-1.2-3.6 7.7-7.7-6.5 8.3zm2.5 1.5a.5.5 0 0 1-.47-.33l-1.5-4.5 8.5-8.5-6.53 13.33zm7.5-2.5l-3.97-3.02-2.02 3.38a.5.5 0 0 1-.9-.08l-1.48-4.44-3.97-1.44a.5.5 0 0 1-.04-.93l16.7-7.37a.5.5 0 0 1 .55.07.5.5 0 0 1 .16.54l-3.5 13.5a.5.5 0 0 1-.77.29z" fill="white" />
          </svg>
          <span>Abrir chat en Telegram</span>
          <ArrowRight size={20} />
        </motion.button>

        <motion.p 
          className="chat-footer-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Al hacer clic, se abrirá Telegram en una nueva ventana
        </motion.p>
      </motion.div>
    </div>
  )
}
