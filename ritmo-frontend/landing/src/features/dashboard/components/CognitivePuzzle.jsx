import { useState } from 'react'
import { Brain, ChevronRight, RefreshCw } from 'lucide-react'
import './CognitivePuzzle.css'

const riddles = [
    { question: "¿Qué tiene dientes pero no puede morder?", answer: "Un peine" },
    { question: "¿Qué es lo que entra por un ojo y sale por otro?", answer: "El hilo de una aguja" },
    { question: "Soy redondo como la luna, blanco como la nieve, en el gato me tiene y me busca la gente. ¿Qué soy?", answer: "Un huevo" },
    { question: "¿Qué tiene el hombre que ningún animal tiene?", answer: "Una suegra" },
    { question: "Cuanto más seca, más moja. ¿Qué es?", answer: "Una toalla" },
    { question: "¿Qué viaja alrededor del mundo pero se queda en un rincón?", answer: "Un sello de correos" },
    { question: "Tengo ciudades pero no casas, tengo montañas pero no árboles, tengo agua pero no peces. ¿Qué soy?", answer: "Un mapa" },
    { question: "¿Qué tiene una cara pero no tiene nariz ni ojos?", answer: "Una moneda" },
    { question: "Soy el principio del fin, el final del tiempo, estoy en cada minuto pero no en los siglos. ¿Qué soy?", answer: "La letra M" },
    { question: "Cuanto más quitas, más grande se hace. ¿Qué es?", answer: "Un agujero" },
]

export default function CognitivePuzzle() {
    const [index, setIndex] = useState(() => Math.floor(Math.random() * riddles.length))
    const [revealed, setRevealed] = useState(false)

    const next = () => {
        setRevealed(false)
        setIndex(prev => (prev + 1) % riddles.length)
    }

    const riddle = riddles[index]

    return (
        <div className="puzzle-card">
            <div className="puzzle-header">
                <div className="puzzle-icon-wrap">
                    <Brain size={20} />
                </div>
                <div>
                    <h3>Ejercicio cognitivo 🧩</h3>
                    <p>Adivinanzas para mantener la mente despierta</p>
                </div>
            </div>

            <div className="puzzle-body">
                <p className="puzzle-question">{riddle.question}</p>

                {!revealed ? (
                    <button className="puzzle-reveal-btn" onClick={() => setRevealed(true)}>
                        <ChevronRight size={18} />
                        Ver respuesta
                    </button>
                ) : (
                    <div className="puzzle-answer">
                        <span className="puzzle-answer-label">Respuesta:</span>
                        <span className="puzzle-answer-text">{riddle.answer}</span>
                    </div>
                )}
            </div>

            <button className="puzzle-next-btn" onClick={next}>
                <RefreshCw size={16} />
                Nueva adivinanza
            </button>
        </div>
    )
}
