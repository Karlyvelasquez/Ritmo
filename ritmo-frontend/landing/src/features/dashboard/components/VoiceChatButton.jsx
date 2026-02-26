import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMic, FiMicOff, FiMessageCircle } from 'react-icons/fi'
import './VoiceChatButton.css'

export default function VoiceChatButton() {
  const [isListening, setIsListening] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true) // Por ahora siempre disponible

  const handleVoiceChat = () => {
    if (isListening) {
      // Detener grabación
      setIsListening(false)
      // Aquí irá la lógica para detener la grabación
      console.log('Deteniendo grabación...')
    } else {
      // Iniciar grabación
      setIsListening(true)
      // Aquí irá la lógica para iniciar grabación
      console.log('Iniciando grabación...')
      
      // Simular que se detiene después de unos segundos (temporal)
      setTimeout(() => {
        setIsListening(false)
      }, 3000)
    }
  }

  return (
    <div className="voice-chat-container">
      <motion.button
        className={`voice-chat-button ${isListening ? 'listening' : ''} ${!isAvailable ? 'disabled' : ''}`}
        onClick={handleVoiceChat}
        disabled={!isAvailable}
        whileHover={isAvailable ? { scale: 1.05 } : {}}
        whileTap={isAvailable ? { scale: 0.95 } : {}}
        animate={isListening ? { 
          boxShadow: [
            '0 0 0 0 rgba(138, 175, 139, 0.4)',
            '0 0 0 15px rgba(138, 175, 139, 0)',
            '0 0 0 0 rgba(138, 175, 139, 0.4)'
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
      >
        <motion.div
          className="voice-icon-container"
          animate={{ rotate: isListening ? [0, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
        >
          {isListening ? (
            <FiMicOff size={20} />
          ) : (
            <FiMic size={20} />
          )}
        </motion.div>
        
        <div className="voice-text">
          <span className="voice-title">
            {isListening ? 'Te estoy escuchando...' : 'Hablemos un rato'}
          </span>
          <span className="voice-subtitle">
            {isListening ? 'Toca para parar' : 'Conversación por voz'}
          </span>
        </div>

        <motion.div
          className="voice-visualizer"
          animate={isListening ? {
            scaleY: [1, 1.5, 0.5, 1.2, 0.8, 1],
          } : { scaleY: 1 }}
          transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
        >
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
        </motion.div>
      </motion.button>

      {!isAvailable && (
        <motion.div
          className="coming-soon-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Próximamente
        </motion.div>
      )}
    </div>
  )
}