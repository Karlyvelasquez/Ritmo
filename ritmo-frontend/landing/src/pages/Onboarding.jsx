import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, ChevronRight, CheckCircle, Smartphone } from 'lucide-react'
import { FiLogIn, FiUserPlus, FiHeart, FiSmile, FiActivity } from 'react-icons/fi'
import Navbar from '../components/Navbar'
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
            <>
                <Navbar />
                <div className="onboarding-page">
                    <div className="login-background">
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                        <div className="blob blob-3"></div>
                    </div>
                    
                    <motion.div 
                        className="onboarding-container success-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <motion.div 
                            className="success-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <CheckCircle size={64} />
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            ¡Listo, {form.nombre}! 👋
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Tu cuenta ha sido creada con éxito. Guarda bien estos datos:
                        </motion.p>

                        <motion.div 
                            className="creds-box"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="cred-item">
                                <span>ID de Telegram</span>
                                <strong>{finalCreds.telegram_id}</strong>
                            </div>
                            <div className="cred-item">
                                <span>Tu Código Secreto</span>
                                <strong className="code-text">{finalCreds.codigo_secreto}</strong>
                            </div>
                        </motion.div>

                        <motion.p 
                            className="creds-note"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            Usa estos datos para entrar a RITMO a partir de ahora.
                        </motion.p>

                        <motion.button
                            className="btn-primary w-full"
                            onClick={() => {
                                setIsLogin(true)
                                setForm({ telegram_id: finalCreds.telegram_id, codigo_secreto: finalCreds.codigo_secreto, nombre: '' })
                                setStep('auth')
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiLogIn />
                            <span>Entrar ahora</span>
                        </motion.button>
                    </motion.div>
                </div>
            </>
        )
    }

    if (step === 'chat') {
        return (
            <>
                <Navbar />
                <div className="onboarding-page">
                    <div className="login-background">
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                        <div className="blob blob-3"></div>
                    </div>
                    
                    <motion.div 
                        className="onboarding-container chat-container"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <motion.div 
                            className="chat-header"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <img src="/image/3.png" alt="RITMO" className="chat-logo" />
                            <div>
                                <h3>Entrevista RITMO</h3>
                                <span>Estamos personalizando tu experiencia</span>
                            </div>
                        </motion.div>

                        <div className="chat-messages">
                            <AnimatePresence>
                                {messages.map((msg, i) => (
                                    <motion.div 
                                        key={i} 
                                        className={`message-wrapper ${msg.role}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, delay: i * 0.1 }}
                                    >
                                        <div className="message-bubble">
                                            {msg.text.split('\n').map((line, j) => (
                                                <p key={j}>{line}</p>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {loading && (
                                <motion.div 
                                    className="message-wrapper bot"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="message-bubble typing">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <motion.form 
                            className="chat-input-area" 
                            onSubmit={handleSendResponse}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <input
                                type="text"
                                placeholder="Responde aquí..."
                                value={currentResponse}
                                onChange={(e) => setCurrentResponse(e.target.value)}
                                disabled={loading}
                            />
                            <motion.button 
                                type="submit" 
                                disabled={!currentResponse.trim() || loading}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </motion.form>
                    </motion.div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="onboarding-page">
                <div className="login-background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>
                
                <motion.div 
                    className="onboarding-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <motion.div 
                        className="onboarding-header"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <motion.h1
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
                        </motion.h1>
                        <motion.p 
                            className="onboarding-desc"
                            key={isLogin ? 'login-desc' : 'register-desc'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {isLogin
                                ? 'Accede para continuar cuidando tu bienestar emocional.'
                                : 'Cuéntanos un poco sobre ti para empezar.'
                            }
                        </motion.p>

                        {!isLogin && (
                            <motion.div 
                                className="features-preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="feature-icon">
                                    <FiHeart />
                                </div>
                                <div className="feature-icon">
                                    <FiSmile />
                                </div>
                                <div className="feature-icon">
                                    <FiActivity />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.form 
                        className="onboarding-form" 
                        onSubmit={handleAuthSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div 
                                    className="input-group"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label><User size={16} /> ¿Cómo te llamas?</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Tu nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="input-group">
                            <label><Smartphone size={16} /> ID de Telegram</label>
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

                        <AnimatePresence mode="wait">
                            {isLogin && (
                                <motion.div 
                                    className="input-group"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label><ChevronRight size={16} /> Tu código secreto</label>
                                    <input
                                        type="password"
                                        name="codigo_secreto"
                                        placeholder="4 dígitos"
                                        maxLength={4}
                                        value={form.codigo_secreto}
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    className="error-box"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button 
                            className="btn-primary" 
                            type="submit" 
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.05 } : {}}
                            whileTap={!loading ? { scale: 0.95 } : {}}
                        >
                            {isLogin ? <FiLogIn /> : <FiUserPlus />}
                            <span>
                                {loading ? 'Procesando...' : isLogin ? 'Entrar ahora' : 'Comenzar registro'}
                            </span>
                        </motion.button>
                    </motion.form>

                    <motion.div 
                        className="form-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        {isLogin ? (
                            <>¿No tienes cuenta? <button type="button" onClick={() => setIsLogin(false)}>Regístrate</button></>
                        ) : (
                            <>¿Ya tienes cuenta? <button type="button" onClick={() => setIsLogin(true)}>Inicia sesión</button></>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}
