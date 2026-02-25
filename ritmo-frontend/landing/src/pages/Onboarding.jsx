import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Send, User, ChevronRight, CheckCircle, Smartphone } from 'lucide-react'
import './Onboarding.css'

const API_URL = 'http://localhost:8000'

export default function Onboarding() {
    const navigate = useNavigate()
    const { search } = useLocation()
    const mode = new URLSearchParams(search).get('mode') || 'login'

    const [step, setStep] = useState('auth') // 'auth', 'chat', 'success'
    const [isLogin, setIsLogin] = useState(mode === 'login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Forms
    const [form, setForm] = useState({
        nombre: '',
        telegram_id: '',
        codigo_secreto: ''
    })

    // Chat
    const [messages, setMessages] = useState([])
    const [currentResponse, setCurrentResponse] = useState('')
    const [sesionId, setSesionId] = useState(null)
    const [finalCreds, setFinalCreds] = useState(null)
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (step === 'chat') scrollToBottom()
    }, [messages, step])

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleAuthSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isLogin) {
                const res = await fetch(`${API_URL}/onboarding/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegram_id: String(form.telegram_id),
                        codigo_secreto: String(form.codigo_secreto)
                    })
                })
                const data = await res.json()
                if (data.autenticado) {
                    localStorage.setItem('ritmo_user', JSON.stringify(data.usuario))
                    navigate('/profile-selection')
                } else {
                    setError(data.mensaje || 'Error de autenticación')
                }
            } else {
                const res = await fetch(`${API_URL}/onboarding/iniciar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegram_id: String(form.telegram_id),
                        nombre: form.nombre
                    })
                })
                const data = await res.json()
                if (res.ok) {
                    setSesionId(data.sesion_id)
                    setMessages([{ role: 'bot', text: data.mensaje }])
                    setStep('chat')
                } else {
                    setError(data.detail || 'Error al iniciar registro')
                }
            }
        } catch (err) {
            setError('Error de conexión con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleSendResponse = async (e) => {
        e.preventDefault()
        if (!currentResponse.trim() || loading) return

        const userMsg = currentResponse
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setCurrentResponse('')
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/onboarding/responder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: form.telegram_id,
                    sesion_id: sesionId,
                    respuesta: userMsg
                })
            })
            const data = await res.json()

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'bot', text: data.mensaje }])
                if (data.completado) {
                    setFinalCreds({
                        telegram_id: form.telegram_id,
                        codigo_secreto: data.codigo_secreto
                    })
                    setTimeout(() => setStep('success'), 2000)
                }
            } else {
                setError('Hubo un error al procesar tu respuesta')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <div className="onboarding-page">
                <div className="onboarding-container success-container">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h1>¡Listo, {form.nombre}! 👋</h1>
                    <p>Tu cuenta ha sido creada con éxito. Guarda bien estos datos:</p>

                    <div className="creds-box">
                        <div className="cred-item">
                            <span>ID de Telegram</span>
                            <strong>{finalCreds.telegram_id}</strong>
                        </div>
                        <div className="cred-item">
                            <span>Tu Código Secreto</span>
                            <strong className="code-text">{finalCreds.codigo_secreto}</strong>
                        </div>
                    </div>

                    <p className="creds-note">Usa estos datos para entrar a RITMO a partir de ahora.</p>

                    <button
                        className="btn-primary w-full"
                        onClick={() => {
                            setIsLogin(true)
                            setForm({ telegram_id: finalCreds.telegram_id, codigo_secreto: finalCreds.codigo_secreto, nombre: '' })
                            setStep('auth')
                        }}
                    >
                        Entrar ahora
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'chat') {
        return (
            <div className="onboarding-page">
                <div className="onboarding-container chat-container">
                    <div className="chat-header">
                        <img src="/image/2.png" alt="RITMO" className="chat-logo" />
                        <div>
                            <h3>Entrevista RITMO</h3>
                            <span>Estamos personalizando tu experiencia</span>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message-wrapper ${msg.role}`}>
                                <div className="message-bubble">
                                    {msg.text.split('\n').map((line, j) => (
                                        <p key={j}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message-wrapper bot">
                                <div className="message-bubble typing">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendResponse}>
                        <input
                            type="text"
                            placeholder="Responde aquí..."
                            value={currentResponse}
                            onChange={(e) => setCurrentResponse(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={!currentResponse.trim() || loading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container animate-fade-in">
                <div className="onboarding-header">
                    <img src="/image/2.png" alt="RITMO" className="onboarding-logo" />
                    <h1>{isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}</h1>
                    <p className="onboarding-desc">
                        {isLogin
                            ? 'Accede para continuar cuidando tu bienestar emocional.'
                            : 'Cuéntanos un poco sobre ti para empezar.'
                        }
                    </p>
                </div>

                <form className="onboarding-form" onSubmit={handleAuthSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <label><User size={14} /> ¿Cómo te llamas?</label>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label><Smartphone size={14} /> ID de Telegram</label>
                        <input
                            type="text"
                            name="telegram_id"
                            placeholder="ID numérico"
                            value={form.telegram_id}
                            onChange={handleChange}
                            required
                        />
                        {!isLogin && <p className="help-text">Obtén tu ID hablando con @Aturitmo_bot</p>}
                    </div>

                    {isLogin && (
                        <div className="input-group">
                            <label><ChevronRight size={14} /> Tu código secreto</label>
                            <input
                                type="password"
                                name="codigo_secreto"
                                placeholder="4 dígitos"
                                maxLength={4}
                                value={form.codigo_secreto}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {error && <div className="error-box">{error}</div>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : isLogin ? 'Entrar ahora' : 'Comenzar registro'}
                    </button>
                </form>

                <div className="form-footer">
                    {isLogin ? (
                        <>¿No tienes cuenta? <button type="button" onClick={() => setIsLogin(false)}>Regístrate</button></>
                    ) : (
                        <>¿Ya tienes cuenta? <button type="button" onClick={() => setIsLogin(true)}>Inicia sesión</button></>
                    )}
                </div>
            </div>
        </div>
    )
}
