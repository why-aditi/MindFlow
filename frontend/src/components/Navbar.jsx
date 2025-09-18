import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Heart, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowLeft
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleProfileClick = () => {
    navigate('/profile')
    setIsProfileDropdownOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-wellness border-b border-emerald-100/50 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Logo - Clickable */}
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-slate-700">MindFlow</h1>
                <p className="text-sm text-slate-500">Your Wellness Journey</p>
              </div>
            </div>
          </div>

          {/* Right side - Profile Dropdown */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-slate-700">
                {user?.displayName || 'Wellness Seeker'}
              </p>
              <p className="text-xs text-slate-500">Ready for your journey?</p>
            </div>

            {/* Profile Dropdown - Desktop Only */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-emerald-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-emerald-100 py-2"
                  style={{ zIndex: 9999 }}
                >
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700 font-medium">Show Profile</span>
                  </button>
                  <div className="border-t border-emerald-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-medium">Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-emerald-100/50 py-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleProfileClick()
                  setIsMenuOpen(false)
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-emerald-50"
              >
                <User className="w-4 h-4" />
                <span>Show Profile</span>
              </button>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
