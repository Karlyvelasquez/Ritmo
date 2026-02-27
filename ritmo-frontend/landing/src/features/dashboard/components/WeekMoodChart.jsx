import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Smile, Meh, Frown } from 'lucide-react'
import { weekMoodData, todayMood } from '../mockData'
import './WeekMoodChart.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler)

export default function WeekMoodChart() {
  const chartData = {
    labels: weekMoodData.map(item => item.day),
    datasets: [{
      data: weekMoodData.map(item => item.value),
      backgroundColor: weekMoodData.map(item => item.color),
      borderRadius: 10,
      borderSkipped: false,
      maxBarThickness: 40
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: { size: 13, weight: '600' }
        }
      },
      y: { display: false }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutBounce'
    }
  }

  return (
    <div className="mood-chart-card">
      <div className="card-header">
        <h3>¿Cómo va tu semana? 📊</h3>
        <span className="badge badge-mood">Hoy: {todayMood}</span>
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} height={200} />
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
