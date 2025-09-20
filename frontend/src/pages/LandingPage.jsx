import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Hero from '../components/landing/Hero'
import About from '../components/landing/About'
import Features from '../components/landing/Features'
import Wellness from '../components/landing/Wellness'
import Rewards from '../components/landing/Rewards'
import Contact from '../components/landing/Contact'
import Footer from '../components/landing/Footer'
import Header from '../components/landing/Header'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user, signInWithGoogle, loading } = useAuth()
  const [error, setError] = useState(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const handleGetStarted = async () => {
    if (user) {
      navigate('/dashboard')
    } else {
      try {
        setError(null)
        setIsSigningIn(true)
        await signInWithGoogle()
        // User state is now updated, navigate to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('Sign in failed:', error)
        setError(error.message || 'Sign-in failed. Please try again.')
      } finally {
        setIsSigningIn(false)
      }
    }
  }

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen wellness-bg flex items-center justify-center relative overflow-hidden">
        {/* Floating wellness elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-wellness">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-light text-slate-600 mb-2">Preparing Your Wellness Journey</h2>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wellness-bg relative overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-500 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Header onGetStarted={handleGetStarted} isSigningIn={isSigningIn} />
      <Hero onGetStarted={handleGetStarted} isSigningIn={isSigningIn} />
      <About />
      <Features />
      <Wellness />
      <Rewards />
      <Contact />
      <Footer />
    </div>
  )
}

export default LandingPage
