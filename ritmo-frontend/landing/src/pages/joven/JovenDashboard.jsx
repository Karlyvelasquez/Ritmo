import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './joven-dashboard.css'
import DashboardSidebar from './components/DashboardSidebar'
import DashboardHeader from './components/DashboardHeader'
import CheckIn from './components/CheckIn'
import EmotionalHistory from './components/EmotionalHistory'
import ChatRitmo from './components/ChatRitmo'
import HabitTracker from './components/HabitTracker'
import ProfileSettings from './components/ProfileSettings'

const sectionComponents = {
  checkin: CheckIn,
  historial: EmotionalHistory,
  chat: ChatRitmo,
  habitos: HabitTracker,
  perfil: ProfileSettings,
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function JovenDashboard() {
  const [activeSection, setActiveSection] = useState('checkin')

  const ActiveComponent = sectionComponents[activeSection]

  return (
    <div className="joven-dashboard">
      <DashboardSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <main className="dashboard-main">
        <DashboardHeader />

        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
