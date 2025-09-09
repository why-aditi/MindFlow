import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Hero from '../components/landing/Hero'
import About from '../components/landing/About'
import Features from '../components/landing/Features'
import YouthCentric from '../components/landing/YouthCentric'
import Rewards from '../components/landing/Rewards'
import Footer from '../components/landing/Footer'
import Header from '../components/landing/Header'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user, signInWithGoogle, loading } = useAuth()

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
        await signInWithGoogle()
        // User state is now updated, navigate to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('Sign in failed:', error)
      }
    }
  }

  // Show loading state during initial auth check
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

  return (
    <div className="min-h-screen bg-white">
      <Header onGetStarted={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <About />
      <Features />
      <YouthCentric />
      <Rewards />
      <Footer />
    </div>
  )
}

export default LandingPage
