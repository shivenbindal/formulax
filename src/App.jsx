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

// Simple auth check - redirect to landing if not logged in
function ProtectedDashboard() {
  const { user } = useAuth()

  // Not logged in? Go to landing page instantly
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Logged in? Show dashboard
  return (
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="formula-finder" element={<FormulaFinderPage />} />
          <Route path="explorer" element={<ExplorerPage />} />
          <Route path="saved" element={<MySheetsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route index element={<Navigate to="formula-finder" replace />} />
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
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* DASHBOARD ROUTES (Protected) */}
          <Route path="/dashboard/*" element={<ProtectedDashboard />} />

          {/* ADMIN */}
          <Route path="/admin" element={<Admin />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
