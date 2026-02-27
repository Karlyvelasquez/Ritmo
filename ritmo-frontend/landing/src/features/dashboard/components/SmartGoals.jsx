import { Target, Calendar, TrendingUp, CheckCircle2, Plus, Clock, Star, Briefcase, Heart, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import './SmartGoals.css'

export default function SmartGoals({ isPreview = false }) {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Cerrar 3 deals importantes este mes',
      category: 'profesional',
      progress: 66,
      deadline: '2026-03-15',
      priority: 'high',
      milestones: [
        { text: 'Propuesta cliente A enviada', completed: true },
        { text: 'Follow-up cliente B programado', completed: true },
        { text: 'Presentación cliente C preparada', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Correr semi-maratón en abril',
      category: 'personal',
      progress: 45,
      deadline: '2026-04-20',
      priority: 'medium',
      milestones: [
        { text: 'Completar carrera 10K', completed: true },
        { text: 'Entrenar 15K sin parar', completed: false },
        { text: 'Registro oficial en evento', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Aumentar ingresos 25% este año',
      category: 'financiero',
      progress: 18,
      deadline: '2026-12-31',
      priority: 'high',
      milestones: [
        { text: 'Negociar aumento salarial', completed: false },
        { text: 'Desarrollar fuente ingresos adicional', completed: false },
        { text: 'Optimizar inversiones actuales', completed: true }
      ]
    }
  ])

  const [activeTab, setActiveTab] = useState('all')
  const [showAddGoal, setShowAddGoal] = useState(false)

  const getGoalIcon = (category) => {
    switch(category) {
      case 'profesional': return Briefcase
      case 'personal': return Heart
      case 'financiero': return TrendingUp
      default: return Target
    }
  }

  const getGoalColor = (category) => {
    switch(category) {
      case 'profesional': return '#3b82f6'
      case 'personal': return '#10b981'
      case 'financiero': return '#f59e0b'
      default: return '#64748b'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  const filteredGoals = activeTab === 'all' ? goals : goals.filter(goal => goal.category === activeTab)

  const getDaysLeft = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isPreview) {
    return (
      <motion.div 
        className="smart-goals-preview professional-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="card-header">
          <div className="card-title">
            <Target size={20} />
            <h3>Objetivos Inteligentes</h3>
          </div>
          <div className="goals-count">
            <span>{goals.length} activos</span>
          </div>
        </div>

        <div className="preview-goals">
          {goals.slice(0, 2).map((goal) => {
            const Icon = getGoalIcon(goal.category)
            const daysLeft = getDaysLeft(goal.deadline)
            
            return (
              <div key={goal.id} className="goal-preview-item">
                <div className="goal-preview-header">
                  <div className="goal-icon" style={{ backgroundColor: getGoalColor(goal.category) }}>
                    <Icon size={16} />
                  </div>
                  <div className="goal-info">
                    <span className="goal-title">{goal.title}</span>
                    <span className="goal-deadline">
                      <Clock size={12} />
                      {daysLeft > 0 ? `${daysLeft} días` : 'Vencido'}
                    </span>
                  </div>
                </div>
                
                <div className="goal-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${goal.progress}%`,
                      backgroundColor: getGoalColor(goal.category)
                    }}
                  />
                  <span className="progress-text">{goal.progress}%</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="preview-stats">
          <div className="stat">
            <Trophy size={14} />
            <span>2 completados este mes</span>
          </div>
          <div className="stat">
            <TrendingUp size={14} />
            <span>85% tasa de éxito</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="smart-goals-container">
      <motion.div 
        className="goals-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div className="title-section">
            <Target size={32} />
            <div>
              <h1>Objetivos S.M.A.R.T.</h1>
              <p>Específicos, Medibles, Alcanzables, Relevantes, Temporales</p>
            </div>
          </div>
          
          <div className="goals-overview">
            <div className="overview-stat">
              <span className="stat-number">{goals.length}</span>
              <span className="stat-label">Objetivos Activos</span>
            </div>
            <div className="overview-stat">
              <span className="stat-number">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
              </span>
              <span className="stat-label">Progreso Promedio</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="goals-navigation"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="nav-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos ({goals.length})
          </button>
          <button 
            className={`tab ${activeTab === 'profesional' ? 'active' : ''}`}
            onClick={() => setActiveTab('profesional')}
          >
            <Briefcase size={16} />
            Profesionales ({goals.filter(g => g.category === 'profesional').length})
          </button>
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <Heart size={16} />
            Personales ({goals.filter(g => g.category === 'personal').length})
          </button>
          <button 
            className={`tab ${activeTab === 'financiero' ? 'active' : ''}`}
            onClick={() => setActiveTab('financiero')}
          >
            <TrendingUp size={16} />
            Financieros ({goals.filter(g => g.category === 'financiero').length})
          </button>
        </div>

        <button 
          className="add-goal-btn"
          onClick={() => setShowAddGoal(true)}
        >
          <Plus size={16} />
          Nuevo Objetivo
        </button>
      </motion.div>

      <div className="goals-grid">
        {filteredGoals.map((goal, index) => {
          const Icon = getGoalIcon(goal.category)
          const daysLeft = getDaysLeft(goal.deadline)
          const completedMilestones = goal.milestones.filter(m => m.completed).length
          
          return (
            <motion.div
              key={goal.id}
              className="goal-card professional-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="goal-card-header">
                <div className="goal-category">
                  <div 
                    className="category-icon"
                    style={{ backgroundColor: getGoalColor(goal.category) }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="category-name">{goal.category}</span>
                </div>
                
                <div 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(goal.priority) }}
                >
                  {goal.priority}
                </div>
              </div>

              <div className="goal-content">
                <h3 className="goal-title">{goal.title}</h3>
                
                <div className="goal-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span className={daysLeft < 7 ? 'urgent' : ''}>
                      {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <CheckCircle2 size={14} />
                    <span>{completedMilestones}/{goal.milestones.length} hitos</span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progreso</span>
                    <span className="progress-percentage">{goal.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      style={{ backgroundColor: getGoalColor(goal.category) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="milestones-section">
                  <h4>Hitos clave</h4>
                  <div className="milestones-list">
                    {goal.milestones.map((milestone, idx) => (
                      <div key={idx} className={`milestone ${milestone.completed ? 'completed' : ''}`}>
                        <div className="milestone-checkbox">
                          {milestone.completed && <CheckCircle2 size={14} />}
                        </div>
                        <span className="milestone-text">{milestone.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="goal-actions">
                <button className="action-btn update">
                  Actualizar progreso
                </button>
                <button className="action-btn details">
                  Ver detalles
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {showAddGoal && (
        <motion.div 
          className="add-goal-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            <h3>Crear Nuevo Objetivo S.M.A.R.T.</h3>
            <div className="form-grid">
              <input type="text" placeholder="¿Qué quieres lograr?" />
              <select>
                <option value="profesional">Profesional</option>
                <option value="personal">Personal</option>
                <option value="financiero">Financiero</option>
              </select>
              <input type="date" />
              <select>
                <option value="high">Alta prioridad</option>
                <option value="medium">Media prioridad</option>
                <option value="low">Baja prioridad</option>
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddGoal(false)}
              >
                Cancelar
              </button>
              <button className="create-btn">
                Crear Objetivo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}