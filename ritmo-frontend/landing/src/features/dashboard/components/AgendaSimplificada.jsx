import { useState, useEffect } from 'react'
import { Calendar, Clock, Phone, Stethoscope, User, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function AgendaSimplificada() {
    const [selectedDay, setSelectedDay] = useState(new Date())
    const [showAddEvent, setShowAddEvent] = useState(false)

    // Datos de ejemplo - en producción vendrían de una base de datos
    const [eventos, setEventos] = useState(() => {
        const saved = localStorage.getItem('ritmo_agenda_adulto_mayor')
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                fecha: new Date().toDateString(),
                hora: '09:00',
                tipo: 'medico',
                titulo: 'Cita con el médico de familia',
                descripcion: 'Control rutinario mensual',
                completado: false
            },
            {
                id: 2,
                fecha: new Date(Date.now() + 86400000).toDateString(), // Mañana
                hora: '11:30',
                tipo: 'social',
                titulo: 'Llamar a María',
                descripcion: 'Hablar con la nieta sobre sus estudios',
                completado: false
            },
            {
                id: 3,
                fecha: new Date(Date.now() + 172800000).toDateString(), // Pasado mañana
                hora: '16:00',
                tipo: 'personal',
                titulo: 'Farmacia',
                descripcion: 'Recoger medicación mensual',
                completado: false
            }
        ]
    })

    useEffect(() => {
        localStorage.setItem('ritmo_agenda_adulto_mayor', JSON.stringify(eventos))
    }, [eventos])

    const getEventIcon = (tipo) => {
        switch (tipo) {
            case 'medico': return Stethoscope
            case 'social': return Phone
            case 'personal': return User
            default: return Calendar
        }
    }

    const getEventColor = (tipo) => {
        switch (tipo) {
            case 'medico': return '#EF4444'
            case 'social': return '#10B981'
            case 'personal': return '#6366F1'
            default: return '#6B7280'
        }
    }

    const getEventTypeLabel = (tipo) => {
        switch (tipo) {
            case 'medico': return 'Médico'
            case 'social': return 'Social'
            case 'personal': return 'Personal'
            default: return 'Otro'
        }
    }

    const marcarCompletado = (eventId) => {
        setEventos(eventos.map(evento =>
            evento.id === eventId
                ? { ...evento, completado: !evento.completado }
                : evento
        ))
    }

    const getEventosDelDia = (fecha) => {
        return eventos.filter(evento => evento.fecha === fecha.toDateString())
            .sort((a, b) => a.hora.localeCompare(b.hora))
    }

    const getProximosEventos = () => {
        const hoy = new Date()
        const proximos = eventos
            .filter(evento => {
                const fechaEvento = new Date(evento.fecha)
                return fechaEvento >= hoy && !evento.completado
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fecha + ' ' + a.hora)
                const fechaB = new Date(b.fecha + ' ' + b.hora)
                return fechaA - fechaB
            })
            .slice(0, 3)

        return proximos
    }

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr)
        const hoy = new Date()
        const mañana = new Date(hoy)
        mañana.setDate(hoy.getDate() + 1)

        if (fecha.toDateString() === hoy.toDateString()) {
            return 'Hoy'
        } else if (fecha.toDateString() === mañana.toDateString()) {
            return 'Mañana'
        } else {
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            })
        }
    }

    return (
        <motion.div
            className="widget-card agenda-simplificada"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Calendar size={20} className="widget-icon" />
                    <h3>Mi Agenda</h3>
                </div>
                <button
                    onClick={() => setShowAddEvent(!showAddEvent)}
                    className="add-event-btn"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="agenda-content">
                {/* Próximos eventos destacados */}
                <div className="proximos-eventos">
                    <h4>Próximas cosas importantes:</h4>
                    {getProximosEventos().length === 0 ? (
                        <div className="no-events">
                            <p>¡Genial! No tienes citas pendientes 😊</p>
                        </div>
                    ) : (
                        <div className="eventos-lista">
                            {getProximosEventos().map((evento, index) => {
                                const EventIcon = getEventIcon(evento.tipo)

                                return (
                                    <motion.div
                                        key={evento.id}
                                        className="evento-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => marcarCompletado(evento.id)}
                                    >
                                        <div className="evento-time-info">
                                            <div
                                                className="evento-icon"
                                                style={{ backgroundColor: getEventColor(evento.tipo) }}
                                            >
                                                <EventIcon size={16} />
                                            </div>
                                            <div className="time-details">
                                                <span className="day-label">
                                                    {formatearFecha(evento.fecha)}
                                                </span>
                                                <span className="hour-label">{evento.hora}</span>
                                            </div>
                                        </div>

                                        <div className="evento-details">
                                            <h5>{evento.titulo}</h5>
                                            <p>{evento.descripcion}</p>
                                            <span className="event-type-badge">
                                                {getEventTypeLabel(evento.tipo)}
                                            </span>
                                        </div>

                                        <div className="evento-actions">
                                            <button
                                                className={`complete-btn ${evento.completado ? 'completed' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    marcarCompletado(evento.id)
                                                }}
                                            >
                                                {evento.completado ? '✓ Hecho' : 'Marcar'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Recordatorios importantes */}
                <div className="recordatorios-importantes">
                    <h4>💡 Recordatorios útiles:</h4>
                    <div className="recordatorios-lista">
                        <div className="recordatorio-item">
                            <Clock size={16} />
                            <span>Las recetas médicas se renuevan cada mes</span>
                        </div>
                        <div className="recordatorio-item">
                            <Phone size={16} />
                            <span>Es bueno llamar a familia/amigos regularmente</span>
                        </div>
                        <div className="recordatorio-item">
                            <Stethoscope size={16} />
                            <span>Controles médicos: mejor por la mañana</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas simples */}
                <div className="agenda-estadisticas">
                    <div className="stat-simple">
                        <span className="num">{eventos.filter(e => e.completado).length}</span>
                        <span className="label">Tareas completadas esta semana</span>
                    </div>
                    <div className="stat-simple">
                        <span className="num">{getProximosEventos().length}</span>
                        <span className="label">Citas pendientes</span>
                    </div>
                </div>
            </div>

            <div className="agenda-footer">
                <small>📱 Toca cualquier evento para marcarlo como completado</small>
            </div>
        </motion.div>
    )
}