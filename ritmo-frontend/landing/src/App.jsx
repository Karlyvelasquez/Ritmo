import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Profiles from './components/Profiles'
import Testimonial from './components/Testimonial'
import Team from './components/Team'
import CTA from './components/CTA'
import Footer from './components/Footer'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          className="loader-screen"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.img
            src="/image/1.png"
            alt="RITMO"
            className="loader-logo"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0.9],
              scale: [0.3, 1, 1.05, 1],
            }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
          <motion.div
            className="loader-pulse"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.p
            className="loader-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Una IA que te acompaña
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <Hero />
          <Features />
          <Profiles />
          <Testimonial />
          <Team />
          <CTA />
          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
