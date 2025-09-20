import { useEffect, useState, useCallback, useRef } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { onAuthStateChanged, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth'
import { AuthContext } from './AuthContext'
import { getDeviceInfo } from '../utils/mobileUtils'
import { getBackendUrl } from '../utils/config'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const tokenRefreshIntervalRef = useRef(null)

  // Helper function to cleanup token refresh interval
  const cleanupTokenRefresh = useCallback(() => {
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current)
      tokenRefreshIntervalRef.current = null
    }
  }, [])

  // Handle automatic logout when token expires
  const handleTokenExpiration = useCallback(async () => {
    console.log('Token expired, logging out user')
    try {
      // Cleanup token refresh interval
      cleanupTokenRefresh()
      
      // Call backend logout to clear cookie
      await fetch(`${getBackendUrl()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      // Sign out from Firebase
      await signOut(auth)
    } catch (error) {
      console.error('Error during automatic logout:', error)
    }
  }, [cleanupTokenRefresh])

  // Log device info for debugging
  useEffect(() => {
    const deviceInfo = getDeviceInfo()
    console.log('Device Info:', deviceInfo)
  }, [])

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired event received, logging out user')
      handleTokenExpiration()
    }

    window.addEventListener('token-expired', handleTokenExpired)
    
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired)
    }
  }, [handleTokenExpiration])

  // Refresh Firebase token and update backend
  const refreshToken = useCallback(async () => {
    if (!user) return false

    try {
      // Get fresh token from Firebase
      const idToken = await user.getIdToken(true) // Force refresh
      
      // Send to backend to refresh session
      const response = await fetch(`${getBackendUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        console.log('Token refreshed successfully')
        return true
      } else {
        console.error('Token refresh failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }, [user])

  // Setup token refresh interval
  const setupTokenRefresh = useCallback(() => {
    // Clear existing interval if any
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current)
    }
    
    // Refresh token every 45 minutes (Firebase tokens expire after 1 hour)
    const interval = setInterval(async () => {
      const success = await refreshToken()
      if (!success) {
        await handleTokenExpiration()
      }
    }, 45 * 60 * 1000) // 45 minutes
    
    tokenRefreshIntervalRef.current = interval
  }, [refreshToken, handleTokenExpiration])

  // Check if user is authenticated via cookie on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/profile`, {
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
  }, [])

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
        // Setup token refresh for authenticated user
        setupTokenRefresh()
      } else {
        setUser(null)
        // Cleanup token refresh when user logs out
        cleanupTokenRefresh()
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      cleanupTokenRefresh()
    }
  }, [setupTokenRefresh, cleanupTokenRefresh, checkAuthStatus])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      
      // Send user data to backend for verification/creation
      if (result.user) {
        const idToken = await result.user.getIdToken()
        
        // Call backend to verify/create user profile with credentials
        const response = await fetch(`${getBackendUrl()}/api/auth/verify`, {
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
        // Setup token refresh for newly signed in user
        setupTokenRefresh()
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
      // Cleanup token refresh interval
      cleanupTokenRefresh()
      
      // Call backend logout to clear cookie
      await fetch(`${getBackendUrl()}/api/auth/logout`, {
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
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
