import { useState, useEffect, createContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ProfileSelection from './pages/ProfileSelection'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
import DashboardPage from './features/dashboard/DashboardPage'
import DashboardInmigrante from './features/dashboard/DashboardInmigrante'
import DashboardAdultoActivo from './features/dashboard/DashboardAdultoActivo'
import DashboardAdultoMayor from './features/dashboard/DashboardAdultoMayor'
import DashboardVisual from './features/dashboard/DashboardVisual'

export const ThemeContext = createContext()

export default function RootRouter() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ritmo-dark-mode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('ritmo-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDark = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile-selection" element={<ProfileSelection />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/inmigrante" element={<DashboardInmigrante />} />
          <Route path="/dashboard/adulto-activo" element={<DashboardAdultoActivo />} />
          <Route path="/dashboard/adulto-mayor" element={<DashboardAdultoMayor />} />
          <Route path="/dashboard/visual" element={<DashboardVisual />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
