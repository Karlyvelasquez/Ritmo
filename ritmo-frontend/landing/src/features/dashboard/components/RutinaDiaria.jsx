import { useState, useEffect } from 'react'
import { Sun, Coffee, Utensils, Moon, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function RutinaDiaria() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [completedActivities, setCompletedActivities] = useState(() => {
        const today = new Date().toDateString()
        const saved = localStorage.getItem(`ritmo_rutina_${today}`)
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const rutinaDiaria = [
        {
            id: 'despertar',
            hora: '07:30',
            actividad: 'Levantarse tranquilo',
            descripcion: 'Sin prisa, estirar un poco en la cama',
            duracion: '10 min',
            icon: Sun,
            categoria: 'mañana'
        },
        {
            id: 'ejercicio_suave',
            hora: '08:00',
            actividad: 'Ejercicios suaves',
            descripcion: 'Movimientos de cuello, brazos y piernas',
            duracion: '15 min',
            icon: Sun,
            categoria: 'mañana'
        },
        {
            id: 'desayuno',
            hora: '08:30',
            actividad: 'Desayuno completo',
            descripcion: 'Con tranquilidad, leyendo o viendo noticias',
            duracion: '30 min',
            icon: Coffee,
            categoria: 'mañana'
        },
        {
            id: 'paseo',
            hora: '10:00',
            actividad: 'Paseo o aire fresco',
            descripcion: 'Caminar por el barrio o jardin, saludar vecinos',
            duracion: '30 min',
            icon: Sun,
            categoria: 'mañana'
        },
        {
            id: 'actividad_personal',
            hora: '11:00',
            actividad: 'Tiempo personal',
            descripcion: 'Leer, hacer crucigramas, llamar familia',
            duracion: '60 min',
            icon: Coffee,
            categoria: 'mañana'
        },
        {
            id: 'almuerzo',
            hora: '13:30',
            actividad: 'Comida principal',
            descripcion: 'Comida equilibrada, sin prisas',
            duracion: '45 min',
            icon: Utensils,
            categoria: 'tarde'
        },
        {
            id: 'descanso',
            hora: '15:00',
            actividad: 'Descanso/siesta',
            descripcion: 'Relax, siesta corta si se necesita',
            duracion: '30-60 min',
            icon: Moon,
            categoria: 'tarde'
        },
        {
            id: 'social',
            hora: '16:30',
            actividad: 'Tiempo social',
            descripcion: 'Visitas, televisión, hobbies',
            duracion: '90 min',
            icon: Coffee,
            categoria: 'tarde'
        },
        {
            id: 'cena',
            hora: '20:00',
            actividad: 'Cena ligera',
            descripcion: 'Comida suave y fácil de digerir',
            duracion: '30 min',
            icon: Utensils,
            categoria: 'noche'
        },
        {
            id: 'relajacion',
            hora: '21:00',
            actividad: 'Relajación',
            descripcion: 'Lectura, música suave, preparar el descanso',
            duracion: '60 min',
            icon: Moon,
            categoria: 'noche'
        }
    ]

    const toggleActivity = (activityId) => {
        const today = new Date().toDateString()
        const newCompleted = completedActivities.includes(activityId)
            ? completedActivities.filter(id => id !== activityId)
            : [...completedActivities, activityId]

        setCompletedActivities(newCompleted)
        localStorage.setItem(`ritmo_rutina_${today}`, JSON.stringify(newCompleted))
    }

    const getCurrentActivity = () => {
        const now = currentTime.getHours() * 100 + currentTime.getMinutes()

        for (let i = 0; i < rutinaDiaria.length; i++) {
            const [hours, minutes] = rutinaDiaria[i].hora.split(':').map(Number)
            const activityTime = hours * 100 + minutes

            if (now < activityTime) {
                return rutinaDiaria[i]
            }
        }

        return rutinaDiaria[rutinaDiaria.length - 1] // Última actividad del día
    }

    const isCurrentActivity = (activity) => {
        const current = getCurrentActivity()
        return current && current.id === activity.id
    }

    const getCompletionPercentage = () => {
        return Math.round((completedActivities.length / rutinaDiaria.length) * 100)
    }

    const getCategoryColor = (categoria) => {
        switch (categoria) {
            case 'mañana': return '#F59E0B'
            case 'tarde': return '#10B981'
            case 'noche': return '#6366F1'
            default: return '#6B7280'
        }
    }

    return (
        <motion.div
            className="widget-card rutina-diaria"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Clock size={20} className="widget-icon" />
                    <h3>Mi Rutina Diaria</h3>
                </div>
                <div className="progress-badge">
                    {getCompletionPercentage()}% del día
                </div>
            </div>

            <div className="current-activity-highlight">
                {(() => {
                    const current = getCurrentActivity()
                    const IconComponent = current?.icon || Clock

                    return (
                        <motion.div
                            className="current-activity"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="activity-time">
                                <IconComponent size={18} />
                                <span>Ahora: {current?.hora}</span>
                            </div>
                            <h4>{current?.actividad}</h4>
                            <p>{current?.descripcion}</p>
                        </motion.div>
                    )
                })()}
            </div>

            <div className="routine-timeline">
                {rutinaDiaria.map((actividad, index) => {
                    const IconComponent = actividad.icon
                    const isCompleted = completedActivities.includes(actividad.id)
                    const isCurrent = isCurrentActivity(actividad)

                    return (
                        <motion.div
                            key={actividad.id}
                            className={`routine-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleActivity(actividad.id)}
                        >
                            <div className="routine-time">
                                <span className="time-text">{actividad.hora}</span>
                                <div
                                    className="category-indicator"
                                    style={{ backgroundColor: getCategoryColor(actividad.categoria) }}
                                />
                            </div>

                            <div className="routine-content">
                                <div className="activity-header">
                                    <IconComponent size={16} className="activity-icon" />
                                    <h4>{actividad.actividad}</h4>
                                    <span className="duration">{actividad.duracion}</span>
                                </div>
                                <p className="activity-description">{actividad.descripcion}</p>
                            </div>

                            <div className="completion-check">
                                <CheckCircle2
                                    size={20}
                                    className={isCompleted ? 'completed-icon' : 'check-icon'}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="routine-footer">
                <small>✨ Una rutina estable ayuda a mantener el bienestar físico y mental</small>
            </div>
        </motion.div>
    )
}