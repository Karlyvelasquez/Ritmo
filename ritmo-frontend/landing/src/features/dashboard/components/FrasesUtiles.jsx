import { useState, useEffect } from 'react'
import { ChevronRight, Volume2, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './WidgetsShared.css'

export default function FrasesUtiles() {
    const [currentPhrase, setCurrentPhrase] = useState(0)
    const [showTranslation, setShowTranslation] = useState(false)

    const frasesUtil = [
        {
            situacion: "Expresión cotidiana",
            frase: "Estar en las nubes",
            significado: "Estar distraído o pensando en cosas irreales.",
            pronunciacion: "es-TAR en las NU-bes"
        },
        {
            situacion: "Expresión de facilidad",
            frase: "Ser pan comido",
            significado: "Se dice cuando algo es muy fácil de hacer.",
            pronunciacion: "SER PAN ko-MI-do"
        },
        {
            situacion: "Expresión de ayuda",
            frase: "Echar una mano",
            significado: "Ayudar a otra persona con una tarea.",
            pronunciacion: "e-CHAR U-na MA-no"
        },
        {
            situacion: "Expresión de confusión",
            frase: "Hacerse un lío",
            significado: "Confundirse o no entender algo.",
            pronunciacion: "a-SER-se un LI-o"
        },
        {
            situacion: "Expresión de honestidad",
            frase: "No tener pelos en la lengua",
            significado: "Decir la verdad de forma directa y sincera.",
            pronunciacion: "no te-NER PE-los en la LEN-gwa"
        },
        {
            situacion: "Expresión de abundancia",
            frase: "Ponerse las botas",
            significado: "Disfrutar mucho de una comida o situación.",
            pronunciacion: "po-NER-se las BO-tas"
        }
    ]

    const currentFrase = frasesUtil[currentPhrase]

    const nextPhrase = () => {
        setCurrentPhrase((prev) => (prev + 1) % frasesUtil.length)
        setShowTranslation(false)
    }

    const playAudio = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentFrase.frase)
            utterance.lang = 'es-ES'
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
        }
    }

    return (
        <motion.div
            className="widget-card frases-utiles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <BookOpen size={20} className="widget-icon" />
                    <h3>Frase Útil del Día</h3>
                </div>
                <span className="situation-badge">{currentFrase.situacion}</span>
            </div>

            <div className="phrase-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPhrase}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="phrase-content"
                    >
                        <div className="main-phrase">
                            <p className="spanish-phrase">{currentFrase.frase}</p>
                            <button
                                onClick={playAudio}
                                className="audio-btn"
                                title="Escuchar pronunciación"
                            >
                                <Volume2 size={18} />
                            </button>
                        </div>

                        <div className="pronunciation">
                            <small>Pronunciación: {currentFrase.pronunciacion}</small>
                        </div>

                        {showTranslation && (
                            <motion.div
                                className="translation"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <p className="phrase-meaning">{currentFrase.significado}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="phrase-actions">
                <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="toggle-translation"
                >
                    {showTranslation ? 'Ocultar' : 'Ver'} significado
                </button>

                <button
                    onClick={nextPhrase}
                    className="next-phrase"
                >
                    Siguiente frase <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    )
}