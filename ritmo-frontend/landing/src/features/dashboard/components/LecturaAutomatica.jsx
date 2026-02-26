import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Bell, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function LecturaAutomatica() {
    const [autoPlay, setAutoPlay] = useState(() => {
        const saved = localStorage.getItem('ritmo_auto_read_enabled')
        return saved ? JSON.parse(saved) : true
    })

    const [voiceSpeed, setVoiceSpeed] = useState(() => {
        const saved = localStorage.getItem('ritmo_voice_speed')
        return saved ? parseFloat(saved) : 0.8
    })

    const [currentReading, setCurrentReading] = useState(null)

    const [notificaciones, setNotificaciones] = useState([
        {
            id: 1,
            tipo: 'accesibilidad',
            titulo: 'Actualización de lector de pantalla',
            mensaje: 'Hay una nueva versión disponible de tu lector de pantalla. La actualización incluye mejoras de navegación web.',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            prioridad: 'alta',
            leido: false
        },
        {
            id: 2,
            tipo: 'transporte',
            titulo: 'Información de transporte',
            mensaje: 'El autobús línea 47 tiene un retraso de 5 minutos. Próximo autobús en la parada Gran Vía llegará a las 10:15',
            hora: '09:30',
            prioridad: 'media',
            leido: false
        },
        {
            id: 3,
            tipo: 'navegacion',
            titulo: 'Ruta guardada disponible',
            mensaje: 'Tu ruta habitual al centro de salud está libre de obstáculos. Tiempo estimado: 15 minutos caminando.',
            hora: '08:00',
            prioridad: 'media',
            leido: true
        },
        {
            id: 4,
            tipo: 'evento',
            titulo: 'Evento accesible hoy',
            mensaje: 'Taller de tecnología inclusiva en la biblioteca municipal a las 16:00. Cuenta con descripción auditiva.',
            hora: '07:45',
            prioridad: 'baja',
            leido: true
        }
    ])

    useEffect(() => {
        localStorage.setItem('ritmo_auto_read_enabled', JSON.stringify(autoPlay))
    }, [autoPlay])

    useEffect(() => {
        localStorage.setItem('ritmo_voice_speed', voiceSpeed.toString())
    }, [voiceSpeed])

    // Auto-leer nuevas notificaciones importantes
    useEffect(() => {
        if (autoPlay) {
            const notificacionesImportantes = notificaciones.filter(
                n => !n.leido && n.prioridad === 'alta'
            )

            if (notificacionesImportantes.length > 0) {
                // Leer la primera notificación importante no leída
                const primera = notificacionesImportantes[0]
                setTimeout(() => {
                    leerNotificacion(primera)
                }, 1000) // Delay para evitar lectura inmediata al cargar
            }
        }
    }, [notificaciones, autoPlay])

    const leerNotificacion = (notificacion) => {
        if ('speechSynthesis' in window) {
            // Detener cualquier lectura previa
            speechSynthesis.cancel()

            const texto = `${notificacion.titulo}. ${notificacion.mensaje}`
            const utterance = new SpeechSynthesisUtterance(texto)

            utterance.lang = 'es-ES'
            utterance.rate = voiceSpeed
            utterance.pitch = 1
            utterance.volume = 1

            utterance.onstart = () => {
                setCurrentReading(notificacion.id)
            }

            utterance.onend = () => {
                setCurrentReading(null)
                // Marcar como leída
                marcarComoLeida(notificacion.id)
            }

            speechSynthesis.speak(utterance)
        }
    }

    const detenerLectura = () => {
        speechSynthesis.cancel()
        setCurrentReading(null)
    }

    const marcarComoLeida = (notificationId) => {
        setNotificaciones(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, leido: true } : n
            )
        )
    }

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return '#EF4444'
            case 'media': return '#F59E0B'
            case 'baja': return '#10B981'
            default: return '#6B7280'
        }
    }

    const getPrioridadText = (prioridad) => {
        switch (prioridad) {
            case 'alta': return 'Importante'
            case 'media': return 'Normal'
            case 'baja': return 'Info'
            default: return ''
        }
    }

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leido)

    return (
        <motion.div
            className="widget-card lectura-automatica dashboard-visual-enhanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Bell size={20} className="widget-icon" />
                    <h3>Asistente de Notificaciones</h3>
                </div>
                <div className="notif-header-badge">
                    {notificacionesNoLeidas.length > 0 && (
                        <span className="unread-pill">{notificacionesNoLeidas.length} nuevas</span>
                    )}
                    <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`auto-read-toggle ${autoPlay ? 'active' : ''}`}
                        aria-label={autoPlay ? 'Desactivar anuncios automáticos' : 'Activar anuncios automáticos'}
                    >
                        {autoPlay ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </div>
            </div>

            <div className="auto-read-status">
                <div className="status-info">
                    <span className={`status-indicator ${autoPlay ? 'active' : 'inactive'}`} />
                    <span className="status-text">
                        Anuncio automático: <strong>{autoPlay ? 'Activado' : 'Desactivado'}</strong>
                    </span>
                </div>
            </div>

            <div className="voice-settings">
                <div className="setting-group">
                    <label htmlFor="voice-speed">Velocidad de síntesis de voz:</label>
                    <div className="speed-control">
                        <input
                            id="voice-speed"
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={voiceSpeed}
                            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                            className="speed-slider"
                        />
                        <span className="speed-label">
                            {voiceSpeed}x {voiceSpeed < 0.7 ? '(Lenta)' : voiceSpeed > 1.2 ? '(Rápida)' : '(Normal)'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="notifications-list">
                <h4>Notificaciones recientes:</h4>

                {notificaciones.length === 0 ? (
                    <div className="no-notifications">
                        <p>No hay notificaciones en este momento</p>
                    </div>
                ) : (
                    <div className="notifications-container">
                        {notificaciones.map((notificacion, index) => (
                            <motion.div
                                key={notificacion.id}
                                className={`notification-item ${!notificacion.leido ? 'unread' : 'read'} ${currentReading === notificacion.id ? 'reading' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="notification-header">
                                    <div className="notification-meta">
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPrioridadColor(notificacion.prioridad) }}
                                        >
                                            {getPrioridadText(notificacion.prioridad)}
                                        </span>
                                        <span className="notification-time">{notificacion.hora}</span>
                                    </div>

                                    <div className="notification-actions">
                                        {currentReading === notificacion.id ? (
                                            <button
                                                onClick={detenerLectura}
                                                className="stop-reading-btn"
                                                aria-label="Detener anuncio"
                                            >
                                                <VolumeX size={18} />
                                                Parar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => leerNotificacion(notificacion)}
                                                className="read-btn"
                                                aria-label="Escuchar notificación"
                                            >
                                                <Volume2 size={18} />
                                                Escuchar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="notification-content">
                                    <h5>{notificacion.titulo}</h5>
                                    <p>{notificacion.mensaje}</p>
                                </div>

                                {!notificacion.leido && (
                                    <div className="unread-indicator">
                                        <span className="unread-dot" />
                                        <span className="unread-text">Nueva</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="reading-footer">
                <small>
                    🔊 La lectura automática te ayuda a mantenerte informado sin esfuerzo visual
                </small>
            </div>
        </motion.div>
    )
}