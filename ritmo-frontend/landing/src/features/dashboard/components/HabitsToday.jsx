import { CheckCircle2, Clock } from 'lucide-react'
import { habitsData } from '../mockData'
import './HabitsToday.css'

export default function HabitsToday() {
  const progressPercentage = (habitsData.completed / habitsData.total) * 100

  return (
    <div className="habits-card">
      <div className="card-header">
        <h3>Tus hábitos de hoy</h3>
        <span className="badge badge-habits">
          {habitsData.completed} de {habitsData.total}
        </span>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="habits-list">
        {habitsData.habits.map((habit) => (
          <div key={habit.id} className="habit-item">
            <div className="habit-left">
              {habit.completed ? (
                <CheckCircle2 size={24} className="habit-icon completed" strokeWidth={2.5} />
              ) : (
                <Clock size={24} className="habit-icon pending" strokeWidth={2.5} />
              )}
              <span className={habit.completed ? 'completed' : ''}>
                {habit.name}
              </span>
            </div>
            <span className="habit-streak">{habit.streak}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
