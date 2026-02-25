import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { Smile, Meh, Frown } from 'lucide-react'
import { weekMoodData, todayMood } from '../mockData'
import './WeekMoodChart.css'

export default function WeekMoodChart() {
  return (
    <div className="mood-chart-card">
      <div className="card-header">
        <h3>¿Cómo va tu semana? 📊</h3>
        <span className="badge badge-mood">Hoy: {todayMood}</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekMoodData}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}
            />
            <Bar 
              dataKey="value" 
              radius={[10, 10, 0, 0]}
              maxBarSize={40}
            >
              {weekMoodData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mood-legend">
        <div className="legend-item">
          <Smile size={20} color="#8AAF8B" strokeWidth={2.5} />
          <span>Bien</span>
        </div>
        <div className="legend-item">
          <Meh size={20} color="#D1D5DB" strokeWidth={2.5} />
          <span>Normal</span>
        </div>
        <div className="legend-item">
          <Frown size={20} color="#F0A8A8" strokeWidth={2.5} />
          <span>Difícil</span>
        </div>
      </div>
    </div>
  )
}
