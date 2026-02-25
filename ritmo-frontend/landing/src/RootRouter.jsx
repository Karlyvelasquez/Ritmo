import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ProfileSelection from './pages/ProfileSelection'
import DashboardPage from './features/dashboard/DashboardPage'

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<ProfileSelection />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
