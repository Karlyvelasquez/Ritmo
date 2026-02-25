import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiMoon,
  FiMapPin,
  FiHeart,
  FiDroplet,
  FiEdit3,
  FiCheck,
  FiZap,
} from 'react-icons/fi'
import { mockHabits } from '../../data/mockData'

const habitIcons = {
  moon: FiMoon,
  footprints: FiMapPin,
  brain: FiHeart,
  droplet: FiDroplet,
  pencil: FiEdit3,
}

export default function HabitTracker() {
  const [habits, setHabits] = useState(mockHabits)

  const completedToday = habits.filter((h) => h.completadoHoy).length
  const total = habits.length

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completadoHoy: !h.completadoHoy,
              racha: !h.completadoHoy ? h.racha + 1 : h.racha - 1,
              progreso_semanal: !h.completadoHoy
                ? Math.min(h.progreso_semanal + 1, h.meta_semanal)
                : Math.max(h.progreso_semanal - 1, 0),
            }
          : h
      )
    )
  }

  return (
    <div className="habits-section">
      <h2>{'Rastreador de habitos'}</h2>

      <motion.div
        className="habits-overview"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="habits-overview-text">
          {'Progreso de hoy'}
        </span>
        <span className="habits-overview-count">
          {completedToday} / {total} completados
        </span>
      </motion.div>

      <div className="habits-grid">
        {habits.map((habit, i) => {
          const IconComp = habitIcons[habit.icono] || FiHeart
          const progress = Math.round(
            (habit.progreso_semanal / habit.meta_semanal) * 100
          )

          return (
            <motion.div
              key={habit.id}
              className={`habit-card ${habit.completadoHoy ? 'completed' : ''}`}
              onClick={() => toggleHabit(habit.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="habit-card-top">
                <div className="habit-icon-wrapper">
                  <IconComp />
                </div>
                <motion.div
                  className="habit-check"
                  animate={
                    habit.completadoHoy
                      ? { scale: [1, 1.2, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <FiCheck />
                </motion.div>
              </div>

              <span className="habit-name">{habit.nombre}</span>

              <span className="habit-streak">
                <FiZap className="streak-fire" />
                {habit.racha} {'dia' + (habit.racha !== 1 ? 's' : '') + ' de racha'}
              </span>

              <div className="habit-progress">
                <div className="habit-progress-bar">
                  <motion.div
                    className="habit-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 + 0.2 }}
                  />
                </div>
                <span className="habit-progress-text">
                  {habit.progreso_semanal}/{habit.meta_semanal} esta semana
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
