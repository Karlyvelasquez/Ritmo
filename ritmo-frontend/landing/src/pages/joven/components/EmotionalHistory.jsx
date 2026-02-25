import { motion } from 'framer-motion'
import {
  mockCheckInHistory,
  mockEstadoInferido,
  estadoConfig,
} from '../../data/mockData'

const stateEmojis = {
  bien: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
      <path d="M5 10c1 1.5 2 2 3 2s2-0.5 3-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  normal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
      <line x1="5" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  dificil: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
      <path d="M5 11c1-1.5 2-2 3-2s2 0.5 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
}

export default function EmotionalHistory() {
  const counts = mockCheckInHistory.reduce(
    (acc, d) => {
      acc[d.estado] = (acc[d.estado] || 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="history-section">
      <h2>Historial emocional</h2>

      {/* 7-day timeline */}
      <motion.div
        className="history-timeline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {mockCheckInHistory.map((day, i) => {
          const config = estadoConfig[day.estado]
          return (
            <motion.div
              key={day.fecha}
              className="history-day"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="history-day-name">{day.diaNombre}</span>
              <div
                className="history-day-dot"
                style={{
                  background: config.colorLight,
                  color: config.colorDark || config.color,
                }}
                title={config.label}
              >
                {stateEmojis[day.estado]}
              </div>
              <span className="history-day-date">
                {day.fecha.split('-').slice(1).join('/')}
              </span>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Summary */}
      <motion.div
        className="history-summary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <strong>Esta semana: </strong>
        {counts.bien ? `${counts.bien} dia${counts.bien > 1 ? 's' : ''} bien` : ''}
        {counts.bien && (counts.normal || counts.dificil) ? ', ' : ''}
        {counts.normal ? `${counts.normal} normal${counts.normal > 1 ? 'es' : ''}` : ''}
        {counts.normal && counts.dificil ? ', ' : ''}
        {counts.dificil ? `${counts.dificil} dificil${counts.dificil > 1 ? 'es' : ''}` : ''}
      </motion.div>

      {/* Inferred state */}
      <motion.div
        className="inferred-state-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="inferred-state-header">
          <span className="inferred-state-label">Estado inferido</span>
          <span className="inferred-state-confidence">
            {Math.round(mockEstadoInferido.confianza * 100)}% confianza
          </span>
        </div>
        <div className="inferred-state-name">{mockEstadoInferido.estado_principal}</div>
        <p className="inferred-state-context">{mockEstadoInferido.contexto}</p>
        <div className="inferred-state-tags">
          {mockEstadoInferido.emociones_detectadas.map((emo) => (
            <span key={emo} className="inferred-tag">
              {emo.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
