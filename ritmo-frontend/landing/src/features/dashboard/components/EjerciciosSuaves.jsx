import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './WidgetsShared.css'

export default function EjerciciosSuaves() {
    const [currentExercise, setCurrentExercise] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30)
    const [restTime, setRestTime] = useState(false)

    const ejercicios = [
        {
            id: 1,
            nombre: "Movimientos de cuello",
            descripcion: "Gira suavemente el cuello hacia la derecha, mantén 3 segundos, luego hacia la izquierda",
            duracion: 30,
            instrucciones: [
                "Siéntate cómodo con la espalda recta",
                "Gira lentamente la cabeza hacia la derecha",
                "Mantén la posición 3 segundos",
                "Regresa al centro y gira hacia la izquierda",
                "Repite suavemente sin forzar"
            ],
            beneficios: "Reduce tensión cervical y mejora movilidad",
            precauciones: "No fuerces si sientes dolor"
        },
        {
            id: 2,
            nombre: "Círculos con los hombros",
            descripcion: "Mueve los hombros en círculos hacia adelante y hacia atrás para relajar la tensión",
            duracion: 30,
            instrucciones: [
                "Mantén los brazos relajados a los lados",
                "Levanta los hombros hacia las orejas",
                "Gíralos hacia adelante en círculo",
                "Haz 5 círculos hacia adelante",
                "Cambia dirección: 5 círculos hacia atrás"
            ],
            beneficios: "Alivia tensión en hombros y mejora circulación",
            precauciones: "Movimientos lentos y controlados"
        },
        {
            id: 3,
            nombre: "Flexión de brazos suave",
            descripcion: "Dobla y extiende los brazos para mantener la flexibilidad de los codos",
            duracion: 30,
            instrucciones: [
                "Extiende los brazos hacia adelante",
                "Dobla lentamente los codos",
                "Lleva las manos hacia los hombros",
                "Extiende nuevamente",
                "Repite el movimiento suavemente"
            ],
            beneficios: "Mantiene movilidad de brazos y codos",
            precauciones: "Sin movimientos bruscos"
        },
        {
            id: 4,
            nombre: "Rotación de muñecas",
            descripción: "Gira las muñecas para mejorar la circulación en manos y antebrazos",
            duracion: 30,
            instrucciones: [
                "Extiende los brazos hacia adelante",
                "Gira las muñecas lentamente en círculo",
                "10 círculos hacia una dirección",
                "Cambia la dirección",
                "10 círculos hacia el otro lado"
            ],
            beneficios: "Mejora circulación y reduce rigidez",
            precauciones: "Movimientos suaves y lentos"
        },
        {
            id: 5,
            nombre: "Marcha sentado",
            descripcion: "Simula caminar mientras estás sentado para activar las piernas",
            duracion: 30,
            instrucciones: [
                "Siéntate con los pies apoyados en el suelo",
                "Levanta alternadamente cada rodilla",
                "Como si estuvieras marchando sentado",
                "Mantén la espalda recta",
                "Ritmo cómodo y natural"
            ],
            beneficios: "Activa circulación en las piernas",
            precauciones: "Mantén equilibrio en la silla"
        },
        {
            id: 6,
            nombre: "Respiración profunda",
            descripcion: "Ejercicio de respiración para relajar y oxigenar el cuerpo",
            duracion: 30,
            instrucciones: [
                "Siéntate cómodo con espalda recta",
                "Inhala lentamente por la nariz (4 segundos)",
                "Mantén el aire (2 segundos)",
                "Exhala lentamente por la boca (6 segundos)",
                "Repite el ciclo sintiendo la relajación"
            ],
            beneficios: "Reduce estrés y mejora oxigenación",
            precauciones: "No fuerces la respiración"
        }
    ]

    useEffect(() => {
        let interval = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            if (!restTime && currentExercise < ejercicios.length - 1) {
                // Tiempo de descanso entre ejercicios
                setRestTime(true)
                setTimeLeft(10)
                setIsActive(true)
            } else if (restTime) {
                // Pasar al siguiente ejercicio
                setRestTime(false)
                nextExercise()
            }
        }

        return () => clearInterval(interval)
    }, [isActive, timeLeft, restTime, currentExercise, ejercicios.length])

    const startStop = () => {
        setIsActive(!isActive)
    }

    const reset = () => {
        setTimeLeft(ejercicios[currentExercise].duracion)
        setIsActive(false)
        setRestTime(false)
    }

    const nextExercise = () => {
        if (currentExercise < ejercicios.length - 1) {
            setCurrentExercise(currentExercise + 1)
            setTimeLeft(ejercicios[currentExercise + 1].duracion)
            setIsActive(false)
            setRestTime(false)
        }
    }

    const prevExercise = () => {
        if (currentExercise > 0) {
            setCurrentExercise(currentExercise - 1)
            setTimeLeft(ejercicios[currentExercise - 1].duracion)
            setIsActive(false)
            setRestTime(false)
        }
    }

    const currentEj = ejercicios[currentExercise]

    return (
        <motion.div
            className="widget-card ejercicios-suaves"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Heart size={20} className="widget-icon" />
                    <h3>Ejercicios Suaves Guiados</h3>
                </div>
                <div className="exercise-counter">
                    {currentExercise + 1} de {ejercicios.length}
                </div>
            </div>

            {restTime ? (
                <motion.div
                    className="rest-screen"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="rest-content">
                        <h3>¡Descansa!</h3>
                        <p>Respira tranquilo antes del siguiente ejercicio</p>
                        <div className="rest-timer">
                            <span className="time-display">{timeLeft}s</span>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentExercise}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="exercise-content"
                    >
                        <div className="exercise-header">
                            <h4>{currentEj.nombre}</h4>
                            <p className="exercise-description">{currentEj.descripcion}</p>
                        </div>

                        <div className="timer-section">
                            <div className={`circular-timer ${isActive ? 'active' : ''}`}>
                                <div className="timer-display">
                                    <span className="time-text">{timeLeft}s</span>
                                </div>
                            </div>

                            <div className="timer-controls">
                                <button
                                    onClick={startStop}
                                    className={`play-pause-btn ${isActive ? 'pause' : 'play'}`}
                                >
                                    {isActive ? <Pause size={18} /> : <Play size={18} />}
                                    {isActive ? 'Pausar' : 'Empezar'}
                                </button>

                                <button
                                    onClick={reset}
                                    className="reset-btn"
                                >
                                    <RotateCcw size={16} />
                                    Reiniciar
                                </button>
                            </div>
                        </div>

                        <div className="exercise-instructions">
                            <h5>Instrucciones paso a paso:</h5>
                            <ol>
                                {currentEj.instrucciones.map((paso, index) => (
                                    <li key={index}>{paso}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="exercise-info">
                            <div className="benefits">
                                <strong>Beneficios:</strong> {currentEj.beneficios}
                            </div>
                            <div className="precautions">
                                <strong>⚠️ Precauciones:</strong> {currentEj.precauciones}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            <div className="exercise-navigation">
                <button
                    onClick={prevExercise}
                    disabled={currentExercise === 0}
                    className="nav-btn prev"
                >
                    ← Anterior
                </button>

                <div className="exercise-dots">
                    {ejercicios.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentExercise ? 'active' : ''} ${index < currentExercise ? 'completed' : ''}`}
                            onClick={() => {
                                setCurrentExercise(index)
                                setTimeLeft(ejercicios[index].duracion)
                                setIsActive(false)
                                setRestTime(false)
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={nextExercise}
                    disabled={currentExercise === ejercicios.length - 1}
                    className="nav-btn next"
                >
                    Siguiente →
                </button>
            </div>

            <div className="exercise-footer">
                <small>💡 Recuerda: siempre a tu ritmo, sin forzar movimientos</small>
            </div>
        </motion.div>
    )
}