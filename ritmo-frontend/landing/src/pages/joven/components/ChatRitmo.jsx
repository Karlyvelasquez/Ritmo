import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend } from 'react-icons/fi'
import { mockChatMessages, ritmoResponses } from '../../data/mockData'

export default function ChatRitmo() {
  const [messages, setMessages] = useState(mockChatMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const responseIndexRef = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing])

  const handleSend = () => {
    if (!input.trim() || typing) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulated response after delay
    setTimeout(() => {
      const responseText =
        ritmoResponses[responseIndexRef.current % ritmoResponses.length]
      responseIndexRef.current += 1

      const ritmoMsg = {
        id: Date.now() + 1,
        role: 'ritmo',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      setTyping(false)
      setMessages((prev) => [...prev, ritmoMsg])
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-section">
      <div className="chat-header">
        <div className="chat-header-avatar">
          <img src="/image/2.png" alt="RITMO" />
        </div>
        <div className="chat-header-info">
          <h3>RITMO</h3>
          <p>{typing ? 'Escribiendo...' : 'Siempre disponible'}</p>
        </div>
      </div>

      <div className="chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`chat-bubble ${msg.role}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              {msg.text}
              <div className="chat-bubble-time">{msg.timestamp}</div>
            </motion.div>
          ))}

          {typing && (
            <motion.div
              key="typing"
              className="chat-typing"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="chat-typing-dot"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe algo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={typing}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || typing}
          aria-label="Enviar mensaje"
        >
          <FiSend />
        </button>
      </div>
    </div>
  )
}
