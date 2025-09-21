import { useState, useEffect, useRef, useCallback } from 'react'
// import { useAuth } from '../hooks/useAuth' // Unused for now
import { Button } from '../components/ui/Button'
import ComingSoonPopup from '../components/ui/ComingSoonPopup'
import { motion, AnimatePresence } from 'framer-motion'
import poseTrackingService from '../services/mediapipePoseService'
import { 
  Brain, 
  Heart, 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Target,
  Settings,
  Zap,
  Moon,
  Sun,
  Wind,
  Sparkles,
  Leaf,
  Waves,
  Cloud,
  Volume2,
  VolumeX
} from 'lucide-react'

const MindfulMovement = () => {
  // const { user } = useAuth() // Unused for now
  const [selectedCategory, setSelectedCategory] = useState(null) // 'mental' or 'physical'
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [activitySettings, setActivitySettings] = useState({
    duration: 5, // minutes
    difficulty: 'easy', // easy, medium, hard
    targetReps: 10, // for physical exercises
    restTime: 30 // seconds between sets
  })
  const [sessionState, setSessionState] = useState('idle') // idle, pose_definition, countdown, active, completed
  const [sessionData, setSessionData] = useState({
    elapsedTime: 0,
    remainingTime: 0,
    actualPoseTime: 0, // Time spent in correct pose
    accuracy: 0,
    poseCorrect: false,
    countdown: 0,
    repCount: 0,
    holdTime: 0,
    qualityScore: 0
  })
  const [isTracking, setIsTracking] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [poseTrackingActive, setPoseTrackingActive] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false) // Prevent multiple completions
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false)
  
  // Breathing exercise specific state
  const [breathingPhase, setBreathingPhase] = useState('inhale') // 'inhale', 'exhale', 'hold'
  const [breathingCycle, setBreathingCycle] = useState(0)
  const [breathingProgress, setBreathingProgress] = useState(0) // 0-100 for visual indicator

  const intervalRef = useRef(null)
  const isCompletingRef = useRef(false) // Ref to prevent multiple completions
  const errorTimeoutRef = useRef(null)
  const successTimeoutRef = useRef(null)
  const breathingIntervalRef = useRef(null)
  const breathingProgressRef = useRef(null)

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
  const setErrorMessage = (message) => {
    // Clear existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }
    
    setError(message)
    
    // Auto-dismiss after 5 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setError(null)
    }, 5000)
  }

  const setSuccessMessage = (message) => {
    // Clear existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    
    setSuccess(message)
    
    // Auto-dismiss after 5 seconds
    successTimeoutRef.current = setTimeout(() => {
      setSuccess(null)
    }, 5000)
  }

  // Navigation function to handle back button
  const handleBackNavigation = () => {
    if (selectedActivity) {
      // If we're in an activity session, go back to activity selection
      setSelectedActivity(null)
      setSessionState('idle')
      setSessionData({
        elapsedTime: 0,
        remainingTime: 0,
        actualPoseTime: 0,
        accuracy: 0,
        poseCorrect: false,
        countdown: 0,
        repCount: 0,
        holdTime: 0,
        qualityScore: 0
      })
      setError(null)
      setSuccess(null)
      // Clear timeouts when manually clearing messages
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = null
      }
      setIsCompleting(false)
      isCompletingRef.current = false
    } else if (selectedCategory) {
      // If we're in activity selection, go back to category selection
      setSelectedCategory(null)
    } else {
      // If we're in category selection, go back to previous page
      window.history.back()
    }
  }
  const videoRef = useRef(null)
  const countdownRef = useRef(null)
  const poseDefinitionRef = useRef(null)
  
  // Callback ref to connect stream immediately when video element is created
  const setVideoRef = (element) => {
    if (videoRef.current === element) return // Prevent re-connection
    
    videoRef.current = element
    if (element && cameraStream && !element.srcObject) {
      console.log('Video element created, connecting stream immediately')
      element.srcObject = cameraStream
    }
  }

  // Mental wellness activities
  const mentalActivities = [
    {
      id: 'meditation',
      name: 'Meditation',
      description: 'Mindful breathing and stillness practice',
      icon: '🧘',
      color: 'from-violet-400 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200'
    },
    {
      id: 'breathing',
      name: 'Breathing Exercise',
      description: 'Guided breathing for relaxation',
      icon: '🫁',
      color: 'from-sky-400 to-cyan-500',
      bgColor: 'from-sky-50 to-cyan-50',
      borderColor: 'border-sky-200'
    },
    {
      id: 'coming_soon_mental',
      name: 'Coming Soon',
      description: 'New mindfulness practices coming soon!',
      icon: '🚀',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      isComingSoon: true
    }
  ]

  // Physical wellness activities
  const physicalActivities = [
    {
      id: 'bicep_curl',
      name: 'Bicep Curls',
      description: 'Upper arm strength training',
      icon: '💪',
      color: 'from-rose-400 to-pink-500',
      bgColor: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200',
      type: 'rep'
    },
    {
      id: 'squat',
      name: 'Squats',
      description: 'Lower body strength and endurance',
      icon: '🦵',
      color: 'from-orange-400 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      type: 'rep'
    },
    {
      id: 'coming_soon',
      name: 'Coming Soon',
      description: 'New exercises coming soon!',
      icon: '🚀',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      type: 'coming_soon',
      isComingSoon: true
    }
  ]

  // Camera management functions
  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('Requesting camera access...')
      
      // Try different camera configurations
      const configs = [
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        },
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        },
        {
          video: true,
          audio: false
        }
      ]
      
      let stream = null
      for (const config of configs) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(config)
          console.log('Camera stream obtained with config:', config)
          break
        } catch (configError) {
          console.log('Config failed, trying next:', configError.message)
        }
      }
      
      if (!stream) {
        throw new Error('All camera configurations failed')
      }
      
      setCameraStream(stream)
      
      // Ensure video element is connected
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('Video element connected to stream')
      } else {
        console.log('Video ref not available yet')
      }
      
      return true
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError(`Camera access failed: ${error.message}`)
      return false
    }
  }

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [cameraStream])

  // Text-to-speech function
  const speak = (text) => {
    if (isMuted) return Promise.resolve()
    
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
  }

  // Get exercise-specific pose instructions
  const getExerciseInstructions = (exerciseId) => {
    const instructions = {
      bicep_curl: {
        title: 'Bicep Curl Position',
        icon: '💪',
        steps: [
          'Stand with feet shoulder-width apart',
          'Hold weights or keep arms at your sides',
          'Keep your back straight and core engaged',
          'Start with arms fully extended',
          'Curl weights up by bending at the elbows',
          'Lower weights back down slowly and controlled'
        ],
        tips: [
          'Keep your elbows close to your body',
          'Don\'t swing the weights',
          'Focus on the bicep muscle contraction'
        ]
      },
      squat: {
        title: 'Squat Position',
        icon: '🦵',
        steps: [
          'Stand with feet shoulder-width apart',
          'Point toes slightly outward',
          'Keep your chest up and back straight',
          'Lower your body by bending at hips and knees',
          'Go down until thighs are parallel to floor',
          'Push through heels to return to starting position'
        ],
        tips: [
          'Keep your knees in line with your toes',
          'Don\'t let knees cave inward',
          'Engage your core throughout the movement'
        ]
      },
      coming_soon: {
        title: 'Coming Soon',
        icon: '🚀',
        steps: [
          'This exercise is coming soon',
          'Stay tuned for updates',
          'Check back later for new content'
        ],
        tips: [
          'More exercises are being developed',
          'Follow our updates for new releases'
        ]
      }
    }
    return instructions[exerciseId] || instructions.bicep_curl
  }

  // Mental wellness pose definition
  const showPoseDefinition = () => {
    setSessionState('pose_definition')
    
    // Different instructions based on activity
    let instruction = "Please sit comfortably with your back straight, hands resting on your knees, and close your eyes gently."
    if (selectedActivity?.id === 'breathing') {
      instruction = "Find a comfortable seated or standing position. Relax your shoulders and close your eyes gently. We'll guide you through a calming breathing exercise."
    } else if (selectedActivity?.id === 'coming_soon_mental') {
      instruction = "This mindfulness practice is coming soon. Stay tuned for updates!"
    }
    
    speak(instruction)
    
    // Show pose definition for 10 seconds, then show manual start button
    poseDefinitionRef.current = setTimeout(() => {
      setSessionState('ready_to_start')
    }, 10000)
  }

  // Manual start function
  const startExerciseManually = async () => {
    setSessionState('countdown')
    let count = 3
    
    // Set initial countdown display and speak "3" immediately
        setSessionData(prev => ({ ...prev, countdown: count }))
    await speak(count.toString())
    
    // Wait 1 second, then continue countdown
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Continue with 2, 1, Let's start
    for (let i = 2; i >= 1; i--) {
      count = i
      setSessionData(prev => ({ ...prev, countdown: count }))
      await speak(count.toString())
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Final "Let's start"
    setSessionData(prev => ({ ...prev, countdown: "Let's start" }))
    await speak("Let's start")
    
    // Start the exercise
    if (selectedCategory === 'mental') {
          startMeditation()
        } else {
          startPhysicalExercise(selectedActivity)
        }
      }
    
  // Countdown function (kept for backward compatibility)
  const startCountdown = () => {
    startExerciseManually()
  }

  // Start mental wellness session
  const startMeditation = async () => {
    try {
      setSessionState('active')
      setIsTracking(true)
      setIsCompleting(false)
      isCompletingRef.current = false // Reset completion flag
      
      // Check if this is a breathing exercise
      if (selectedActivity?.id === 'breathing') {
        // Start breathing exercise with enhanced guidance
        startBreathingExercise()
      } else {
        // Start regular meditation
        startRegularMeditation()
      }
      
    } catch (error) {
      console.error('Error starting mental wellness session:', error)
      setErrorMessage('Failed to start mindfulness session')
    }
  }

  // Start regular meditation session
  const startRegularMeditation = async () => {
    // Start camera
    const cameraStarted = await startCamera()
    if (!cameraStarted) {
      setErrorMessage('Camera access required for pose tracking')
      return
    }
    
    // Initialize MediaPipe pose tracking service
    console.log('Initializing MediaPipe pose tracking service for mental wellness...')
    const initialized = await poseTrackingService.initialize()
    if (!initialized) {
      setErrorMessage('Failed to initialize pose tracking service')
      return
    }
    
    // Initialize pose tracking
    setTimeout(() => {
      if (videoRef.current) {
        const poseStarted = poseTrackingService.startTracking(
          videoRef.current,
          selectedActivity?.id || 'meditation',
          (results) => {
            setSessionData(prev => ({
              ...prev,
              accuracy: results.accuracy || 0,
              poseCorrect: results.poseDetected && results.accuracy >= 100
            }))
          },
          (error) => {
            console.error('Pose tracking error:', error)
          }
        )
        
        if (poseStarted) {
          setPoseTrackingActive(true)
        }
      }
    }, 1000)
    
    // Start timer
    startTimer()
    setSuccessMessage(`${selectedActivity?.name} session started!`)
  }

  // Start enhanced breathing exercise
  const startBreathingExercise = async () => {
    // Reset breathing state
    setBreathingPhase('inhale')
    setBreathingCycle(0)
    setBreathingProgress(0)
    
    // Start simplified timer for breathing (no pose tracking needed)
    startBreathingTimer()
    
    // Start breathing guidance
    startBreathingGuidance()
    
    setSuccessMessage('Breathing exercise started! Follow the voice guidance.')
  }

  // Timer function for regular meditation
  const startTimer = () => {
    // Clear any existing timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const totalSeconds = activitySettings.duration * 60
    setSessionData(prev => ({ ...prev, remainingTime: totalSeconds }))
    
    intervalRef.current = setInterval(() => {
      setSessionData(prev => {
        const newElapsed = prev.elapsedTime + 1
        const newRemaining = Math.max(0, totalSeconds - newElapsed)
        
        // Only count meditation time if all landmarks are visible (pose detected and accuracy is 100%)
        if (prev.poseCorrect && prev.accuracy >= 100) {
          const newActualPoseTime = Math.min(prev.actualPoseTime + 1, totalSeconds) // Cap at target duration
          
          // Check if we've reached the target duration (exact match to prevent going over)
          if (newActualPoseTime >= totalSeconds && !isCompletingRef.current) {
            isCompletingRef.current = true // Prevent multiple completions
            setIsCompleting(true) // Update state for UI
            // Complete the session only if we've spent enough time in correct pose
            setTimeout(() => {
              stopSession(true) // Force complete since we've reached the target
            }, 1000)
          }
          
          return {
            ...prev,
            elapsedTime: newElapsed,
            actualPoseTime: newActualPoseTime,
            remainingTime: newRemaining
          }
        } else {
          return {
            ...prev,
            elapsedTime: newElapsed,
            remainingTime: newRemaining
          }
        }
      })
    }, 1000)
  }

  // Simplified timer for breathing exercise
  const startBreathingTimer = () => {
    // Clear any existing timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const totalSeconds = activitySettings.duration * 60
    setSessionData(prev => ({ 
      ...prev, 
      remainingTime: totalSeconds,
      actualPoseTime: 0 // Reset for breathing
    }))
    
    intervalRef.current = setInterval(() => {
      setSessionData(prev => {
        const newElapsed = prev.elapsedTime + 1
        const newRemaining = Math.max(0, totalSeconds - newElapsed)
        const newActualPoseTime = newElapsed // For breathing, all time counts
        
        // Check if we've reached the target duration
        if (newElapsed >= totalSeconds && !isCompletingRef.current) {
          isCompletingRef.current = true
          setIsCompleting(true)
          setTimeout(() => {
            stopBreathingExercise()
          }, 1000)
        }
        
        return {
          ...prev,
          elapsedTime: newElapsed,
          actualPoseTime: newActualPoseTime,
          remainingTime: newRemaining,
          accuracy: 100, // Always 100% for breathing exercise
          poseCorrect: true
        }
      })
    }, 1000)
  }

  // Breathing guidance function
  const startBreathingGuidance = () => {
    // Clear any existing breathing timers
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current)
    }
    if (breathingProgressRef.current) {
      clearInterval(breathingProgressRef.current)
    }

    const cycleDuration = 14000 // 14 seconds total cycle (7 inhale + 7 exhale)
    const phaseDuration = 7000 // 7 seconds per phase
    
    let currentPhase = 'inhale'
    let cycleCount = 0
    
    // Initial guidance
    speak('Breathe in slowly')
    setBreathingPhase('inhale')
    
    // Progress indicator updates every 100ms for smooth animation
    breathingProgressRef.current = setInterval(() => {
      setBreathingProgress(prev => {
        if (currentPhase === 'inhale') {
          return Math.min(prev + (100 / (phaseDuration / 100)), 100)
        } else {
          return Math.max(prev - (100 / (phaseDuration / 100)), 0)
        }
      })
    }, 100)
    
    // Main breathing cycle timer
    breathingIntervalRef.current = setInterval(() => {
      if (currentPhase === 'inhale') {
        currentPhase = 'exhale'
        setBreathingPhase('exhale')
        setBreathingProgress(100) // Start from full for exhale
        speak('Breathe out slowly')
      } else {
        currentPhase = 'inhale'
        cycleCount++
        setBreathingPhase('inhale')
        setBreathingCycle(cycleCount)
        setBreathingProgress(0) // Start from empty for inhale
        speak('Breathe in slowly')
      }
    }, phaseDuration)
  }

  // Stop breathing exercise
  const stopBreathingExercise = () => {
    // Clear breathing timers
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current)
    }
    if (breathingProgressRef.current) {
      clearInterval(breathingProgressRef.current)
    }
    
    // Complete the session
    stopSession(true)
  }

  // Stop session (works for both meditation and physical exercises)
  const stopSession = (forceComplete = false) => {
    // Check if session was actually completed for mental wellness BEFORE setting state
    if (selectedCategory === 'mental' && !forceComplete) {
      const totalSeconds = activitySettings.duration * 60
      if (sessionData.actualPoseTime < totalSeconds) {
        // Session not completed - show error but don't change state to completed
        speak(`Session not completed. You need to maintain correct pose for the full duration.`)
        setErrorMessage(`Session not completed. You spent ${formatTime(sessionData.actualPoseTime)} in correct pose, but needed ${formatTime(totalSeconds)}.`)
        return
      }
    }
    
    // Only set to completed if validation passes or force complete
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
    
    const sessionType = selectedCategory === 'mental' ? 'Mindfulness' : 'Exercise'
    
    // Only show congratulations if session was actually completed (forceComplete = true)
    if (forceComplete) {
      // Provide specific completion message based on activity type
      if (selectedCategory === 'mental') {
        const durationText = formatDurationForSpeech(activitySettings.duration)
        speak(`Congratulations! You completed ${durationText} of ${selectedActivity?.name.toLowerCase()}!`)
      } else {
        speak(`Congratulations! You completed ${activitySettings.targetReps} ${selectedActivity?.name.toLowerCase()}!`)
      }
      
      setSuccessMessage(`${sessionType} session completed successfully!`)
    } else {
      // Manual stop - just show that session was stopped
      setSuccessMessage(`${sessionType} session stopped.`)
    }
  }

  // Handle activity selection
  const handleActivitySelect = (activity) => {
    // Check if this is a coming soon item
    if (activity.isComingSoon) {
      setShowComingSoonPopup(true)
      return
    }
    
    setSelectedActivity(activity)
    setShowSettingsPopup(true)
  }

  // Show exercise pose instructions
  const showExerciseInstructions = (activity) => {
    setSessionState('pose_definition')
    const instructions = getExerciseInstructions(activity.id)
    speak(`Get ready for ${activity.name}. ${instructions.steps[0]}. ${instructions.steps[1]}. ${instructions.steps[2]}.`)
    
    // Show instructions for 10 seconds, then show manual start button
    poseDefinitionRef.current = setTimeout(() => {
      setSessionState('ready_to_start')
    }, 10000)
  }

  // Start physical exercise
  const startPhysicalExercise = async (activity) => {
    try {
      setSessionState('active')
      setIsTracking(true)
      setIsCompleting(false)
      isCompletingRef.current = false // Reset completion flag
      setError(null)
      
      // Start camera
      const cameraStarted = await startCamera()
      if (!cameraStarted) {
        setErrorMessage('Camera access required for exercise tracking')
        return
      }
      
      // Initialize MediaPipe pose tracking service
      console.log('Initializing MediaPipe pose tracking service...')
      const initialized = await poseTrackingService.initialize()
      if (!initialized) {
        setErrorMessage('Failed to initialize pose tracking service')
        return
      }
      
      // Initialize pose tracking for the specific exercise
      setTimeout(() => {
        if (videoRef.current) {
          const poseStarted = poseTrackingService.startTracking(
            videoRef.current,
            activity.id,
            (results) => {
              setSessionData(prev => {
                const newRepCount = results.repCount || 0
                const newData = {
                  ...prev,
                  repCount: newRepCount,
                  holdTime: results.holdTime || 0,
                  accuracy: results.accuracy || 0,
                  qualityScore: results.qualityScore || 0,
                  poseCorrect: results.poseDetected && results.accuracy > 70
                }
                
                // Check if target reps reached
                if (newRepCount >= activitySettings.targetReps && !isCompletingRef.current) {
                  isCompletingRef.current = true // Prevent multiple completions
                  setIsCompleting(true) // Update state for UI
                  setTimeout(() => {
                    stopSession(true) // Force complete since we've reached the target
                  }, 1000)
                }
                
                return newData
              })
            },
            (error) => {
              console.error('Pose tracking error:', error)
            }
          )
          
          if (poseStarted) {
            setPoseTrackingActive(true)
          }
        }
      }, 1000)
      
      // Start timer for physical exercises (no time limit, just track reps)
      startExerciseTimer()
      setSuccessMessage(`${activity.name} session started!`)
      
    } catch (error) {
      console.error('Error starting physical exercise:', error)
      setErrorMessage('Failed to start exercise session')
    }
  }

  // Start exercise timer (for physical exercises)
  const startExerciseTimer = () => {
    intervalRef.current = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1
      }))
    }, 1000)
  }

  // Start activity with settings
  const startActivityWithSettings = () => {
    setShowSettingsPopup(false)
    
    if (selectedCategory === 'mental') {
      // All mental wellness activities use duration-based approach
      showPoseDefinition()
    } else {
      // All physical wellness activities use reps-based approach
      showExerciseInstructions(selectedActivity)
    }
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format duration for speech (e.g., "30 seconds", "5 minutes")
  const formatDurationForSpeech = (duration) => {
    if (duration < 1) {
      const seconds = Math.round(duration * 60)
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    } else {
      return `${duration} minute${duration !== 1 ? 's' : ''}`
    }
  }

  // Connect camera stream to video element when stream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log('Connecting stream to video element in useEffect')
      videoRef.current.srcObject = cameraStream
    } else if (cameraStream && !videoRef.current) {
      console.log('Stream available but video ref not ready yet')
    }
  }, [cameraStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (poseDefinitionRef.current) {
        clearTimeout(poseDefinitionRef.current)
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current)
      }
      if (breathingProgressRef.current) {
        clearInterval(breathingProgressRef.current)
      }
      stopCamera()
      poseTrackingService.stopTracking()
    }
  }, [stopCamera])

  return (
    <div className="min-h-screen wellness-bg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 text-sky-200/30"
        >
          <Cloud className="w-20 h-20" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, 15, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 text-emerald-200/25"
        >
          <Leaf className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-40 text-violet-200/20"
        >
          <Waves className="w-18 h-18" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-wellness border-b border-emerald-100/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={handleBackNavigation}
                className="mr-6 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-slate-700">Mindful Movement</h1>
                  <p className="text-sm text-slate-500">Wellness & Mindfulness</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                onClick={startCamera}
                className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-rose-800 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-emerald-800 font-medium">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Selection */}
        {!selectedCategory && (
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-light text-slate-700 mb-6"
            >
              Choose Your Wellness Path
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-12"
            >
              Select your focus area to begin your mindful journey
            </motion.p>

            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-wellness hover:shadow-wellness-lg transition-all duration-500 cursor-pointer border border-violet-100 hover:border-violet-200"
                onClick={() => setSelectedCategory('mental')}
              >
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-light text-slate-700">Mental Wellness</h3>
                  <p className="text-slate-500 font-light leading-relaxed text-lg">
                    Focus on mindfulness, meditation, and mental clarity
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-wellness hover:shadow-wellness-lg transition-all duration-500 cursor-pointer border border-emerald-100 hover:border-emerald-200"
                onClick={() => setSelectedCategory('physical')}
              >
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-light text-slate-700">Physical Wellness</h3>
                  <p className="text-slate-500 font-light leading-relaxed text-lg">
                    Gentle movement, stretching, and body awareness
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Activity Selection */}
        {selectedCategory && !selectedActivity && (
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className="mb-8 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
              <h2 className="text-4xl font-light text-slate-700 mb-4">
                {selectedCategory === 'mental' ? 'Mental Wellness' : 'Physical Wellness'}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Choose your preferred activity to begin
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {(selectedCategory === 'mental' ? mentalActivities : physicalActivities).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-wellness cursor-pointer transition-all duration-300 border ${activity.borderColor} hover:shadow-wellness-lg`}
                  onClick={() => handleActivitySelect(activity)}
                >
                  <div className="text-center space-y-6">
                    <div className="text-6xl mb-2">{activity.icon}</div>
                    <h3 className="text-xl font-light text-slate-700">{activity.name}</h3>
                    <p className="text-slate-500 font-light leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Session */}
        {selectedActivity && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-wellness-lg p-12 border border-emerald-100">
            {/* Back Button and Skip Button for Activity Session */}
            <div className="mb-8 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedActivity(null)
                  setSessionState('idle')
                  setSessionData({
                    elapsedTime: 0,
                    remainingTime: 0,
                    actualPoseTime: 0,
                    accuracy: 0,
                    poseCorrect: false,
                    countdown: 0,
                    repCount: 0,
                    holdTime: 0,
                    qualityScore: 0
                  })
                  setError(null)
                  setSuccess(null)
                  setIsCompleting(false)
      isCompletingRef.current = false
                }}
                className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
              </Button>
              
              {/* Skip Button - only show during pose definition */}
              {sessionState === 'pose_definition' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Clear the timeout and go directly to ready_to_start
                    if (poseDefinitionRef.current) {
                      clearTimeout(poseDefinitionRef.current)
                    }
                    setSessionState('ready_to_start')
                  }}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
                >
                  Skip
                </Button>
              )}
            </div>
            
            <div className="text-center mb-12">
              <div className="text-8xl mb-6">{selectedActivity.icon}</div>
              <h2 className="text-4xl font-light text-slate-700 mb-4">{selectedActivity.name} Session</h2>
              <div className="flex items-center justify-center">
                <div className={`px-6 py-3 rounded-full text-lg font-medium ${
                  sessionState === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : sessionState === 'completed'
                    ? 'bg-violet-100 text-violet-700'
                    : sessionState === 'ready_to_start'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-sky-100 text-sky-700'
                }`}>
                  {sessionState === 'idle' && 'Ready to Begin'}
                  {sessionState === 'pose_definition' && 'Get into Position'}
                  {sessionState === 'ready_to_start' && 'Ready to Start'}
                  {sessionState === 'countdown' && 'Get Ready'}
                  {sessionState === 'active' && (selectedCategory === 'mental' ? 'Mindfulness in Progress' : 'Exercise in Progress')}
                  {sessionState === 'completed' && 'Session Complete'}
                </div>
              </div>
            </div>

            {/* Camera Feed - Hide for breathing exercises */}
            {isTracking && selectedActivity?.id !== 'breathing' && (
              <div className="mb-12">
                {/* Camera Video Feed */}
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl overflow-hidden mx-auto max-w-3xl border border-emerald-200 shadow-wellness mb-8">
                  {cameraStream ? (
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-96 object-cover"
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="w-8 h-8 text-white" />
                      </div>
                        <p className="text-slate-600 font-medium">Preparing camera...</p>
                    </div>
                      </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-rose-600">
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AlertCircle className="w-6 h-6" />
                    </div>
                        <p className="text-sm font-medium">{cameraError}</p>
                      </div>
                    </div>
                )}
              </div>

                {/* Live Pose Tracking Info */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-slate-700 mb-4">Live Pose Tracking</h3>
                  <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${cameraStream ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span>Camera: {cameraStream ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${poseTrackingActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span>Tracking: {poseTrackingActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${videoRef.current ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span>Video Element: {videoRef.current ? 'Ready' : 'Not Ready'}</span>
                    </div>
                  </div>
                  
                  {/* Pose Feedback for Mental Wellness */}
                  {selectedCategory === 'mental' && sessionState === 'active' && (
                    <div className="mt-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 max-w-2xl mx-auto">
                      <h4 className="text-lg font-medium text-slate-700 mb-3">Pose Guidance</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className={`p-3 rounded-lg ${sessionData.accuracy >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          <div className="font-medium">Landmark Visibility</div>
                          <div className="text-lg font-bold">{sessionData.accuracy}%</div>
                        </div>
                        <div className={`p-3 rounded-lg ${sessionData.poseCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          <div className="font-medium">Pose Status</div>
                          <div className="text-lg font-bold">{sessionData.poseCorrect ? '✓ All Visible' : '✗ Adjust'}</div>
                        </div>
                      </div>
                      {sessionData.accuracy < 100 && (
                        <div className="mt-4 text-sm text-slate-600">
                          <p className="font-medium">Tips for better pose:</p>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Sit with your back straight</li>
                            <li>Keep your hips lower than shoulders</li>
                            <li>Bend your knees in seated position</li>
                            <li>Center your head between shoulders</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Breathing Visualization - Only for breathing exercise */}
            {selectedActivity?.id === 'breathing' && sessionState === 'active' && (
              <div className="mb-12 max-w-md mx-auto">
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl p-8 border border-sky-200 text-center">
                  {/* Breathing Circle */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto relative">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-sky-200"></div>
                      
                      {/* Animated breathing circle */}
                      <motion.div
                        animate={{
                          scale: breathingPhase === 'inhale' ? 1.2 : 0.8,
                          opacity: breathingPhase === 'inhale' ? 0.8 : 0.4
                        }}
                        transition={{
                          duration: 7,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-300 to-cyan-400 flex items-center justify-center"
                      >
                        <div className="text-white font-medium text-lg">
                          {breathingPhase === 'inhale' ? '↑' : '↓'}
                        </div>
                      </motion.div>
                      
                      {/* Progress ring */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-sky-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - breathingProgress / 100)}`}
                            className="text-sky-500 transition-all duration-100 ease-linear"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Breathing Instructions */}
                  <div className="space-y-2">
                    <div className="text-2xl font-light text-sky-700 capitalize">
                      {breathingPhase}
                    </div>
                    <div className="text-sm text-sky-600">
                      Cycle {breathingCycle + 1}
                    </div>
                    <div className="text-xs text-slate-500">
                      Follow the circle and voice guidance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Stats */}
            {(sessionState === 'active' || sessionState === 'completed') && (
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                {selectedCategory === 'mental' ? (
                  <>
                    {selectedActivity?.id === 'breathing' ? (
                      // Breathing exercise stats
                      <>
                        <div className="text-center bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
                          <div className="text-3xl font-light text-sky-600 mb-2">
                            {formatTime(sessionData.elapsedTime)}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Session Time</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                          <div className="text-3xl font-light text-cyan-600 mb-2">
                            {formatTime(sessionData.remainingTime)}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Remaining</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                          <div className="text-3xl font-light text-blue-600 mb-2">
                            {breathingCycle}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Breathing Cycles</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                          <div className="text-3xl font-light text-indigo-600 mb-2 capitalize">
                            {breathingPhase}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Current Phase</div>
                        </div>
                      </>
                    ) : (
                      // Regular meditation stats
                      <>
                        <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                          <div className="text-3xl font-light text-emerald-600 mb-2">
                            {formatTime(sessionData.actualPoseTime)}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Correct Pose Time</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                          <div className="text-3xl font-light text-teal-600 mb-2">
                            {formatTime(Math.max(0, (activitySettings.duration * 60) - sessionData.actualPoseTime))}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Remaining</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                          <div className="text-3xl font-light text-sky-600 mb-2">
                            {sessionData.accuracy}%
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Pose Accuracy</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                          <div className="text-3xl font-light text-violet-600 mb-2">
                            {sessionData.poseCorrect ? '✓' : '✗'}
                          </div>
                          <div className="text-sm text-slate-600 font-medium">Pose Status</div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                      <div className="text-3xl font-light text-emerald-600 mb-2">
                        {sessionData.repCount}/{activitySettings.targetReps}
                        </div>
                      <div className="text-sm text-slate-600 font-medium">Reps Progress</div>
                      </div>
                    <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                      <div className="text-3xl font-light text-teal-600 mb-2">
                        {Math.round((sessionData.repCount / activitySettings.targetReps) * 100)}%
                    </div>
                      <div className="text-sm text-slate-600 font-medium">Completion</div>
                        </div>
                    <div className="text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                      <div className="text-3xl font-light text-sky-600 mb-2">
                        {sessionData.accuracy}%
                      </div>
                      <div className="text-sm text-slate-600 font-medium">Form Accuracy</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                      <div className="text-3xl font-light text-violet-600 mb-2">
                        {sessionData.qualityScore}
                </div>
                      <div className="text-sm text-slate-600 font-medium">Quality Score</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Countdown Display */}
            {sessionState === 'countdown' && (
              <div className="text-center mb-12">
                <motion.div
                  key={sessionData.countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-8xl font-light text-emerald-600 mb-4"
                >
                  {sessionData.countdown}
                </motion.div>
                <p className="text-xl text-slate-600">Get ready to begin...</p>
              </div>
            )}

            {/* Pose Definition Display */}
            {sessionState === 'pose_definition' && (
              <div className="text-center mb-12">
                {selectedCategory === 'mental' ? (
                  <>
                    <div className="text-6xl mb-6">{selectedActivity?.icon}</div>
                    <h3 className="text-2xl font-light text-slate-700 mb-4">{selectedActivity?.name} Pose</h3>
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-100 max-w-2xl mx-auto">
                      <p className="text-lg text-slate-600 leading-relaxed mb-4">
                        {selectedActivity?.id === 'meditation' && "Sit comfortably with your back straight, hands resting on your knees, and close your eyes gently. Take a few deep breaths and relax."}
                        {selectedActivity?.id === 'breathing' && "Find a comfortable seated or standing position. Relax your shoulders and close your eyes gently. Breathe naturally and follow the voice guidance for a calming breathing rhythm."}
                        {selectedActivity?.id === 'coming_soon_mental' && "This mindfulness practice is coming soon. Stay tuned for updates!"}
                      </p>
                      <div className="text-sm text-slate-500 space-y-2">
                        {selectedActivity?.id === 'breathing' ? (
                          <>
                            <p>✓ Find a comfortable position (sitting or standing)</p>
                            <p>✓ Relax your shoulders and neck</p>
                            <p>✓ Close your eyes gently or soften your gaze</p>
                            <p>✓ Breathe naturally through your nose</p>
                            <p className="font-medium text-sky-600 mt-3">Follow the voice guidance and visual breathing circle</p>
                          </>
                        ) : (
                          <>
                            <p>✓ Sit with hips lower than shoulders</p>
                            <p>✓ Keep your back straight and aligned</p>
                            <p>✓ Bend your knees in seated position</p>
                            <p>✓ Keep your head centered between shoulders</p>
                            <p className="font-medium text-violet-600 mt-3">Timer only runs when the pose accuracy is at least 80% </p>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-6">{selectedActivity?.icon}</div>
                    <h3 className="text-2xl font-light text-slate-700 mb-4">
                      {getExerciseInstructions(selectedActivity?.id).title}
                    </h3>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 max-w-3xl mx-auto">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-medium text-slate-700 mb-4">How to do it:</h4>
                          <ul className="text-sm text-slate-600 space-y-2">
                            {getExerciseInstructions(selectedActivity?.id).steps.map((step, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-emerald-500 mr-2">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-slate-700 mb-4">Tips:</h4>
                          <ul className="text-sm text-slate-600 space-y-2">
                            {getExerciseInstructions(selectedActivity?.id).tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-emerald-500 mr-2">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-emerald-100 rounded-xl">
                        <p className="text-sm text-emerald-700 font-medium">
                          Target: {activitySettings.targetReps} repetitions
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          The exercise will automatically complete when you reach your target reps
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center space-x-6">
              {sessionState === 'idle' && (
                <Button
                  onClick={() => setShowSettingsPopup(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-xl rounded-2xl shadow-wellness hover:shadow-wellness-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start {selectedActivity?.name}
                </Button>
              )}

              {sessionState === 'ready_to_start' && (
                <Button
                  onClick={startExerciseManually}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-xl rounded-2xl shadow-wellness hover:shadow-wellness-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Exercise
                </Button>
              )}
              
              {sessionState === 'active' && (
                <Button
                  onClick={() => stopSession(false)}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Square className="w-6 h-6 mr-3" />
                  Complete Session
                </Button>
              )}
              
              {sessionState === 'completed' && (
                <Button
                  onClick={() => {
                    // Navigate back to exercise selection page
                    setSelectedActivity(null)
                    setSessionState('idle')
                    setSessionData({
                      elapsedTime: 0,
                      remainingTime: 0,
                      actualPoseTime: 0,
                      accuracy: 0,
                      poseCorrect: false,
                      countdown: 0,
                      repCount: 0,
                      holdTime: 0,
                      qualityScore: 0
                    })
                    setError(null)
                    setSuccess(null)
                    setIsCompleting(false)
      isCompletingRef.current = false
                  }}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start New Session
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Activity Settings Popup */}
        <AnimatePresence>
          {showSettingsPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{selectedActivity?.icon}</div>
                  <h3 className="text-2xl font-light text-slate-700 mb-2">
                    {selectedActivity?.name} Settings
                  </h3>
                  <p className="text-slate-500">Customize your {selectedActivity?.name.toLowerCase()} experience</p>
                </div>

                <div className="space-y-6">
                  {selectedCategory === 'mental' ? (
                    // Mental wellness: Duration only, no difficulty levels
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-3">
                        Duration
                        </label>
                        <select
                          value={activitySettings.duration}
                        onChange={(e) => setActivitySettings(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                          className="w-full p-4 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-slate-700"
                        >
                        <option value={0.5}>30 seconds</option>
                          <option value={5}>5 minutes</option>
                          <option value={10}>10 minutes</option>
                          <option value={15}>15 minutes</option>
                          <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                        </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Choose how long you'd like to practice mindfulness
                      </p>
                      </div>
                  ) : (
                    // Physical wellness: Reps only, no difficulty levels
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-3">
                          Target Repetitions
                        </label>
                        <select
                          value={activitySettings.targetReps}
                          onChange={(e) => setActivitySettings(prev => ({ ...prev, targetReps: parseInt(e.target.value) }))}
                          className="w-full p-4 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-slate-700"
                        >
                        <option value={1}>1 rep</option>
                          <option value={5}>5 reps</option>
                          <option value={10}>10 reps</option>
                          <option value={15}>15 reps</option>
                          <option value={20}>20 reps</option>
                          <option value={25}>25 reps</option>
                          <option value={30}>30 reps</option>
                        <option value={40}>40 reps</option>
                        <option value={50}>50 reps</option>
                        </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Choose how many repetitions you'd like to complete
                      </p>
                      </div>
                  )}
                </div>

                <div className="flex space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSettingsPopup(false)
                      setSelectedActivity(null)
                    }}
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startActivityWithSettings}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    Start Session
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coming Soon Popup */}
        <ComingSoonPopup 
          isOpen={showComingSoonPopup} 
          onClose={() => setShowComingSoonPopup(false)} 
        />
      </main>
    </div>
  )
}

export default MindfulMovement
