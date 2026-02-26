import { useState, useEffect, useRef } from 'react'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  Circle,
  Clock, 
  Trophy, 
  Flame, 
  Star, 
  Target,
  Zap,
  Award,
  TrendingUp,
  Plus,
  RotateCcw,
  Sparkles,
  RefreshCw,
  BarChart3,
  Grid3x3,
  List,
  Crown,
  Activity,
  Heart,
  Brain,
  Users,
  Coffee,
  BookOpen,
  Dumbbell
} from 'lucide-react'
import HabitsService from '../services/HabitsService'
import './HabitsInteractive.css'

// Categorías con iconos profesionales
const categoryIcons = {
  wellness: Heart,
  productivity: Brain,
  social: Users
}

// Mapeo de iconos para diferentes tipos de hábitos
const habitIcons = {
  meditar: Brain,
  ejercicio: Activity,
  agua: Coffee,
  estudiar: BookOpen,
  leer: BookOpen,
  familia: Users,
  amigos: Users,
  default: Target
}

// Logros desbloqueables con iconos profesionales
const achievementIcons = {
  first_week: Flame,
  habit_master: Crown,
  early_bird: Star,
  consistent: TrendingUp
}

export default function HabitsInteractive() {
  const [habits, setHabits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [view, setView] = useState('grid') // 'grid', 'list', 'chart'
  const [celebrationVisible, setCelebrationVisible] = useState(false)
  const [particles, setParticles] = useState([])
  const [achievements, setAchievements] = useState([])
  const [hoveredHabit, setHoveredHabit] = useState(null)
  const confettiRef = useRef(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadHabitsData()
  }, [])

  const loadHabitsData = async () => {
    try {
      setLoading(true)
      const habitsData = await HabitsService.generateHabitsRecommendations()
      const todayState = HabitsService.loadTodayHabitsState()
      
      // Aplicar el estado guardado de hoy
      const categoriesWithState = habitsData.categories.map(category => ({
        ...category,
        habits: category.habits.map(habit => ({
          ...habit,
          completed: todayState[habit.id]?.completed || false
        }))
      }))

      setHabits({
        ...habitsData,
        categories: categoriesWithState
      })
      
      setAchievements(HabitsService.checkAchievements())
    } catch (error) {
      console.error('Error loading habits data:', error)
      // Usar datos por defecto en caso de error
      setHabits(HabitsService.getLocalHabitsData())
    } finally {
      setLoading(false)
    }
  }

  // Función para refresh manual
  const refreshHabits = () => {
    loadHabitsData()
  }

  // Calcular estadísticas (solo si habits no es null)
  const allHabits = habits ? habits.categories.flatMap(cat => cat.habits) : []
  const completedHabits = allHabits.filter(h => h.completed)
  const totalHabits = allHabits.length
  const progressPercentage = totalHabits > 0 ? (completedHabits.length / totalHabits) * 100 : 0
  const totalPointsEarned = completedHabits.reduce((sum, h) => sum + h.points, 0)
  const levelProgress = habits ? ((habits.totalPoints % 1000) / 1000) * 100 : 0

  // Función para toggle de hábito
  const toggleHabit = async (categoryId, habitId) => {
    if (!habits) return
    
    const habit = allHabits.find(h => h.id === habitId)
    const wasCompleted = habit?.completed || false
    
    setHabits(prev => ({
      ...prev,
      categories: prev.categories.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              habits: category.habits.map(habit => 
                habit.id === habitId 
                  ? { 
                      ...habit, 
                      completed: !habit.completed,
                      streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
                    }
                  : habit
              )
            }
          : category
      )
    }))

    // Guardar estado persistente
    await HabitsService.saveHabitState(habitId, !wasCompleted, categoryId)
    
    // Actualizar achievements
    setAchievements(HabitsService.checkAchievements())

    // Mostrar celebración si se completa un hábito
    if (!wasCompleted) {
      triggerCelebration()
    }
  }

  // Función para crear efectos de celebración
  const triggerCelebration = () => {
    setCelebrationVisible(true)
    createParticles()
    setTimeout(() => setCelebrationVisible(false), 2000)
  }

  const createParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 2500)
  }

  // Filtrar hábitos por categoría
  const getFilteredCategories = () => {
    if (!habits || selectedCategory === 'all') return habits?.categories || []
    return habits.categories.filter(cat => cat.id === selectedCategory)
  }

  // Obtener icono de dificultad con elementos visuales
  const getDifficultyLevel = (difficulty) => {
    const levels = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    }
    return levels[difficulty] || 1
  }

  // Obtener icono para un hábito específico
  const getHabitIcon = (habitName) => {
    const name = habitName.toLowerCase()
    for (const [key, Icon] of Object.entries(habitIcons)) {
      if (name.includes(key)) return Icon
    }
    return habitIcons.default
  }

  return (
    <div className="habits-interactive-pro">
      {/* Partículas de celebración minimalistas */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="celebration-particle-pro"
            initial={{ 
              x: `${particle.x}%`, 
              y: `${particle.y}%`, 
              scale: 0, 
              opacity: 0 
            }}
            animate={{ 
              y: `${particle.y - 50}%`, 
              scale: 1, 
              opacity: 1 
            }}
            exit={{ 
              y: `${particle.y - 100}%`, 
              scale: 0, 
              opacity: 0 
            }}
            transition={{ 
              duration: particle.duration, 
              delay: particle.delay 
            }}
          >
            <Sparkles size={16} strokeWidth={2} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header profesional con estadísticas */}
      <motion.div 
        className="habits-header-pro"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="habits-title-section">
          <div className="title-with-icon">
            <Activity size={24} strokeWidth={2} />
            <h2>Habit Tracker</h2>
          </div>
          
          <div className="header-actions">
            <motion.button 
              className="icon-btn refresh-btn-pro"
              onClick={refreshHabits}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            </motion.button>
            
            <div className="view-selector">
              <motion.button
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3x3 size={18} />
              </motion.button>
              <motion.button
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={18} />
              </motion.button>
              <motion.button
                className={view === 'chart' ? 'active' : ''}
                onClick={() => setView('chart')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Estadísticas en cards minimalistas */}
        <div className="stats-grid-pro">
          <motion.div 
            className="stat-card-pro level-card"
            whileHover={{ y: -4 }}
          >
            <div className="stat-icon">
              <Zap size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">Level {habits?.level || 1}</div>
              <div className="stat-label">Current Level</div>
              <div className="level-progress-bar">
                <motion.div 
                  className="level-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card-pro points-card"
            whileHover={{ y: -4 }}
          >
            <div className="stat-icon">
              <Star size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalPointsEarned}</div>
              <div className="stat-label">Points Today</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card-pro streak-card"
            whileHover={{ y: -4 }}
          >
            <div className="stat-icon">
              <Flame size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{habits?.currentStreak || 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card-pro progress-card"
            whileHover={{ y: -4 }}
          >
            <div className="stat-icon">
              <Target size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{completedHabits.length}/{totalHabits}</div>
              <div className="stat-label">Completed</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Vista de logros profesional */}
      {view === 'chart' && (
        <motion.div 
          className="achievements-view-pro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="section-title">
            <Trophy size={20} />
            <h3>Achievements</h3>
          </div>
          
          <div className="achievements-grid-pro">
            {achievements.map((achievement, index) => {
              const IconComponent = achievementIcons[achievement.id] || Award
              return (
                <motion.div 
                  key={achievement.id}
                  className={`achievement-card-pro ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="achievement-icon-pro">
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <div className="achievement-info-pro">
                    <h4>{achievement.name}</h4>
                    <div className="achievement-progress-pro">
                      <div className="progress-track">
                        <motion.div 
                          className="progress-fill-pro"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="progress-text">{achievement.progress}%</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Vista principal de hábitos - Grid y List */}
      {(view === 'grid' || view === 'list') && (
        <>
          {/* Filtros de categoría con iconos */}
          <div className="category-filters-pro">
            <motion.button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid3x3 size={16} />
              <span>All Habits</span>
            </motion.button>
            {habits?.categories?.map(category => {
              const CategoryIcon = categoryIcons[category.id] || Target
              return (
                <motion.button
                  key={category.id}
                  className={selectedCategory === category.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(category.id)}
                  data-category={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CategoryIcon size={16} />
                  <span>{category.name.split(' ')[1]}</span>
                </motion.button>
              )
            }) || []}
          </div>

          {/* Lista de hábitos con diseño profesional */}
          <div className={`habits-container-pro ${view}`}>
            {loading ? (
              <div className="loading-state-pro">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={32} />
                </motion.div>
                <p>Loading your habits...</p>
              </div>
            ) : getFilteredCategories().length === 0 ? (
              <div className="empty-state-pro">
                <Target size={48} strokeWidth={1} />
                <h3>No habits yet</h3>
                <p>Start building your routine</p>
                <motion.button 
                  className="btn-primary-pro" 
                  onClick={refreshHabits}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  <span>Get Recommendations</span>
                </motion.button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {getFilteredCategories().map(category => (
                  <div key={category.id} className="category-group-pro">
                    {selectedCategory === 'all' && (
                      <div className="category-header-pro">
                        {React.createElement(categoryIcons[category.id] || Target, { size: 18 })}
                        <span>{category.name.split(' ')[1]}</span>
                        <div className="category-badge">
                          {category.habits.filter(h => h.completed).length}/{category.habits.length}
                        </div>
                      </div>
                    )}
                    
                    <div className={`habits-list-pro ${view}`}>
                      {category.habits.map((habit, index) => {
                        const HabitIcon = getHabitIcon(habit.name)
                        const difficultyLevel = getDifficultyLevel(habit.difficulty)
                        
                        return (
                          <motion.div
                            key={habit.id}
                            className={`habit-card-pro ${habit.completed ? 'completed' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            onHoverStart={() => setHoveredHabit(habit.id)}
                            onHoverEnd={() => setHoveredHabit(null)}
                            layout
                          >
                            <div className="habit-checkbox-area" onClick={() => toggleHabit(category.id, habit.id)}>
                              <motion.div
                                className="checkbox-custom"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {habit.completed ? (
                                  <CheckCircle2 size={24} strokeWidth={2.5} className="checked" />
                                ) : (
                                  <Circle size={24} strokeWidth={2} className="unchecked" />
                                )}
                              </motion.div>
                            </div>

                            <div className="habit-icon-area">
                              <div className="habit-icon-circle">
                                <HabitIcon size={20} strokeWidth={2} />
                              </div>
                            </div>

                            <div className="habit-content-area">
                              <h4 className="habit-title">{habit.name}</h4>
                              
                              <div className="habit-meta">
                                <div className="difficulty-indicator">
                                  {[...Array(3)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`difficulty-dot ${i < difficultyLevel ? 'active' : ''}`}
                                    />
                                  ))}
                                </div>
                                
                                <div className="habit-time">
                                  <Clock size={12} />
                                  <span>{habit.estimatedTime}</span>
                                </div>
                              </div>
                            </div>

                            <div className="habit-stats-area">
                              <div className="points-badge-pro">
                                <Star size={14} />
                                <span>{habit.points}</span>
                              </div>
                              
                              <div className="streak-badge-pro">
                                <Flame size={14} />
                                <span>{habit.streak}</span>
                              </div>
                            </div>

                            <motion.div 
                              className="habit-progress-line"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: habit.completed ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

      {/* Animación de celebración profesional */}
      <AnimatePresence>
        {celebrationVisible && (
          <motion.div
            className="celebration-overlay-pro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-content-pro"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <CheckCircle2 size={48} strokeWidth={2} />
              <span>Completed</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}