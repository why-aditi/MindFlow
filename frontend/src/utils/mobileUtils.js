// Mobile detection and utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768
}

export const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = () => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { isMobile: false, isIOS: false, isAndroid: false }
  
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  }
}

// Mobile-specific Firebase configuration
export const getMobileFirebaseConfig = () => {
  return {
    // Add mobile-specific configurations if needed
    authDomain: "biteme-9738c.firebaseapp.com",
    // Ensure proper redirect URLs for mobile
    redirectUrl: window.location.origin
  }
}

