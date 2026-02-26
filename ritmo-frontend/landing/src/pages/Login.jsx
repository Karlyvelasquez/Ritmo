import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLogIn, FiUserPlus, FiHeart, FiSmile, FiActivity } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()
    
    return (
        <>
            <Navbar />
            <div className="login-page">
                <div className="login-background">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>
                
                <motion.div 
                    className="login-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <motion.h1
                        className="welcome-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Bienvenido a
                    </motion.h1>
                    
                    <motion.div 
                        className="brand-logo-wrapper"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 150 }}
                    >
                        <img src="/image/3.png" alt="RITMO" className="brand-logo" />
                    </motion.div>
                    
                    <motion.p 
                        className="login-desc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Tu espacio seguro para el bienestar emocional y hábitos saludables
                    </motion.p>

                    <motion.div 
                        className="features-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
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
                    
                    <motion.div 
                        className="login-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <motion.button 
                            className="btn-primary" 
                            onClick={() => navigate('/onboarding?mode=login')}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(138, 175, 139, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiLogIn />
                            <span>Iniciar sesión</span>
                        </motion.button>
                        
                        <motion.button 
                            className="btn-secondary" 
                            onClick={() => navigate('/onboarding?mode=register')}
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(138, 175, 139, 0.2)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiUserPlus />
                            <span>Registrarse</span>
                        </motion.button>
                    </motion.div>

                    <motion.div 
                        className="login-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <p>Únete a miles de usuarios que mejoran su bienestar cada día</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}
