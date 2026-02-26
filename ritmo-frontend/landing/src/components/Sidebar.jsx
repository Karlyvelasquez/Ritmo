import { Home, Heart, Activity, MessageCircle, Music, TrendingUp, Settings, ChevronLeft, LogOut, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

const menuItems = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'animo', label: 'Mi ánimo', icon: Heart },
  { id: 'habitos', label: 'Mis hábitos', icon: Activity },
  { id: 'chat', label: 'Chat con RITMO', icon: MessageCircle },
  { id: 'playlists', label: 'Playlists', icon: Music },
  { id: 'progreso', label: 'Mi progreso', icon: TrendingUp },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

export default function Sidebar({ darkMode, toggleDark, activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src="/image/2.png" alt="RITMO" />
        {!collapsed && <span>RITMO</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">

        <button
          className="sidebar-action"
          onClick={toggleDark}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>

        {/* Telegram Bot Button */}
        <a
          className="sidebar-action telegram-link"
          href="https://t.me/Aturitmo_bot"
          target="_blank"
          rel="noopener noreferrer"
          title="Ir al chat de Telegram"
          style={{ textDecoration: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: collapsed ? 0 : 8 }}>
            <path d="M21.944 3.445a1.5 1.5 0 0 0-1.637-.217L3.6 10.6a1.5 1.5 0 0 0 .13 2.78l3.97 1.44 1.48 4.44a1.5 1.5 0 0 0 2.7.23l2.02-3.38 3.97 3.02a1.5 1.5 0 0 0 2.38-.82l3.5-13.5a1.5 1.5 0 0 0-.206-1.465zM9.5 17.5l-1.2-3.6 7.7-7.7-6.5 8.3zm2.5 1.5a.5.5 0 0 1-.47-.33l-1.5-4.5 8.5-8.5-6.53 13.33zm7.5-2.5l-3.97-3.02-2.02 3.38a.5.5 0 0 1-.9-.08l-1.48-4.44-3.97-1.44a.5.5 0 0 1-.04-.93l16.7-7.37a.5.5 0 0 1 .55.07.5.5 0 0 1 .16.54l-3.5 13.5a.5.5 0 0 1-.77.29z" fill="#229ED9" />
          </svg>
          {!collapsed && <span>Telegram</span>}
        </a>

        <button
          className="sidebar-action logout"
          onClick={() => navigate('/')}
        >
          <LogOut size={18} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft size={18} className={collapsed ? 'rotated' : ''} />
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}
