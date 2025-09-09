import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Render protected content if authenticated
  return children
}

export default ProtectedRoute
