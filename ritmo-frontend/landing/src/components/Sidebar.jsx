import { Home, Heart, Activity, MessageCircle, Music, TrendingUp, Settings, ChevronLeft, LogOut, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

const menuItems = [
  { id: 'inicio', label: 'Inicio', icon: Home, active: true },
  { id: 'animo', label: 'Mi ánimo', icon: Heart },
  { id: 'habitos', label: 'Mis hábitos', icon: Activity },
  { id: 'chat', label: 'Chat con RITMO', icon: MessageCircle },
  { id: 'playlists', label: 'Playlists', icon: Music },
  { id: 'progreso', label: 'Mi progreso', icon: TrendingUp },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

export default function Sidebar({ darkMode, toggleDark }) {
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
              className={`sidebar-item ${item.active ? 'active' : ''}`}
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
