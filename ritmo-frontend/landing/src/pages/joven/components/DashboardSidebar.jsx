import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiSmile,
  FiTrendingUp,
  FiMessageCircle,
  FiCheckSquare,
  FiUser,
  FiArrowLeft,
  FiSun,
  FiMoon,
} from 'react-icons/fi'
import { ThemeContext } from '../../contexts/ThemeContext'
import { mockUser } from '../../data/mockData'

const navItems = [
  { id: 'checkin', label: 'Check-in', icon: FiSmile },
  { id: 'historial', label: 'Historial', icon: FiTrendingUp },
  { id: 'chat', label: 'Chat', icon: FiMessageCircle },
  { id: 'habitos', label: 'Habitos', icon: FiCheckSquare },
  { id: 'perfil', label: 'Perfil', icon: FiUser },
]

export default function DashboardSidebar({ activeSection, onNavigate }) {
  const { darkMode, toggleDark } = useContext(ThemeContext)

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img src="/image/2.png" alt="RITMO" />
        <span>RITMO</span>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {mockUser.nombre.charAt(0)}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{mockUser.nombre}</span>
          <span className="sidebar-user-tag">{mockUser.etapa_vida}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            whileTap={{ scale: 0.97 }}
          >
            <item.icon />
            {item.label}
          </motion.button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-theme-btn" onClick={toggleDark}>
          {darkMode ? <FiSun /> : <FiMoon />}
          {darkMode ? 'Modo claro' : 'Modo oscuro'}
        </button>
        <Link to="/" className="sidebar-back-link">
          <FiArrowLeft />
          Volver al inicio
        </Link>
      </div>
    </aside>
  )
}
