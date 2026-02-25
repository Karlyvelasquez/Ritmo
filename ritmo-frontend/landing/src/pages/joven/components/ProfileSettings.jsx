import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiBell,
  FiVolumeX,
  FiClock,
  FiMessageSquare,
  FiMic,
  FiLogOut,
} from 'react-icons/fi'
import { mockUser } from '../../data/mockData'

export default function ProfileSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notificaciones: true,
    modoSilencio: false,
    recordatorios: true,
  })
  const [commMode, setCommMode] = useState(mockUser.modo_comunicacion)

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="profile-settings-section">
      <h2>Perfil y ajustes</h2>

      {/* User card */}
      <motion.div
        className="profile-user-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-user-avatar-large">
          {mockUser.nombre.charAt(0)}
        </div>
        <div className="profile-user-details">
          <h3>{mockUser.nombre}</h3>
          <div className="profile-user-tags">
            <span className="profile-tag">{mockUser.etapa_vida}</span>
            <span className="profile-tag comm">{commMode}</span>
          </div>
        </div>
      </motion.div>

      {/* Notifications group */}
      <motion.div
        className="settings-group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="settings-group-title">Notificaciones</span>

        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><FiBell /></div>
            <span className="settings-item-label">Notificaciones</span>
          </div>
          <button
            className={`toggle-switch ${settings.notificaciones ? 'active' : ''}`}
            onClick={() => toggleSetting('notificaciones')}
            aria-label="Activar notificaciones"
          >
            <span className="toggle-switch-knob" />
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><FiVolumeX /></div>
            <span className="settings-item-label">Modo silencio</span>
          </div>
          <button
            className={`toggle-switch ${settings.modoSilencio ? 'active' : ''}`}
            onClick={() => toggleSetting('modoSilencio')}
            aria-label="Activar modo silencio"
          >
            <span className="toggle-switch-knob" />
          </button>
        </div>

        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><FiClock /></div>
            <span className="settings-item-label">{'Recordatorios de habitos'}</span>
          </div>
          <button
            className={`toggle-switch ${settings.recordatorios ? 'active' : ''}`}
            onClick={() => toggleSetting('recordatorios')}
            aria-label="Activar recordatorios"
          >
            <span className="toggle-switch-knob" />
          </button>
        </div>
      </motion.div>

      {/* Communication preference */}
      <motion.div
        className="settings-group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="settings-group-title">{'Comunicacion'}</span>

        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-item-icon"><FiMessageSquare /></div>
            <span className="settings-item-label">{'Modo de comunicacion'}</span>
          </div>
          <div className="comm-options">
            <button
              className={`comm-option ${commMode === 'texto' ? 'active' : ''}`}
              onClick={() => setCommMode('texto')}
            >
              <FiMessageSquare style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Texto
            </button>
            <button
              className={`comm-option ${commMode === 'voz' ? 'active' : ''}`}
              onClick={() => setCommMode('voz')}
            >
              <FiMic style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Voz
            </button>
          </div>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        className="logout-btn"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiLogOut />
        {'Cerrar sesion'}
      </motion.button>
    </div>
  )
}
