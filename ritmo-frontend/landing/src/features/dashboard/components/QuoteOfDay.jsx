import { useEffect, useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import { motivationalQuotes, getRandomItem } from '../mockData'
import './QuoteOfDay.css'

export default function QuoteOfDay() {
  const [quote, setQuote] = useState(getRandomItem(motivationalQuotes))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshQuote = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setQuote(getRandomItem(motivationalQuotes))
      setIsRefreshing(false)
    }, 300)
  }

  return (
    <div className="quote-card">
      <div className="quote-icon">
        <Heart size={24} fill="currentColor" />
      </div>
      
      <div className={`quote-content ${isRefreshing ? 'refreshing' : ''}`}>
        <p className="quote-text">{quote}</p>
      </div>

      <button 
        className="quote-refresh" 
        onClick={refreshQuote}
        disabled={isRefreshing}
        title="Otra frase"
      >
        <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
      </button>
    </div>
  )
}
