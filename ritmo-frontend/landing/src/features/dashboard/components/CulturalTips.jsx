import { useState } from 'react'
import { Lightbulb, ChevronRight } from 'lucide-react'
import './CulturalTips.css'

const tips = [
    { id: 1, icon: '🕐', title: 'Los horarios son diferentes', text: 'En España se come entre las 14:00 y las 16:00 y se cena tarde, alrededor de las 21:00 o incluso más. Es normal.' },
    { id: 2, icon: '☕', title: 'El café es un ritual social', text: 'Tomar "un café" es una excusa para quedar y charlar. Pide "un cortado" o "café con leche" y encajarás perfectamente.' },
    { id: 3, icon: '🤝', title: 'Los saludos con dos besos', text: 'En España es costumbre saludar con dos besos en las mejillas (derecha primero) entre conocidos, incluso en el primer encuentro.' },
    { id: 4, icon: '🔊', title: 'El volumen es más alto', text: 'Los españoles hablan en voz más alta de lo que puedes estar acostumbrado/a. No se está discutiendo, simplemente es el tono habitual.' },
    { id: 5, icon: '🏪', title: 'Los comercios cierran a mediodía', text: 'Muchas tiendas pequeñas cierran entre las 14:00 y las 17:00. Planifica tus compras con esto en mente.' },
    { id: 6, icon: '💬', title: '"Tutear" es lo normal', text: 'En España es habitual tratar de "tú" a casi todos, incluso en contextos laborales informales. El "usted" se reserva para personas mayores o muy formales.' },
]

export default function CulturalTips() {
    const [expanded, setExpanded] = useState(null)

    return (
        <div className="cultural-tips-card">
            <div className="cultural-tips-header">
                <div className="cultural-tips-icon-wrap">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h3>Tips culturales 🇪🇸</h3>
                    <p>Costumbres que te ayudarán a adaptarte</p>
                </div>
            </div>

            <div className="cultural-tips-list">
                {tips.map(tip => (
                    <div
                        key={tip.id}
                        className={`cultural-tip-item ${expanded === tip.id ? 'open' : ''}`}
                        onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                    >
                        <div className="cultural-tip-summary">
                            <span className="cultural-tip-emoji">{tip.icon}</span>
                            <span className="cultural-tip-title">{tip.title}</span>
                            <ChevronRight size={16} className="cultural-tip-chevron" />
                        </div>
                        {expanded === tip.id && (
                            <p className="cultural-tip-text">{tip.text}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
