import { useState } from 'react'
import { Music, Heart, Play, ExternalLink, Headphones } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playlistsData } from '../mockData'
import './PlaylistsRitmo.css'

export default function PlaylistsRitmo() {
  const [selectedMood, setSelectedMood] = useState('todas')
  const [hoveredPlaylist, setHoveredPlaylist] = useState(null)

  const moods = [
    { id: 'todas', label: 'Todo', icon: Music },
    { id: 'calma', label: 'Calma', color: '#8AAF8B' },
    { id: 'bien', label: 'Energía', color: '#EC4899' },
    { id: 'normal', label: 'Feels', color: '#F59E0B' }
  ]

  const filteredPlaylists = selectedMood === 'todas' 
    ? playlistsData 
    : playlistsData.filter(p => p.mood === selectedMood)

  return (
    <div className="playlists-ritmo-container">
      <motion.div 
        className="playlists-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-icon">
          <Headphones size={48} strokeWidth={2} />
        </div>
        
        <h1>La música lo dice todo</h1>
        
        <div className="hero-message">
          <p>
            A veces las palabras no alcanzan, pero una canción puede decir exactamente lo que sientes.
          </p>
          <p>
            He preparado estas playlists pensando en ti, en tus momentos buenos y en los más difíciles.
            Porque la música no juzga, solo acompaña.
          </p>
          <p className="hero-signature">
            — RITMO
          </p>
        </div>
      </motion.div>

      {/* Mood Filters */}
      <motion.div 
        className="mood-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="filter-label">¿Cómo te sientes hoy?</span>
        <div className="filter-buttons">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-filter ${selectedMood === mood.id ? 'active' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
              style={{
                '--mood-color': mood.color || '#8AAF8B'
              }}
            >
              {mood.icon && <mood.icon size={18} />}
              {mood.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Playlists Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedMood}
          className="playlists-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {filteredPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              className="playlist-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredPlaylist(playlist.id)}
              onMouseLeave={() => setHoveredPlaylist(null)}
            >
              <div className="playlist-image-wrapper">
                <img 
                  src={playlist.image} 
                  alt={playlist.title}
                  className="playlist-image"
                />
                <div className={`playlist-overlay ${hoveredPlaylist === playlist.id ? 'visible' : ''}`}>
                  <div className="overlay-content">
                    <Play size={40} fill="white" strokeWidth={0} />
                    <span>Escuchar ahora</span>
                  </div>
                </div>
                {playlist.featured && (
                  <div className="featured-badge">
                    <Heart size={14} fill="currentColor" />
                    <span>Para ti</span>
                  </div>
                )}
              </div>

              <div className="playlist-info">
                <h3>{playlist.title}</h3>
                <a 
                  href={playlist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="playlist-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Abrir en Spotify</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Connection Message */}
      <motion.div 
        className="connection-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="message-icon">
          <Heart size={24} />
        </div>
        <div className="message-text">
          <p>
            No importa qué tan raro sea tu gusto musical o cuántas veces repitas esa canción.
            La música es tuya, para sentir lo que necesites sentir.
          </p>
          <p className="message-ps">
            PD: Si encuentras una canción que te mueve por dentro, guárdala. Esos son los tesoros que valen la pena.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
