import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()
    return (
        <div className="login-page">
            <div className="login-container">
                <img src="/image/2.png" alt="RITMO" className="login-logo" />
                <h1>Bienvenido a RITMO</h1>
                <p className="login-desc">Tu espacio seguro para el bienestar emocional y hábitos saludables</p>
                <div className="login-actions">
                    <button className="btn-primary" onClick={() => navigate('/onboarding?mode=login')}>Iniciar sesión</button>
                    <button className="btn-secondary" onClick={() => navigate('/onboarding?mode=register')}>Registrarse</button>
                </div>
            </div>
        </div>
    )
}
