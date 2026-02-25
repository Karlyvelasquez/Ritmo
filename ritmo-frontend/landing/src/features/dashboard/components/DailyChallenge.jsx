import { useState } from 'react'
import { Trophy, Sparkles, CheckCircle2 } from 'lucide-react'
import { getDailyChallenge } from '../mockData'
import './DailyChallenge.css'

export default function DailyChallenge() {
  const challenge = getDailyChallenge()
  const [completed, setCompleted] = useState(false)

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true)
      // Aquí podrías guardar en localStorage o enviar a backend
    }
  }

  return (
    <div className={`daily-challenge-card ${completed ? 'completed' : ''}`}>
      <div className="challenge-header">
        <div className="challenge-title-row">
          <Trophy size={22} strokeWidth={2.5} />
          <h3>Reto del día</h3>
        </div>
        <div className="challenge-points">
          <Sparkles size={16} />
          <span>+{challenge.points} pts</span>
        </div>
      </div>

      <div className="challenge-content">
        <div className="challenge-icon">{challenge.icon}</div>
        <div className="challenge-info">
          <h4>{challenge.title}</h4>
          <p>{challenge.description}</p>
        </div>
      </div>

      <button 
        className={`challenge-button ${completed ? 'completed' : ''}`}
        onClick={handleComplete}
        disabled={completed}
      >
        {completed ? (
          <>
            <CheckCircle2 size={20} />
            <span>¡Completado! 🎉</span>
          </>
        ) : (
          <>
            <span>Marcar como hecho</span>
          </>
        )}
      </button>

      {completed && (
        <div className="completion-confetti">
          <span>✨</span>
          <span>🎉</span>
          <span>⭐</span>
        </div>
      )}
    </div>
  )
}
