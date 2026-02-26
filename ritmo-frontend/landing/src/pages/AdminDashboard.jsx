import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiActivity, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi'
import './AdminDashboard.css'

const API_URL = 'http://localhost:8000'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    return saved ? JSON.parse(saved) : null
  })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar que es admin
    if (!admin || admin.tipo !== 'admin') {
      navigate('/login')
      return
    }
    loadStats()
  }, [admin, navigate])

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ritmo_user')
    navigate('/login')
  }

  const menuItems = [
    {
      icon: FiUsers,
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      color: '#8AAF8B'
    },
    {
      icon: FiActivity,
      title: 'Actividad',
      description: 'Monitor de actividad en tiempo real',
      color: '#F59E0B'
    },
    {
      icon: FiBarChart2,
      title: 'Estadísticas',
      description: 'Reportes y análisis del sistema',
      color: '#10B981'
    },
    {
      icon: FiSettings,
      title: 'Configuración',
      description: 'Ajustes del sistema',
      color: '#6366F1'
    }
  ]

  if (!admin) {
    return <div>Redirigiendo...</div>
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Panel de Administración</h1>
            <p>Bienvenido, {admin.nombre} ({admin.nivel})</p>
          </div>
          <motion.button
            className="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut />
            Cerrar sesión
          </motion.button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <section className="stats-overview">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="stat-icon users">
                <FiUsers />
              </div>
              <div className="stat-content">
                <h3>Usuarios Activos</h3>
                <p className="stat-number">{loading ? '---' : (stats?.usuarios_activos || '0')}</p>
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stat-icon activity">
                <FiActivity />
              </div>
              <div className="stat-content">
                <h3>Sesiones Hoy</h3>
                <p className="stat-number">{loading ? '---' : (stats?.sesiones_hoy || '0')}</p>
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="stat-icon reports">
                <FiBarChart2 />
              </div>
              <div className="stat-content">
                <h3>Reportes</h3>
                <p className="stat-number">{loading ? '---' : (stats?.reportes_pendientes || '0')}</p>
              </div>
            </motion.div>
          </section>

          <section className="admin-menu">
            <h2>Herramientas de Administración</h2>
            <div className="menu-grid">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={item.title}
                    className="menu-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="menu-icon" style={{ backgroundColor: item.color }}>
                      <IconComponent size={24} color="white" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="menu-arrow">
                      <span>→</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}