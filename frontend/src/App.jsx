import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AICompanion from './pages/AICompanion'
import Journaling from './pages/Journaling'
import Profile from './pages/Profile'
import VRExercise from './pages/VRExercise'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/ai-companion" element={
              <ProtectedRoute>
                <AICompanion />
              </ProtectedRoute>
            } />
            <Route path="/journaling" element={
              <ProtectedRoute>
                <Journaling />
              </ProtectedRoute>
            } />
            <Route path="/vr-exercise" element={
              <ProtectedRoute>
                <VRExercise />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App