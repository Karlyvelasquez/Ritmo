import { Zap } from 'lucide-react'
import { getRandomItem, quickTips } from '../mockData'
import './QuickTip.css'

export default function QuickTip() {
  const tip = getRandomItem(quickTips)

  return (
    <div className="quick-tip-card">
      <div className="tip-header">
        <Zap size={20} strokeWidth={2.5} fill="currentColor" />
        <span>Tip rápido</span>
      </div>
      <p className="tip-text">{tip.text}</p>
    </div>
  )
}
