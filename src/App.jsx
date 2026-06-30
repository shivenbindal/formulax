import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
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
          <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App