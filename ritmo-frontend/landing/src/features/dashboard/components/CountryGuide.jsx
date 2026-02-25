import { MapPin, Phone, FileText, Heart } from 'lucide-react'
import './CountryGuide.css'

const sections = [
    {
        icon: Phone,
        color: '#EF4444',
        title: 'Números de emergencia',
        items: [
            { label: 'Emergencias generales', value: '112' },
            { label: 'Policía Nacional', value: '091' },
            { label: 'Ambulancia / Urgencias', value: '061' },
            { label: 'Cruz Roja', value: '900 22 22 92' },
        ]
    },
    {
        icon: FileText,
        color: '#6366F1',
        title: 'Trámites esenciales',
        items: [
            { label: 'NIE (Número Identidad Extranjero)', value: 'Oficina de Extranjería' },
            { label: 'Tarjeta Sanitaria', value: 'Centro de Salud local' },
            { label: 'Empadronamiento', value: 'Ayuntamiento de tu ciudad' },
            { label: 'Cuenta bancaria', value: 'Banco + NIE o pasaporte' },
        ]
    },
    {
        icon: Heart,
        color: '#0EA5E9',
        title: 'Apoyo y recursos',
        items: [
            { label: 'Cruz Roja – Inmigrantes', value: 'voluntariado.cruzroja.es' },
            { label: 'Cáritas – Integración social', value: 'caritas.es' },
            { label: 'CEAR – Refugio y asilo', value: 'cear.es' },
            { label: 'Médicos del Mundo', value: 'medicosdelmundo.es' },
        ]
    },
    {
        icon: MapPin,
        color: '#10B981',
        title: 'Datos útiles de España',
        items: [
            { label: 'Idioma oficial', value: 'Español (Castellano)' },
            { label: 'Moneda', value: 'Euro (€)' },
            { label: 'Huso horario', value: 'CET (UTC+1) / CEST (UTC+2)' },
            { label: 'Sanidad', value: 'Sistema público (gratuito con tarjeta)' },
        ]
    }
]

export default function CountryGuide() {
    return (
        <div className="country-guide-card">
            <div className="country-guide-title">
                <span className="country-flag">🇪🇸</span>
                <div>
                    <h3>Guía rápida de España</h3>
                    <p>Información esencial para tu llegada</p>
                </div>
            </div>

            <div className="country-guide-sections">
                {sections.map((section, i) => {
                    const Icon = section.icon
                    return (
                        <div key={i} className="guide-section">
                            <div className="guide-section-header">
                                <div className="guide-section-icon" style={{ background: section.color }}>
                                    <Icon size={16} />
                                </div>
                                <h4>{section.title}</h4>
                            </div>
                            <div className="guide-section-items">
                                {section.items.map((item, j) => (
                                    <div key={j} className="guide-item">
                                        <span className="guide-item-label">{item.label}</span>
                                        <span className="guide-item-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
