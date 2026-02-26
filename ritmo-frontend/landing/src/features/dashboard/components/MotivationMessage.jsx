import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import './MotivationMessage.css'

const messages = [
    { text: "Cada día que amanece es una nueva oportunidad de hacer algo bonito.", author: "Proverbio" },
    { text: "La edad no nos impide soñar, nos da la sabiduría de apreciar los sueños.", author: "Anónimo" },
    { text: "No es lo que tienes en la vida, sino a quién tienes en la vida lo que importa.", author: "Anónimo" },
    { text: "La experiencia no es lo que te pasa, sino lo que haces con lo que te pasa.", author: "Aldous Huxley" },
    { text: "El secreto de mantenerse joven es vivir honestamente, comer despacio y mentir sobre la edad.", author: "Lucille Ball" },
    { text: "Las arrugas deberían solamente indicar dónde han estado las sonrisas.", author: "Mark Twain" },
    { text: "No importa cuántos años tengas, sino cuántos años tienes por delante.", author: "Anónimo" },
    { text: "Envejecer es obligatorio, crecer es opcional.", author: "Chili Davis" },
]

export default function MotivationMessage() {
    const [index, setIndex] = useState(() => Math.floor(Math.random() * messages.length))
    const [animating, setAnimating] = useState(false)

    const next = () => {
        setAnimating(true)
        setTimeout(() => {
            setIndex(prev => (prev + 1) % messages.length)
            setAnimating(false)
        }, 300)
    }

    const msg = messages[index]

    return (
        <div className="motivation-card">
            <div className="motivation-top">
                <span className="motivation-badge">Mensaje del día</span>
                <button className="motivation-refresh" onClick={next} title="Siguiente mensaje">
                    <RefreshCw size={16} />
                </button>
            </div>
            <div className={`motivation-body ${animating ? 'fading' : ''}`}>
                <p className="motivation-quote">"{msg.text}"</p>
                <span className="motivation-author">— {msg.author}</span>
            </div>
        </div>
    )
}
