import { Lightbulb, ArrowRight } from 'lucide-react'
import { getRecommendationsForMood, todayMood } from '../mockData'
import './Recommendations.css'

export default function Recommendations() {
  const recommendations = getRecommendationsForMood(todayMood, 3)

  return (
    <div className="recommendations-card">
      <div className="card-header">
        <div className="recs-title-row">
          <Lightbulb size={22} strokeWidth={2.5} />
          <h3>Para ti hoy 💡</h3>
        </div>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className="recommendation-item"
            style={{ '--rec-color': rec.color }}
          >
            <div className="rec-icon">{rec.icon}</div>
            <div className="rec-content">
              <h4>{rec.title}</h4>
              <p>{rec.subtitle}</p>
            </div>
            <button className="rec-action">
              <ArrowRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
