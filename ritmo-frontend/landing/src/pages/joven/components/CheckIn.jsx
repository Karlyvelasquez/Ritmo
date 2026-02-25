import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const checkinOptions = [
  {
    id: 'bien',
    label: 'Bien',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="#8AAF8B" strokeWidth="2" fill="rgba(138,175,139,0.1)" />
        <circle cx="12" cy="15" r="2" fill="#8AAF8B" />
        <circle cx="24" cy="15" r="2" fill="#8AAF8B" />
        <path d="M11 22c1.5 3 4 4.5 7 4.5s5.5-1.5 7-4.5" stroke="#8AAF8B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    response: 'Me alegra saber eso. Los dias buenos tambien merecen ser reconocidos. Disfruta de este momento.',
  },
  {
    id: 'normal',
    label: 'Normal',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="#b08d6f" strokeWidth="2" fill="rgba(238,226,215,0.2)" />
        <circle cx="12" cy="15" r="2" fill="#b08d6f" />
        <circle cx="24" cy="15" r="2" fill="#b08d6f" />
        <line x1="11" y1="23" x2="25" y2="23" stroke="#b08d6f" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    response: 'No todos los dias tienen que ser extraordinarios. Estar "normal" es completamente valido. Aqui estoy si necesitas algo.',
  },
  {
    id: 'dificil',
    label: 'Dificil',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="#1E3751" strokeWidth="2" fill="rgba(30,55,81,0.08)" />
        <circle cx="12" cy="15" r="2" fill="#1E3751" />
        <circle cx="24" cy="15" r="2" fill="#1E3751" />
        <path d="M11 25c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" stroke="#1E3751" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    response: 'Gracias por ser honesto/a conmigo. No tienes que explicar nada ahora. Solo quiero que sepas que no estas solo/a en esto.',
  },
]

export default function CheckIn() {
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)

  const handleSelect = (option) => {
    setSelected(option)
    setTimeout(() => setDone(true), 600)
  }

  return (
    <div className="checkin-section">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="checkin-prompt">
              <h2>{'Como te sientes hoy?'}</h2>
              <p>No hay respuestas correctas o incorrectas</p>
            </div>

            <div className="checkin-buttons">
              {checkinOptions.map((option, i) => (
                <motion.button
                  key={option.id}
                  className={`checkin-btn ${option.id}`}
                  onClick={() => handleSelect(option)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="checkin-btn-icon">{option.icon}</span>
                  <span className="checkin-btn-label">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : !done ? (
          <motion.div
            key="selecting"
            className="checkin-prompt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              {selected.icon}
            </motion.div>
            <h2>{selected.label}</h2>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="checkin-done">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={{ display: 'inline-block', marginBottom: '0.75rem' }}
              >
                {selected.icon}
              </motion.div>
              <h3>{'Check-in registrado'}</h3>
              <p>{'Hoy te sientes: ' + selected.label}</p>
            </div>

            <motion.div
              className="checkin-response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginTop: '1rem' }}
            >
              <p>{selected.response}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
