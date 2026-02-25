import { playlistsData } from '../mockData'
import './MusicPlaylists.css'

export default function MusicPlaylists() {
  return (
    <div className="playlists-card">
      <div className="card-header">
        <h3>Tu música 🎧</h3>
      </div>
      <p className="playlists-subtitle">Para acompañarte en cada mood</p>

      <div className="playlists-grid">
        {playlistsData.map((playlist) => (
          <a 
            key={playlist.id} 
            href={playlist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="playlist-item"
          >
            <div className="playlist-image">
              <img src={playlist.image} alt={playlist.title} />
              <div className="playlist-overlay" />
              {playlist.featured && (
                <span className="playlist-badge">Para ti 💚</span>
              )}
            </div>
            <h4>{playlist.title}</h4>
          </a>
        ))}
      </div>
    </div>
  )
}
