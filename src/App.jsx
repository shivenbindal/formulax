import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import DashboardLayout from './components/DashboardLayout'
import { useAuth } from './context/AuthContext'

// Import pages
import Login from './pages/Login'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Pricing from './pages/Pricing'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'

// Import dashboard pages
import FormulaFinderPage from './pages/dashboard/FormulaFinderPage'
import ExplorerPage from './pages/dashboard/ExplorerPage'
import MySheetsPage from './pages/dashboard/MySheetsPage'
import HistoryPage from './pages/dashboard/HistoryPage'
import SearchPage from './pages/dashboard/SearchPage'
import CommunityPage from './pages/dashboard/CommunityPage'
import TeacherPage from './pages/dashboard/TeacherPage'
import TakeTestPage from './pages/dashboard/TakeTestPage'

function ProtectedDashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />

  return (
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="approach" element={<FormulaFinderPage />} />
          <Route path="explorer" element={<ExplorerPage />} />
          <Route path="saved" element={<MySheetsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="teacher" element={<TeacherPage />} />
          <Route path="test/:classroomId/:testId" element={<TakeTestPage />} />
          <Route index element={<Navigate to="explorer" replace />} />
        </Route>
      </Routes>
    </DashboardProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/dashboard/*" element={<ProtectedDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
