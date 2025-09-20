import { useState, useRef, useEffect, useCallback } from 'react'
import poseTrackingService from '../services/mediapipePoseService'

export const useMindfulSession = () => {
  // State
  const [sessionState, setSessionState] = useState('idle')
  const [sessionData, setSessionData] = useState({
    elapsedTime: 0,
    remainingTime: 0,
    countdown: 0,
    repCount: 0,
    accuracy: 0,
    poseCorrect: false,
    qualityScore: 0,
    actualPoseTime: 0
  })
  const [isTracking, setIsTracking] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [poseTrackingActive, setPoseTrackingActive] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Refs
  const intervalRef = useRef(null)
  const isCompletingRef = useRef(false)
  const errorTimeoutRef = useRef(null)
  const successTimeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const poseDefinitionRef = useRef(null)
  const videoRef = useRef(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  // Helper functions to set messages with auto-dismiss
  const setErrorMessage = useCallback((message) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }
    setCameraError(message)
    errorTimeoutRef.current = setTimeout(() => {
      setCameraError(null)
    }, 5000)
  }, [])

  const setSuccessMessage = useCallback((message) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    // This would need to be connected to a success state in the parent component
    successTimeoutRef.current = setTimeout(() => {
      // Clear success message
    }, 5000)
  }, [])

  // Text-to-speech function
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 0.7
        utterance.onend = resolve
        utterance.onerror = resolve
        speechSynthesis.speak(utterance)
      })
    }
    return Promise.resolve()
  }, [])

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      setCameraStream(stream)
      setCameraError(null)
      return true
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError('Camera access denied. Please allow camera access to use pose tracking.')
      return false
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }, [cameraStream])

  // Session control functions
  const startSession = useCallback((selectedCategory, selectedActivity, activitySettings) => {
    setSessionState('pose_definition')
    setSessionData({
      elapsedTime: 0,
      remainingTime: 0,
      countdown: 0,
      repCount: 0,
      accuracy: 0,
      poseCorrect: false,
      qualityScore: 0,
      actualPoseTime: 0
    })
    setIsCompleting(false)
    isCompletingRef.current = false
  }, [])

  const stopSession = useCallback((forceComplete = false) => {
    setSessionState('completed')
    setIsTracking(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    
    if (poseDefinitionRef.current) {
      clearTimeout(poseDefinitionRef.current)
    }
    
    stopCamera()
    poseTrackingService.stopTracking()
    setPoseTrackingActive(false)
  }, [stopCamera])

  const resetSession = useCallback(() => {
    setSessionState('idle')
    setSessionData({
      elapsedTime: 0,
      remainingTime: 0,
      countdown: 0,
      repCount: 0,
      accuracy: 0,
      poseCorrect: false,
      qualityScore: 0,
      actualPoseTime: 0
    })
    setIsTracking(false)
    setIsCompleting(false)
    isCompletingRef.current = false
    setCameraError(null)
  }, [])

  return {
    // State
    sessionState,
    setSessionState,
    sessionData,
    setSessionData,
    isTracking,
    setIsTracking,
    cameraStream,
    setCameraStream,
    cameraError,
    setCameraError,
    poseTrackingActive,
    setPoseTrackingActive,
    isCompleting,
    setIsCompleting,
    
    // Refs
    intervalRef,
    isCompletingRef,
    countdownRef,
    poseDefinitionRef,
    videoRef,
    
    // Functions
    setErrorMessage,
    setSuccessMessage,
    speak,
    startCamera,
    stopCamera,
    startSession,
    stopSession,
    resetSession
  }
}
