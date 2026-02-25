import { useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import './AlertButton.css'

export default function AlertButton() {
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const handleAlert = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => setSent(false), 5000)
        }, 1500)
    }

    return (
        <div className="alert-button-card">
            <div className="alert-button-header">
                <AlertTriangle size={22} className="alert-icon-header" />
                <div>
                    <h3>Asistencia rápida</h3>
                    <p>Avisa a tu responsable si necesitas ayuda</p>
                </div>
            </div>

            {sent ? (
                <div className="alert-sent-notice">
                    <CheckCircle size={28} className="alert-sent-icon" />
                    <div>
                        <strong>¡Alerta enviada!</strong>
                        <p>Tu responsable ha sido notificado. Estaremos contigo enseguida.</p>
                    </div>
                </div>
            ) : (
                <button
                    className={`alert-send-btn ${sending ? 'loading' : ''}`}
                    onClick={handleAlert}
                    disabled={sending}
                >
                    {sending ? (
                        <>
                            <span className="alert-spinner" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={20} />
                            Necesito asistencia
                        </>
                    )}
                </button>
            )}

            <p className="alert-disclaimer">
                Solo pulsa si realmente necesitas ayuda. Tu responsable recibirá una notificación.
            </p>
        </div>
    )
}
