import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function ChecklistAdaptacion() {
    const [completedTasks, setCompletedTasks] = useState(() => {
        const saved = localStorage.getItem('ritmo_checklist_inmigrante')
        return saved ? JSON.parse(saved) : []
    })

    const tareasPrioridad = [
        {
            id: 'nie',
            titulo: 'Solicitar NIE (Número de Identidad de Extranjero)',
            descripcion: 'Cita previa en Comisaría de Policía',
            urgencia: 'alta',
            tiempo: '2-4 semanas'
        },
        {
            id: 'empadronamiento',
            titulo: 'Empadronarse en el ayuntamiento',
            descripcion: 'Certificado de residencia en tu municipio',
            urgencia: 'alta',
            tiempo: '1 día'
        },
        {
            id: 'banco',
            titulo: 'Abrir cuenta bancaria',
            descripcion: 'Con NIE y certificado de empadronamiento',
            urgencia: 'alta',
            tiempo: '1-2 días'
        },
        {
            id: 'sanidad',
            titulo: 'Inscribirse en el sistema sanitario',
            descripcion: 'Tarjeta sanitaria europea o seguro privado',
            urgencia: 'alta',
            tiempo: '1-2 semanas'
        },
        {
            id: 'transporte',
            titulo: 'Obtener tarjeta de transporte público',
            descripcion: 'Abono mensual con descuentos para residentes',
            urgencia: 'media',
            tiempo: '1 día'
        },
        {
            id: 'telefono',
            titulo: 'Contratar línea telefónica/internet',
            descripcion: 'Comparar ofertas de operadores principales',
            urgencia: 'media',
            tiempo: '1-2 días'
        },
        {
            id: 'homologacion',
            titulo: 'Homologar títulos académicos',
            descripcion: 'Si planeas trabajar en tu área profesional',
            urgencia: 'baja',
            tiempo: '2-6 meses'
        },
        {
            id: 'idioma',
            titulo: 'Inscribirse en clases de español',
            descripcion: 'EOI, centros municipales o academias',
            urgencia: 'media',
            tiempo: 'Continuo'
        }
    ]

    const toggleTask = (taskId) => {
        const newCompleted = completedTasks.includes(taskId)
            ? completedTasks.filter(id => id !== taskId)
            : [...completedTasks, taskId]

        setCompletedTasks(newCompleted)
        localStorage.setItem('ritmo_checklist_inmigrante', JSON.stringify(newCompleted))
    }

    const getProgressPercentage = () => {
        return Math.round((completedTasks.length / tareasPrioridad.length) * 100)
    }

    const getUrgencyColor = (urgencia) => {
        switch (urgencia) {
            case 'alta': return '#EF4444'
            case 'media': return '#F59E0B'
            case 'baja': return '#10B981'
            default: return '#6B7280'
        }
    }

    const getUrgencyText = (urgencia) => {
        switch (urgencia) {
            case 'alta': return 'Urgente'
            case 'media': return 'Pronto'
            case 'baja': return 'Cuando puedas'
            default: return ''
        }
    }

    return (
        <motion.div
            className="widget-card checklist-adaptacion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Calendar size={20} className="widget-icon" />
                    <h3>Checklist de Adaptación</h3>
                </div>
                <div className="progress-badge">
                    {getProgressPercentage()}% completado
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ backgroundColor: '#F59E0B' }}
                    />
                </div>
                <p className="progress-text">
                    {completedTasks.length} de {tareasPrioridad.length} tareas completadas
                </p>
            </div>

            <div className="tasks-list">
                {tareasPrioridad.map((tarea, index) => {
                    const isCompleted = completedTasks.includes(tarea.id)

                    return (
                        <motion.div
                            key={tarea.id}
                            className={`task-item ${isCompleted ? 'completed' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => toggleTask(tarea.id)}
                        >
                            <div className="task-checkbox">
                                {isCompleted ? (
                                    <CheckCircle2 size={20} className="check-icon completed" />
                                ) : (
                                    <Circle size={20} className="check-icon" />
                                )}
                            </div>

                            <div className="task-details">
                                <h4 className="task-title">{tarea.titulo}</h4>
                                <p className="task-description">{tarea.descripcion}</p>
                                <div className="task-footer">
                                    <span
                                        className="urgency-badge"
                                        style={{ backgroundColor: getUrgencyColor(tarea.urgencia) }}
                                    >
                                        {getUrgencyText(tarea.urgencia)}
                                    </span>
                                    <span className="time-badge">⏱ {tarea.tiempo}</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="checklist-footer">
                <small>💡 Tip: Muchos trámites se pueden hacer online para ahorrar tiempo</small>
            </div>
        </motion.div>
    )
}