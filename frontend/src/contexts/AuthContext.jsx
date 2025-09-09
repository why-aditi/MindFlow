import { useEffect, useState } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
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
        
        // Call backend to verify/create user profile
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
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
