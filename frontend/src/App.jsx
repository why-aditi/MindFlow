import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AICompanion from './pages/AICompanion'
import Journaling from './pages/Journaling'
import Profile from './pages/Profile'
import VRExercise from './pages/VRExercise'
import MindfulMovement from './pages/MindfulMovement'
import CommunityForums from './components/CommunityForums'
import ForumPosts from './components/ForumPosts'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen wellness-bg relative overflow-hidden">
          {/* Global floating wellness elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-20 left-20 text-sky-200/30 animate-gentle-float">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="absolute top-40 right-32 text-emerald-200/20 animate-float">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="absolute bottom-32 left-40 text-violet-200/25 animate-breathe">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="absolute top-60 left-1/2 text-rose-200/20 animate-pulse-wellness">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          
          <div className="relative z-10">
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
              <Route path="/community-forums" element={
                <ProtectedRoute>
                  <CommunityForums />
                </ProtectedRoute>
              } />
              <Route path="/community-forums/:forumId" element={
                <ProtectedRoute>
                  <ForumPosts />
                </ProtectedRoute>
              } />
              <Route path="/vr-exercise" element={
                <ProtectedRoute>
                  <VRExercise />
                </ProtectedRoute>
              } />
              <Route path="/mindful-movement" element={
                <ProtectedRoute>
                  <MindfulMovement />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '16px',
                color: '#0f172a',
                fontWeight: '300',
                boxShadow: '0 8px 32px rgba(14, 165, 233, 0.1)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App