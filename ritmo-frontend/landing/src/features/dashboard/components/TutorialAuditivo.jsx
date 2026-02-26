import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function TutorialAuditivo() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasStarted, setHasStarted] = useState(() => {
        const saved = localStorage.getItem('ritmo_tutorial_started')
        return saved ? JSON.parse(saved) : false
    })
    const [completedSteps, setCompletedSteps] = useState(() => {
        const saved = localStorage.getItem('ritmo_tutorial_completed')
        return saved ? JSON.parse(saved) : []
    })
    const [voiceSpeed, setVoiceSpeed] = useState(() => {
        const saved = localStorage.getItem('ritmo_tutorial_voice_speed')
        return saved ? parseFloat(saved) : 0.7
    })

    const tutorialSteps = [
        {
            id: 1,
            titulo: "Bienvenida a RITMO",
            contenido: "Hola, bienvenido a RITMO, tu compañero personal de bienestar. Esta aplicación está diseñada especialmente para ser totalmente accesible mediante voz. Yo te guiaré paso a paso para que aprendas a usar todas las funciones.",
            duracion: 8000,
            instruccion: "Escucha esta introducción completa"
        },
        {
            id: 2,
            titulo: "Navegación por voz",
            contenido: "Puedes navegar por toda la aplicación usando tu voz. Di 'RITMO' seguido de lo que quieres hacer. Por ejemplo: 'RITMO, leer notificaciones' o 'RITMO, comenzar ejercicios'. La aplicación te responderá siempre con voz clara.",
            duracion: 12000,
            instruccion: "Importante: memoriza el comando 'RITMO' más tu petición"
        },
        {
            id: 3,
            titulo: "Botones y controles",
            contenido: "Todos los botones tienen descripciones de voz. Cuando pases el cursor sobre cualquier botón, escucharás su función. Los botones principales son más grandes para facilitar el toque. Usa las teclas de dirección para moverte entre elementos.",
            duracion: 10000,
            instruccion: "Prueba a moverte con las flechas del teclado"
        },
        {
            id: 4,
            titulo: "Notificaciones importantes",
            contenido: "Las notificaciones importantes se leen automáticamente en cuanto aparecen. No te perderás recordatorios de medicación, citas médicas o mensajes urgentes de familia. Puedes pausar este sistema si lo necesitas.",
            duracion: 9000,
            instruccion: "Las notificaciones importantes se leen solas"
        },
        {
            id: 5,
            titulo: "Rutina diaria guiada",
            contenido: "Tu rutina diaria incluye ejercicios suaves explicados paso a paso por voz. Cada ejercicio te dice exactamente qué hacer, cuánto tiempo hacerlo y cuándo parar. Todo sin necesidad de mirar la pantalla.",
            duracion: 10000,
            instruccion: "Los ejercicios se explican completamente por voz"
        },
        {
            id: 6,
            titulo: "Agenda simplificada",
            contenido: "Tu agenda lee en voz alta tus citas y recordatorios. Te dice qué tienes hoy, mañana y esta semana. Puedes marcar tareas como completadas hablando o tocando.",
            duracion: 8000,
            instruccion: "La agenda habla tus citas en orden"
        },
        {
            id: 7,
            titulo: "Control de velocidad de voz",
            contenido: "Puedes ajustar la velocidad de lectura desde muy lenta hasta normal según tu preferencia. Ve a configuración y ajusta el control deslizante de velocidad. También puedes pedir que repita cualquier información.",
            duracion: 9000,
            instrucción: "Ajusta la velocidad en configuración"
        },
        {
            id: 8,
            titulo: "Conseguir ayuda",
            contenido: "Si necesitas ayuda en cualquier momento, di 'RITMO, ayuda' y te explicaré cómo hacer lo que necesites. También puedes decir 'RITMO, repetir' para que repita la última información importante.",
            duracion: 8000,
            instruccion: "Di 'RITMO, ayuda' cuando lo necesites"
        },
        {
            id: 9,
            titulo: "¡Listo para empezar!",
            contenido: "Ya tienes todo lo necesario para usar RITMO de forma completamente independiente. Recuerda: todo funciona por voz, los botones son grandes, y siempre habrá ayuda disponible. ¡Bienvenido a tu nuevo compañero de bienestar!",
            duracion: 10000,
            instruccion: "Tutorial completado - ¡ya puedes usar RITMO!"
        }
    ]

    const currentTutorialStep = tutorialSteps[currentStep]

    useEffect(() => {
        localStorage.setItem('ritmo_tutorial_started', JSON.stringify(hasStarted))
    }, [hasStarted])

    useEffect(() => {
        localStorage.setItem('ritmo_tutorial_completed', JSON.stringify(completedSteps))
    }, [completedSteps])

    useEffect(() => {
        localStorage.setItem('ritmo_tutorial_voice_speed', voiceSpeed.toString())
    }, [voiceSpeed])

    const leerPaso = (paso) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel() // Detener cualquier lectura previa

            const texto = `${paso.titulo}. ${paso.contenido}. ${paso.instruccion}`
            const utterance = new SpeechSynthesisUtterance(texto)

            utterance.lang = 'es-ES'
            utterance.rate = voiceSpeed
            utterance.pitch = 1
            utterance.volume = 1

            utterance.onstart = () => setIsPlaying(true)
            utterance.onend = () => {
                setIsPlaying(false)
                if (!completedSteps.includes(paso.id)) {
                    setCompletedSteps(prev => [...prev, paso.id])
                }
            }

            speechSynthesis.speak(utterance)
        }
    }

    const detenerLectura = () => {
        speechSynthesis.cancel()
        setIsPlaying(false)
    }

    const siguientePaso = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1)
            detenerLectura()
        }
    }

    const pasoAnterior = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            detenerLectura()
        }
    }

    const iniciarTutorial = () => {
        setHasStarted(true)
        setCurrentStep(0)
        leerPaso(tutorialSteps[0])
    }

    const progreso = ((completedSteps.length) / tutorialSteps.length) * 100

    if (!hasStarted) {
        return (
            <motion.div
                className="widget-card tutorial-auditivo-intro dashboard-visual-enhanced"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="widget-header">
                    <div className="header-left">
                        <HelpCircle size={20} className="widget-icon" />
                        <h3>Guía de Voz Inicial</h3>
                    </div>
                </div>

                <div className="tutorial-intro">
                    <div className="intro-content">
                        <h4>¡Hola! Soy tu guía de voz de RITMO</h4>
                        <p>Te voy a enseñar paso a paso cómo usar esta aplicación completamente por voz, sin necesidad de ver la pantalla.</p>

                        <div className="tutorial-features">
                            <div className="feature-item">
                                <Volume2 size={20} />
                                <span>Todo se explica por voz</span>
                            </div>
                            <div className="feature-item">
                                <Play size={20} />
                                <span>Controles simples y grandes</span>
                            </div>
                            <div className="feature-item">
                                <HelpCircle size={20} />
                                <span>Ayuda siempre disponible</span>
                            </div>
                        </div>

                        <p>El tutorial dura aproximadamente 5 minutos y puedes pausar cuando necesites.</p>
                    </div>

                    <div className="tutorial-actions">
                        <button
                            onClick={iniciarTutorial}
                            className="start-tutorial-btn"
                            autoFocus
                        >
                            <Play size={20} />
                            Comenzar Tutorial de Voz
                        </button>

                        <button
                            onClick={() => setHasStarted(true)}
                            className="skip-tutorial-btn"
                        >
                            Saltar tutorial (no recomendado)
                        </button>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="widget-card tutorial-auditivo dashboard-visual-enhanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <HelpCircle size={20} className="widget-icon" />
                    <h3>Tutorial Guiado por Voz</h3>
                </div>
                <div className="tutorial-progress">
                    Paso {currentStep + 1} / {tutorialSteps.length}
                </div>
            </div>

            {/* Dots para cada paso */}
            <div className="tutorial-step-dots">
                {tutorialSteps.map((step, index) => (
                    <button
                        key={step.id}
                        className={`tutorial-dot ${completedSteps.includes(step.id) ? 'done' :
                            index === currentStep ? 'active' : 'pending'
                            }`}
                        onClick={() => { setCurrentStep(index); detenerLectura() }}
                        title={step.titulo}
                        aria-label={`Paso ${index + 1}: ${step.titulo}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso}%` }}
                        style={{ backgroundColor: '#8B5CF6' }}
                    />
                </div>
                <p className="progress-text">{Math.round(progreso)}% completado</p>
            </div>

            <div className="tutorial-content">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="current-step"
                >
                    <div className="step-header">
                        <h4>{currentTutorialStep.titulo}</h4>
                        {completedSteps.includes(currentTutorialStep.id) && (
                            <span className="completed-badge">✓ Completado</span>
                        )}
                    </div>

                    <div className="step-content">
                        <p className="step-text">{currentTutorialStep.contenido}</p>
                        <div className="step-instruction">
                            <strong>Instrucción:</strong> {currentTutorialStep.instruccion}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="tutorial-controls">
                <div className="playback-controls">
                    <button
                        onClick={pasoAnterior}
                        disabled={currentStep === 0}
                        className="nav-btn prev"
                        aria-label="Paso anterior"
                    >
                        <SkipBack size={20} />
                        Anterior
                    </button>

                    <button
                        onClick={isPlaying ? detenerLectura : () => leerPaso(currentTutorialStep)}
                        className={`play-pause-btn ${isPlaying ? 'pause' : 'play'}`}
                        aria-label={isPlaying ? 'Pausar lectura' : 'Reproducir paso'}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        {isPlaying ? 'Pausar' : 'Reproducir'}
                    </button>

                    <button
                        onClick={siguientePaso}
                        disabled={currentStep === tutorialSteps.length - 1}
                        className="nav-btn next"
                        aria-label="Siguiente paso"
                    >
                        Siguiente
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="voice-settings" style={{ marginTop: '0.75rem' }}>
                    <div className="speed-control">
                        <Volume2 size={14} style={{ color: '#8B5CF6', flexShrink: 0 }} />
                        <span className="speed-label">Velocidad de voz</span>
                        <input
                            type="range"
                            min="0.4"
                            max="1.5"
                            step="0.1"
                            value={voiceSpeed}
                            onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                            className="speed-slider"
                            style={{ accentColor: '#8B5CF6' }}
                            aria-label="Velocidad de voz"
                        />
                        <span className="speed-value">
                            {voiceSpeed <= 0.5 ? 'Lenta' : voiceSpeed <= 0.9 ? 'Normal' : 'Rápida'}
                        </span>
                    </div>
                </div>

                <div className="tutorial-help">
                    <small>
                        💡 Usa las flechas del teclado para navegar o los botones grandes
                    </small>
                </div>
            </div>

            {currentStep === tutorialSteps.length - 1 && (
                <div className="tutorial-completion">
                    <h4>🎉 ¡Tutorial completado!</h4>
                    <p>Ya puedes usar RITMO de forma completamente independiente.</p>
                </div>
            )}
        </motion.div>
    )
}