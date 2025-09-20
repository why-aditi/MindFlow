import { useEffect, useState } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { onAuthStateChanged, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth'
import { AuthContext } from './AuthContext'
import { getDeviceInfo } from '../utils/mobileUtils'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Log device info for debugging
  useEffect(() => {
    const deviceInfo = getDeviceInfo()
    console.log('Device Info:', deviceInfo)
  }, [])

  // Get backend URL based on environment
  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      // Use the same host as the frontend but with port 5000
      const host = window.location.hostname
      const protocol = window.location.protocol
      return `${protocol}//${host}:5000`
    }
    return 'http://localhost:5000'
  }

  // Check if user is authenticated via cookie on app load
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        console.log('User session verified:', userData)
        // If we have a valid session, get the Firebase user
        if (auth.currentUser) {
          setUser(auth.currentUser)
        }
      }
    } catch (error) {
      console.log('No valid session found:', error.message)
    }
  }

  useEffect(() => {
    // Handle redirect result first
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          // User signed in via redirect
          const idToken = await result.user.getIdToken()
          const backendUrl = getBackendUrl()
          
          const response = await fetch(`${backendUrl}/api/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            credentials: 'include',
            body: JSON.stringify({
              uid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName,
              picture: result.user.photoURL
            })
          })
          
          if (response.ok) {
            console.log('User verified with backend after redirect')
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error)
      }
    }

    handleRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Check backend session when Firebase user is available
        await checkAuthStatus()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      
      // Send user data to backend for verification/creation
      if (result.user) {
        const idToken = await result.user.getIdToken()
        
        // Call backend to verify/create user profile with credentials
        const response = await fetch('http://localhost:8000/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            picture: result.user.photoURL
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to verify user with backend')
        }
        
        const userData = await response.json()
        console.log('User verified with backend:', userData)
        
        // Manually set user state to avoid waiting for onAuthStateChanged
        setUser(result.user)
      }
      
      setLoading(false)
      return result
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call backend logout to clear cookie
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Sign out from Firebase
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
