import { CheckCircle2, Clock, Target, Zap, Plus, ArrowRight, Calendar, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import './ProductivityHub.css'

export default function ProductivityHub({ isPreview = false }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Revisar propuesta de presupuesto Q2', completed: true, priority: 'high', timeEstimate: '45m' },
    { id: 2, text: 'Llamada con equipo de marketing', completed: true, priority: 'medium', timeEstimate: '30m' },
    { id: 3, text: 'Finalizar presentación para cliente', completed: false, priority: 'high', timeEstimate: '2h' },
    { id: 4, text: 'Revisar CVs para posición senior', completed: false, priority: 'medium', timeEstimate: '1h' },
    { id: 5, text: 'Planificar sprint próxima semana', completed: false, priority: 'low', timeEstimate: '45m' }
  ])

  const [newTask, setNewTask] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)

  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = Math.round((completedTasks / tasks.length) * 100)

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTask,
        completed: false,
        priority: 'medium',
        timeEstimate: '30m'
      }])
      setNewTask('')
      setShowAddTask(false)
    }
  }

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  if (isPreview) {
    return (
      <motion.div 
        className="productivity-hub-preview professional-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="card-header">
          <div className="card-title">
            <Target size={20} />
            <h3>Productividad Hoy</h3>
          </div>
          <div className="completion-badge">
            <span>{completionRate}%</span>
          </div>
        </div>
        
        <div className="preview-stats">
          <div className="stat">
            <CheckCircle2 size={16} />
            <span>{completedTasks}/{tasks.length} tareas</span>
          </div>
          <div className="stat">
            <Clock size={16} />
            <span>3.5h estimadas restantes</span>
          </div>
        </div>

        <div className="preview-tasks">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className={`task-preview ${task.completed ? 'completed' : ''}`}>
              <div 
                className="priority-indicator" 
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              />
              <span className="task-text">{task.text}</span>
              {task.completed && <CheckCircle2 size={16} className="check-icon" />}
            </div>
          ))}
        </div>

        <button className="expand-button">
          Ver todas las tareas <ArrowRight size={16} />
        </button>
      </motion.div>
    )
  }

  return (
    <div className="productivity-hub-container">
      <motion.div 
        className="productivity-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div className="title-section">
            <Target size={32} />
            <div>
              <h1>Centro de Productividad</h1>
              <p>Gestiona tu día con intención y propósito</p>
            </div>
          </div>
          
          <div className="productivity-metrics">
            <div className="metric">
              <div className="metric-circle">
                <span className="metric-value">{completionRate}%</span>
              </div>
              <span className="metric-label">Completado</span>
            </div>
            <div className="metric">
              <Flame size={24} />
              <div>
                <span className="metric-value">7</span>
                <span className="metric-label">Días consecutivos</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="productivity-grid">
        <motion.div 
          className="tasks-section professional-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <h3>Tareas de Hoy</h3>
            <button 
              className="add-task-btn"
              onClick={() => setShowAddTask(!showAddTask)}
            >
              <Plus size={16} />
              Nueva tarea
            </button>
          </div>

          {showAddTask && (
            <motion.div 
              className="add-task-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="¿En qué vas a trabajar?"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                autoFocus
              />
              <button onClick={addTask}>Añadir</button>
            </motion.div>
          )}

          <div className="tasks-list">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <button
                  className="task-checkbox"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed && <CheckCircle2 size={18} />}
                </button>
                
                <div className="task-content">
                  <span className="task-text">{task.text}</span>
                  <div className="task-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span className="time-estimate">
                      <Clock size={12} />
                      {task.timeEstimate}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="focus-section professional-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <h3>Sesión de Enfoque</h3>
            <Zap size={20} />
          </div>
          
          <div className="focus-timer">
            <div className="timer-display">
              <span className="time">25:00</span>
              <span className="session-type">Pomodoro</span>
            </div>
            
            <div className="timer-controls">
              <button className="timer-btn start">Iniciar</button>
              <button className="timer-btn pause">Pausar</button>
              <button className="timer-btn reset">Reset</button>
            </div>
          </div>

          <div className="focus-stats">
            <div className="focus-stat">
              <span className="stat-number">4</span>
              <span className="stat-label">Sesiones hoy</span>
            </div>
            <div className="focus-stat">
              <span className="stat-number">2.5h</span>
              <span className="stat-label">Tiempo enfocado</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="scheduling-section professional-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <h3>Próximas Reuniones</h3>
            <Calendar size={20} />
          </div>
          
          <div className="upcoming-meetings">
            <div className="meeting-item">
              <div className="meeting-time">14:30</div>
              <div className="meeting-info">
                <span className="meeting-title">Review Trimestral</span>
                <span className="meeting-participants">Con equipo directivo</span>
              </div>
            </div>
            <div className="meeting-item">
              <div className="meeting-time">16:00</div>
              <div className="meeting-info">
                <span className="meeting-title">Presentación Cliente</span>
                <span className="meeting-participants">Mesa de trabajo</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}