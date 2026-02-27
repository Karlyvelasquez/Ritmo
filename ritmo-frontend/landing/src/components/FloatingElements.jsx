import { motion } from 'framer-motion'

const circles = [
  { size: 200, x: '10%', y: '20%', color: '#8AAF8B', duration: 20 },
  { size: 130, x: '80%', y: '10%', color: '#EEE2D7', duration: 25 },
  { size: 250, x: '70%', y: '60%', color: '#8AAF8B', duration: 30 },
  { size: 160, x: '5%', y: '70%', color: '#1E3751', duration: 22 },
  { size: 120, x: '50%', y: '40%', color: '#EEE2D7', duration: 28 },
  { size: 220, x: '30%', y: '85%', color: '#8AAF8B', duration: 35 },
]

export default function FloatingElements() {
  return (
    <div className="floating-elements">
      {circles.map((c, i) => (
        <motion.div
          key={i}
          className="floating-circle"
          style={{
            width: c.size,
            height: c.size,
            left: c.x,
            top: c.y,
            background: `radial-gradient(circle, ${c.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
