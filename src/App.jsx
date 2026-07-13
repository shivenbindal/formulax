import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import DashboardLayout from './components/DashboardLayout'
import { DashboardProvider } from './context/DashboardContext'
import FormulaFinderPage from './pages/dashboard/FormulaFinderPage'
import ExplorerPage from './pages/dashboard/ExplorerPage'
import MySheetsPage from './pages/dashboard/MySheetsPage'
import HistoryPage from './pages/dashboard/HistoryPage'
import Onboarding from './pages/Onboarding'
import Admin from './pages/Admin'

const ADMIN_EMAIL = 'shivenbindal@gmail.com'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function StudentRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.email === ADMIN_EMAIL) return <Navigate to="/admin" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<StudentRoute><Onboarding /></StudentRoute>} />
          <Route path="/dashboard" element={<StudentRoute><DashboardProvider><DashboardLayout /></DashboardProvider></StudentRoute>}>
            <Route index element={<Navigate to="formula-finder" replace />} />
            <Route path="formula-finder" element={<FormulaFinderPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="saved" element={<MySheetsPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
