import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ProfileSelection from './pages/ProfileSelection'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import DashboardPage from './features/dashboard/DashboardPage'
import DashboardInmigrante from './features/dashboard/DashboardInmigrante'
import DashboardAdultoMayor from './features/dashboard/DashboardAdultoMayor'
import DashboardVisual from './features/dashboard/DashboardVisual'

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/profile-selection" element={<ProfileSelection />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/inmigrante" element={<DashboardInmigrante />} />
        <Route path="/dashboard/adulto-mayor" element={<DashboardAdultoMayor />} />
        <Route path="/dashboard/visual" element={<DashboardVisual />} />
      </Routes>
    </BrowserRouter>
  )
}
