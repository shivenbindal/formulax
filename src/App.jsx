import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudentRoute } from './components/Studentroute'
import DashboardLayout from './components/DashboardLayout'

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* ========== PROTECTED DASHBOARD ROUTES ========== */}
          {/* Main dashboard layout with nested routes */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <DashboardLayout />
              </StudentRoute>
            }
          >
            {/* Nested routes inside DashboardLayout */}
            <Route path="formula-finder" element={<FormulaFinderPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="saved" element={<MySheetsPage />} />
            <Route path="history" element={<HistoryPage />} />
            {/* Redirect /dashboard to /dashboard/formula-finder */}
            <Route index element={<Navigate to="formula-finder" replace />} />
          </Route>

          {/* ========== ADMIN ROUTE ========== */}
          <Route
            path="/admin"
            element={
              <StudentRoute>
                <Admin />
              </StudentRoute>
            }
          />

          {/* ========== FALLBACK ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
