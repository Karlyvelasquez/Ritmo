import { useState, useEffect } from 'react'
import { TrendingUp, Heart, Flame, Target, Calendar, Award, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'
import './ProgressRitmo.css'

export default function ProgressRitmo() {
  const [user] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })

  // Simulación de datos de progreso - en producción vendrían del backend
  const progressData = {
    diasActivos: 12,
    rachaActual: 5,
    mejorRacha: 8,
    checkInsRealizados: 25,
    habitosCompletados: 34,
    emocionesMasFrecuentes: [
      { emotion: 'Bien', count: 10, color: '#8AAF8B' },
      { emotion: 'Normal', count: 9, color: '#F59E0B' },
      { emotion: 'Difícil', count: 6, color: '#EC4899' }
    ],
    progresoSemanal: [
      { dia: 'Lun', completado: 3, total: 5 },
      { dia: 'Mar', completado: 4, total: 5 },
      { dia: 'Mié', completado: 5, total: 5 },
      { dia: 'Jue', completado: 2, total: 5 },
      { dia: 'Vie', completado: 4, total: 5 },
      { dia: 'Sáb', completado: 3, total: 5 },
      { dia: 'Dom', completado: 4, total: 5 }
    ]
  }

  const userName = user?.nombre?.split(' ')[0] || 'amigo'
  const progresoGeneral = Math.round((progressData.habitosCompletados / 50) * 100)

  const getMensajeMotivador = () => {
    if (progresoGeneral >= 80) {
      return `${userName}, estás brillando. Este progreso no es coincidencia, es el resultado de elegir aparecer cada día. Estoy muy orgulloso de ti.`
    } else if (progresoGeneral >= 50) {
      return `Mira hasta dónde has llegado, ${userName}. No siempre es fácil, lo sé. Pero aquí estás, construyendo algo real. Eso vale más de lo que crees.`
    } else if (progresoGeneral >= 20) {
      return `${userName}, cada paso cuenta. No importa cuán pequeño parezca. Estás aquí, estás intentando, y eso ya es mucho. Vamos juntos en esto.`
    } else {
      return `Hola ${userName}, estamos empezando. Y eso es perfecto. No hay presión, no hay prisa. Solo este momento, tú y yo, paso a paso.`
    }
  }

  return (
    <div className="progress-ritmo-container">
      {/* Hero Section */}
      <motion.div 
        className="progress-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-icon">
          <TrendingUp size={48} strokeWidth={2} />
        </div>
        
        <h1>Tu camino hasta aquí</h1>
        
        <div className="hero-message">
          <p>{getMensajeMotivador()}</p>
          <p className="hero-signature">— RITMO</p>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-card highlight">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' }}>
            <Flame size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{progressData.rachaActual}</div>
            <div className="stat-label">Días seguidos</div>
            <div className="stat-sublabel">Mejor racha: {progressData.mejorRacha} días</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8AAF8B 0%, #a8c8a9 100%)' }}>
            <Calendar size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{progressData.diasActivos}</div>
            <div className="stat-label">Días activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' }}>
            <Heart size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{progressData.checkInsRealizados}</div>
            <div className="stat-label">Check-ins emocionales</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }}>
            <Target size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{progressData.habitosCompletados}</div>
            <div className="stat-label">Hábitos completados</div>
          </div>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div 
        className="overall-progress-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="progress-header">
          <div className="progress-title">
            <Award size={24} />
            <h3>Progreso General</h3>
          </div>
          <div className="progress-percentage">{progresoGeneral}%</div>
        </div>
        
        <div className="progress-bar-container">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progresoGeneral}%` }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          >
            <div className="progress-glow"></div>
          </motion.div>
        </div>

        <p className="progress-message">
          {progresoGeneral >= 75 ? 
            "Increíble consistencia. Esto es lo que significa comprometerse contigo mismo." :
            progresoGeneral >= 50 ?
            "Vas por buen camino. Cada día que apareces, te estás eligiendo." :
            "Esto recién empieza. Y créeme, aparecer hoy ya cuenta."}
        </p>
      </motion.div>

      {/* Weekly Activity */}
      <motion.div 
        className="weekly-activity-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-header">
          <h3>Tu semana</h3>
          <span className="week-label">Últimos 7 días</span>
        </div>

        <div className="weekly-chart">
          {progressData.progresoSemanal.map((dia, index) => {
            const percentage = (dia.completado / dia.total) * 100
            return (
              <div key={index} className="chart-bar-wrapper">
                <motion.div 
                  className="chart-bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.5 }}
                >
                  <div className="bar-fill"></div>
                  <div className="bar-value">{dia.completado}</div>
                </motion.div>
                <div className="chart-label">{dia.dia}</div>
              </div>
            )
          })}
        </div>

        <div className="chart-legend">
          <span>Actividades completadas por día</span>
        </div>
      </motion.div>

      {/* Emotional Journey */}
      <motion.div 
        className="emotional-journey-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card-header">
          <h3>Tu viaje emocional</h3>
          <span className="week-label">Últimos check-ins</span>
        </div>

        <div className="emotion-bars">
          {progressData.emocionesMasFrecuentes.map((emotion, index) => {
            const maxCount = Math.max(...progressData.emocionesMasFrecuentes.map(e => e.count))
            const percentage = (emotion.count / maxCount) * 100
            
            return (
              <div key={index} className="emotion-row">
                <div className="emotion-label">{emotion.emotion}</div>
                <div className="emotion-bar-bg">
                  <motion.div 
                    className="emotion-bar-fill"
                    style={{ background: emotion.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.7 + (index * 0.1), duration: 0.8 }}
                  />
                </div>
                <div className="emotion-count">{emotion.count}</div>
              </div>
            )
          })}
        </div>

        <div className="emotion-insight">
          <p>
            Reconocer tus emociones es el primer paso para comprenderlas. 
            No todas tienen que ser positivas para que estés haciendo las cosas bien.
          </p>
        </div>
      </motion.div>

      {/* Motivational Close */}
      <motion.div 
        className="closing-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="closing-icon">
          <ArrowUp size={24} />
        </div>
        <div className="closing-text">
          <p>
            Los números cuentan la historia, pero tú eres quien la escribe. Cada check-in, cada hábito, 
            cada vez que volviste después de un mal día. Eso es lo que realmente importa.
          </p>
          <p>
            Seguimos juntos en esto, {userName}. Un día más, un paso más.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
