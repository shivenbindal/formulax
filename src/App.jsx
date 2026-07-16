import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudentRoute } from './components/StudentRoute'

// Import all your pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Study from './pages/Study'
import FormulaFinderPage from './pages/FormulaFinderPage'
import ExplorerPage from './pages/ExplorerPage'
import MySheetsPage from './pages/MySheetsPage'
import HistoryPage from './pages/HistoryPage'
import Pricing from './pages/Pricing'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import PrivateRoute from './components/PrivateRoute' // Your existing admin guard

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* ========== PROTECTED ROUTES (Student) ========== */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <DashboardPage />
              </StudentRoute>
            }
          />

          {/* Study section with nested routes */}
          <Route
            path="/study/*"
            element={
              <StudentRoute>
                <Study />
              </StudentRoute>
            }
          />

          {/* Individual study routes (if accessed directly) */}
          <Route
            path="/formula-finder"
            element={
              <StudentRoute>
                <FormulaFinderPage />
              </StudentRoute>
            }
          />
          <Route
            path="/explorer"
            element={
              <StudentRoute>
                <ExplorerPage />
              </StudentRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <StudentRoute>
                <MySheetsPage />
              </StudentRoute>
            }
          />
          <Route
            path="/history"
            element={
              <StudentRoute>
                <HistoryPage />
              </StudentRoute>
            }
          />

          {/* ========== ADMIN ROUTES ========== */}
          <Route
            path="/admin"
            element={
              <StudentRoute>
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              </StudentRoute>
            }
          />

          {/* ========== FALLBACK ========== */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
