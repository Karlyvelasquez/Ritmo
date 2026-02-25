import { Music } from 'lucide-react'
import { chatMessages } from '../mockData'
import './ChatPreview.css'

export default function ChatPreview() {
  return (
    <div className="chat-card">
      <div className="card-header">
        <h3>Tu chat con RITMO 💬</h3>
        <span className="badge badge-chat">Hoy</span>
      </div>

      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.sender === 'user' ? 'user' : 'ritmo'}`}
          >
            {msg.sender === 'ritmo' && (
              <div className="chat-avatar ritmo-avatar">
                <Music size={18} strokeWidth={2.5} />
              </div>
            )}
            <div className="chat-bubble">
              <p>{msg.message}</p>
              <span className="chat-time">{msg.time}</span>
            </div>
            {msg.sender === 'user' && (
              <div className="chat-avatar user-avatar">L</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
