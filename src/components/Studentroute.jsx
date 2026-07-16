import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function StudentRoute({ children }) {
  const { user, loading } = useAuth()

  // While Firebase is checking auth state, show a loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-400 font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Once loading is done, check if user exists
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render the protected component
  return children
}
