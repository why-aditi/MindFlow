import { useState, useRef, useEffect, useContext, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import PoseDetectionService from './vr/services/poseDetectionService'
import { AuthContext } from '../contexts/AuthContext'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings, 
  Headphones,
  Camera,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Heart,
  Brain,
  Zap,
  Moon,
  Sun,
  Cloud,
  Mountain,
  Waves,
  Sparkles,
  Users,
  Trophy,
  Star,
  Clock,
  TrendingUp,
  Shield,
  Eye,
  Wind
} from 'lucide-react'

const VRMeditation = () => {
  const { user } = useContext(AuthContext)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const poseCanvasRef = useRef(null)
  const cameraStreamRef = useRef(null)
  
  // Core states
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    visualQuality: 'High',
    hapticFeedback: true,
    biometricMonitoring: true
  })
  const [sessionMode, setSessionMode] = useState('exercise') // Focus on exercise mode
  
  // Enhanced meditation states
  const [heartRate, setHeartRate] = useState(72)
  const [stressLevel, setStressLevel] = useState(45)
  const [focusScore, setFocusScore] = useState(85)
  const [sessionProgress] = useState(0)
  
  // Exercise plan states
  const [exercisePlans, setExercisePlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentExercise] = useState(0)
  const [showExercisePlans, setShowExercisePlans] = useState(false)
  
  // Computer vision monitoring states
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [poseAccuracy, setPoseAccuracy] = useState(0)
  const [breathingAccuracy, setBreathingAccuracy] = useState(0)
  const [monitoringFeedback, setMonitoringFeedback] = useState('')
  const [showMonitoring, setShowMonitoring] = useState(false)
  
  // Social and gamification states
  const [userStreak, setUserStreak] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const [lastApiCall, setLastApiCall] = useState({})

  const fetchUserStats = useCallback(async () => {
    try {
      if (!user) {
        console.warn('User not authenticated, using default stats')
        setUserStreak(0)
        setTotalSessions(0)
        return
      }

      // Rate limiting - only call API once per minute
      const now = Date.now()
      const lastCall = lastApiCall.userStats || 0
      if (now - lastCall < 60000) { // 60 seconds
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/user-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (!response.ok) {
        console.warn('Backend server not running, using default stats')
        setUserStreak(0)
        setTotalSessions(0)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, using default stats')
        setUserStreak(0)
        setTotalSessions(0)
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setUserStreak(data.stats.streak || 0)
        setTotalSessions(data.stats.totalSessions || 0)
        setLastApiCall(prev => ({ ...prev, userStats: now }))
      }
    } catch (error) {
      console.warn('Error fetching user stats, using defaults:', error.message)
      setUserStreak(0)
      setTotalSessions(0)
    }
  }, [user, lastApiCall])

  const fetchUserPreferences = useCallback(async () => {
    try {
      if (!user) {
        console.warn('User not authenticated, using default preferences')
        return
      }

      // Rate limiting - only call API once per 5 minutes
      const now = Date.now()
      const lastCall = lastApiCall.userPreferences || 0
      if (now - lastCall < 300000) { // 5 minutes
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/user-preferences', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (!response.ok) {
        console.warn('Backend server not running, using default preferences')
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, using default preferences')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setUserPreferences(data.preferences)
        setLastApiCall(prev => ({ ...prev, userPreferences: now }))
      }
    } catch (error) {
      console.warn('Error fetching user preferences, using defaults:', error.message)
    }
  }, [user, lastApiCall])

  const saveUserPreferences = async (preferences) => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot save preferences')
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(preferences)
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, preferences not saved')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setUserPreferences(preferences)
      }
    } catch (error) {
      console.warn('Error saving user preferences:', error.message)
    }
  }

  const fetchExercisePlans = useCallback(async () => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot fetch exercise plans')
        setExercisePlans([])
        return
      }

      // Rate limiting - only call API once per 10 minutes
      const now = Date.now()
      const lastCall = lastApiCall.exercisePlans || 0
      if (now - lastCall < 600000) { // 10 minutes
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/exercise-plans', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (!response.ok) {
        console.warn('Backend server not running')
        setExercisePlans([])
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setExercisePlans([])
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setExercisePlans(data.exercisePlans)
        setLastApiCall(prev => ({ ...prev, exercisePlans: now }))
      } else {
        console.error('Failed to fetch exercise plans:', data.error)
        setExercisePlans([])
      }
    } catch (error) {
      console.error('Error fetching exercise plans:', error.message)
      setExercisePlans([])
    }
  }, [user, lastApiCall])

  const simulateBiometricData = useCallback(() => {
    if (!isPlaying) return
    
    // Simulate realistic biometric changes during meditation
    const baseHeartRate = 72
    const variation = Math.sin(Date.now() / 10000) * 5
    setHeartRate(Math.round(baseHeartRate + variation))
    
    // Stress level decreases over time
    const stressReduction = Math.min(sessionDuration / 60, 20)
    setStressLevel(Math.max(20, 45 - stressReduction))
    
    // Focus score increases with good breathing
    const focusBoost = breathingAccuracy > 80 ? 5 : 0
    setFocusScore(Math.min(100, 85 + focusBoost))
  }, [isPlaying, sessionDuration, breathingAccuracy])

  const fetchBiometricData = useCallback(async () => {
    try {
      if (!user || !isPlaying) return

      // If backend is not available, just use simulation
      if (!backendAvailable) {
        simulateBiometricData()
        return
      }

      // Rate limiting - only call API once per 5 seconds
      const now = Date.now()
      const lastCall = lastApiCall.biometricData || 0
      if (now - lastCall < 5000) { // 5 seconds
        simulateBiometricData()
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/biometric-data', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (!response.ok) {
        // If response is not ok (404, 500, etc.), mark backend as unavailable
        setBackendAvailable(false)
        simulateBiometricData()
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Fallback to simulation if API not available
        setBackendAvailable(false)
        simulateBiometricData()
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setHeartRate(data.biometricData.heartRate || 72)
        setStressLevel(data.biometricData.stressLevel || 45)
        setFocusScore(data.biometricData.focusScore || 85)
        // Mark backend as available if we got successful data
        setBackendAvailable(true)
        setLastApiCall(prev => ({ ...prev, biometricData: now }))
      } else {
        simulateBiometricData()
      }
    } catch {
      // Mark backend as unavailable on network errors
      setBackendAvailable(false)
      simulateBiometricData()
    }
  }, [isPlaying, user, simulateBiometricData, backendAvailable, lastApiCall])

  const startBiometricSimulation = useCallback(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        fetchBiometricData()
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, fetchBiometricData])

  // Initialize camera for pose detection
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      
      // Store stream reference for cleanup
      cameraStreamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      console.log('Camera initialized successfully')
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }, [])

  // Cleanup camera stream
  const cleanupCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      const tracks = cameraStreamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      cameraStreamRef.current = null
      console.log('Camera stream stopped')
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Initialize component once
  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported)
      })
    }

    fetchUserStats()
    fetchUserPreferences()
    fetchExercisePlans()

    // Cleanup on unmount only
    return () => {
      cleanupCamera()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle biometric simulation separately
  useEffect(() => {
    const cleanup = startBiometricSimulation()
    return cleanup
  }, [isPlaying, startBiometricSimulation])



  const startExerciseSession = async (planId) => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot start session')
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/exercise-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ exercisePlanId: planId })
      })
      
      // Check if response is HTML (server not running)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, starting mock exercise session')
        setIsMonitoring(true)
        setShowMonitoring(true)
        setSelectedPlan(exercisePlans.find(plan => plan._id === planId))
        setIsPlaying(true)
        setSessionMode('exercise')
        await initializeCamera() // Initialize camera for mock mode
        startMonitoringSimulation()
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setIsMonitoring(true)
        setShowMonitoring(true)
        setSelectedPlan(exercisePlans.find(plan => plan._id === planId))
        setIsPlaying(true)
        setSessionMode('exercise')
        
        await initializeCamera() // Initialize camera for real mode
        await initializePoseDetection()
      }
    } catch (error) {
      console.warn('Error starting exercise session, using mock mode:', error.message)
      // Fallback to mock mode
      setIsMonitoring(true)
      setShowMonitoring(true)
      setSelectedPlan(exercisePlans.find(plan => plan._id === planId))
      setIsPlaying(true)
      setSessionMode('exercise')
      await initializeCamera() // Initialize camera for fallback mode
      startMonitoringSimulation()
    }
  }

  const initializePoseDetection = async () => {
    try {
      const service = new PoseDetectionService()
      
      const result = await service.initialize(
        videoRef.current,
        poseCanvasRef.current,
        {
          onPoseDetected: (data) => {
            const accuracy = analyzePoseAccuracy(data.keyPoints, selectedPlan)
            setPoseAccuracy(accuracy)
            setMonitoringFeedback(accuracy > 85 ? 'Excellent form! 🌟' : 'Adjust your posture slightly')
          },
          onBreathingDetected: (data) => {
            const accuracy = analyzeBreathingAccuracy(data.breathingData, selectedPlan)
            setBreathingAccuracy(accuracy)
            updateBreathingPhase(data.breathingData)
          }
        }
      )
      
      if (result.success) {
        // Pose detection service initialized successfully
      }
    } catch (error) {
      console.error('Error initializing pose detection:', error)
      startMonitoringSimulation()
    }
  }

  const updateBreathingPhase = () => {
    // Breathing phase tracking removed for exercise focus
  }

  const analyzePoseAccuracy = (keyPoints, exercisePlan) => {
    if (!exercisePlan || !exercisePlan.exercises[currentExercise]) {
      return Math.floor(Math.random() * 25) + 70
    }

    const expectedPose = exercisePlan.exercises[currentExercise].poseData
    if (!expectedPose || !expectedPose.keyPoints) {
      return Math.floor(Math.random() * 25) + 70
    }

    let totalAccuracy = 0
    let validPoints = 0

    expectedPose.keyPoints.forEach(expectedPoint => {
      const detectedPoint = keyPoints.find(p => p.name === expectedPoint.name)
      if (detectedPoint && detectedPoint.confidence > 0.5) {
        const distance = Math.sqrt(
          Math.pow(detectedPoint.x - expectedPoint.x, 2) + 
          Math.pow(detectedPoint.y - expectedPoint.y, 2)
        )
        const pointAccuracy = Math.max(0, 100 - (distance * 100))
        totalAccuracy += pointAccuracy
        validPoints++
      }
    })

    return validPoints > 0 ? Math.round(totalAccuracy / validPoints) : 70
  }

  const analyzeBreathingAccuracy = (breathingData, exercisePlan) => {
    if (!exercisePlan || !exercisePlan.exercises[currentExercise]) {
      return Math.floor(Math.random() * 30) + 60
    }

    const expectedPattern = exercisePlan.exercises[currentExercise].breathingPattern
    if (!expectedPattern) {
      return Math.floor(Math.random() * 30) + 60
    }

    const { inhale_duration, exhale_duration, hold_duration } = breathingData
    const { inhaleDuration, exhaleDuration, holdDuration } = expectedPattern

    let accuracy = 0
    const tolerance = 0.2

    if (Math.abs(inhale_duration - inhaleDuration) / inhaleDuration <= tolerance) {
      accuracy += 33
    }
    if (Math.abs(exhale_duration - exhaleDuration) / exhaleDuration <= tolerance) {
      accuracy += 33
    }
    if (Math.abs(hold_duration - holdDuration) / holdDuration <= tolerance) {
      accuracy += 34
    }

    return Math.round(accuracy)
  }

  const generateDynamicFeedback = (poseAcc, breathingAcc) => {
    const feedbacks = {
      excellent: [
        'Perfect posture! ✨',
        'Excellent form! 🎯',
        'Outstanding technique! 🌟'
      ],
      good: [
        'Great breathing rhythm 🌊',
        'Stay focused and calm 🧘',
        'Beautiful meditation pose 🌸'
      ],
      average: [
        'Keep that steady rhythm 💫',
        'You\'re doing well! 💪',
        'Stay consistent! 🌱'
      ],
      needsImprovement: [
        'Adjust your posture slightly',
        'Focus on your breathing',
        'Relax and find your center'
      ]
    }

    if (poseAcc >= 90 && breathingAcc >= 85) {
      return feedbacks.excellent[Math.floor(Math.random() * feedbacks.excellent.length)]
    } else if (poseAcc >= 80 && breathingAcc >= 75) {
      return feedbacks.good[Math.floor(Math.random() * feedbacks.good.length)]
    } else if (poseAcc >= 70 && breathingAcc >= 65) {
      return feedbacks.average[Math.floor(Math.random() * feedbacks.average.length)]
    } else {
      return feedbacks.needsImprovement[Math.floor(Math.random() * feedbacks.needsImprovement.length)]
    }
  }

  const startMonitoringSimulation = () => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        const poseAcc = Math.floor(Math.random() * 25) + 70
        setPoseAccuracy(poseAcc)
        
        const breathingAcc = Math.floor(Math.random() * 30) + 60
        setBreathingAccuracy(breathingAcc)
        
        const dynamicFeedback = generateDynamicFeedback(poseAcc, breathingAcc)
        setMonitoringFeedback(dynamicFeedback)
      } else {
        clearInterval(interval)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }

  const startSession = async (session) => {
    setIsPlaying(true)
    setSessionDuration(session.duration)
    setSessionMode('exercise') // Changed to exercise mode
    
    // Initialize camera when starting exercise
    await initializeCamera()
    
    // Start session timer
    const timer = setInterval(() => {
      setSessionDuration(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          completeSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const completeSession = () => {
    setIsPlaying(false)
    setUserStreak(prev => prev + 1)
    setTotalSessions(prev => prev + 1)
    cleanupCamera() // Stop camera when session completes
  }

  const stopSession = () => {
    setIsPlaying(false)
    setSessionDuration(0)
    cleanupCamera() // Stop camera when stopping exercise
  }

  const resetSession = () => {
    setSessionDuration(0)
    setIsPlaying(false)
    cleanupCamera() // Stop camera when resetting session
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="mr-4 text-white hover:bg-white/20"
              >
                ← Back
              </Button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">VR Meditation</h1>
                  <p className="text-sm text-white/70">Immersive relaxation experiences</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Stats */}
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">{userStreak} day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{totalSessions} sessions</span>
                </div>
              </div>
              
              {isVRSupported && (
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">VR Ready</span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* VR Scene - Enhanced */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="aspect-video relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)'
                  }}
                />
                
                {/* Hidden video element for pose detection */}
                <video
                  ref={videoRef}
                  className="hidden"
                  autoPlay
                  muted
                  playsInline
                />
                
                {/* Pose detection canvas overlay */}
                <canvas
                  ref={poseCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                />
                
                {/* Exercise Tracking Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                  >
                    <motion.div 
                      className="text-8xl mb-6"
                      animate={{ 
                        scale: isPlaying ? [1, 1.1, 1] : 1,
                        rotate: isPlaying ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ duration: 4, repeat: isPlaying ? Infinity : 0 }}
                    >
                      💪
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      Exercise Tracking
                    </h2>
                    <p className="text-white/80 text-lg max-w-md mx-auto">
                      AI-powered pose detection for perfect form and technique
                    </p>
                  </motion.div>
                </div>

                {/* Exercise Tracking Visualization */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 left-8 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className="text-center text-white">
                      <div className="flex items-center justify-center mb-4">
                        <motion.div
                          className="w-20 h-20 border-4 border-green-400/30 rounded-full flex items-center justify-center"
                          animate={{
                            scale: [1, 1.2, 1],
                            borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.3)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Target className="w-8 h-8 text-green-400" />
                        </motion.div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Exercise Tracking</h3>
                      <p className="text-white/80 text-sm mb-2">AI monitoring your form</p>
                      <div className="text-xs text-white/60">
                        Pose Accuracy: {poseAccuracy}%
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Session Timer - Enhanced */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20"
                  >
                    <div className="text-center text-white">
                      <div className="text-3xl font-mono font-bold mb-2">
                        {formatTime(sessionDuration)}
                      </div>
                      <div className="text-sm text-white/70">
                        {sessionMode === 'guided' ? 'Guided Session' : 
                         sessionMode === 'exercise' ? 'Exercise Mode' : 'Free Session'}
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(sessionProgress / 100) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Biometric Monitoring */}
                {showMonitoring && isMonitoring && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-8 right-8 bg-black/30 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/20"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <Camera className="w-5 h-5 text-green-400" />
                      <span className="text-white text-sm font-medium">AI Monitoring</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Target className="w-4 h-4 text-blue-400 mr-1" />
                          <span className="text-white text-xs">Pose</span>
                        </div>
                        <div className="text-white text-lg font-bold">{poseAccuracy}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Activity className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-white text-xs">Breathing</span>
                        </div>
                        <div className="text-white text-lg font-bold">{breathingAccuracy}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Heart className="w-4 h-4 text-red-400 mr-1" />
                          <span className="text-white text-xs">Heart Rate</span>
                        </div>
                        <div className="text-white text-lg font-bold">{heartRate} BPM</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Brain className="w-4 h-4 text-purple-400 mr-1" />
                          <span className="text-white text-xs">Focus</span>
                        </div>
                        <div className="text-white text-lg font-bold">{focusScore}%</div>
                      </div>
                    </div>
                    
                    {monitoringFeedback && (
                      <div className="mt-4 p-3 bg-white/10 rounded-lg text-xs text-white text-center">
                        {monitoringFeedback}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Enhanced VR Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* Exercise controls */}}
                      className="text-white hover:bg-white/20 w-12 h-12"
                    >
                      <Target className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      onClick={isPlaying ? stopSession : startSession}
                      className={`w-16 h-16 rounded-full ${
                        isPlaying 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      } text-white shadow-lg`}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetSession}
                      className="text-white hover:bg-white/20 w-12 h-12"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls Panel */}
          <div className="space-y-6">
            {/* Exercise Tracking - Camera Setup */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-green-400" />
                Exercise Tracking
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Pose Detection Ready</h4>
                  <p className="text-white/70 text-sm mb-4">
                    Your camera is active and ready to track your exercise poses
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Camera Active</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-white font-medium text-sm">Pose Accuracy</div>
                    <div className="text-green-400 font-bold text-lg">{poseAccuracy}%</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-white font-medium text-sm">Breathing</div>
                    <div className="text-blue-400 font-bold text-lg">{breathingAccuracy}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Plans - Enhanced */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-orange-400" />
                  Exercise Plans
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExercisePlans(!showExercisePlans)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {showExercisePlans ? 'Hide' : 'Show'} Plans
                </Button>
              </div>
              
              <AnimatePresence>
                {showExercisePlans && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {exercisePlans.map((plan) => (
                      <div
                        key={plan._id}
                        className="p-4 border border-white/20 rounded-xl hover:border-white/40 transition-all bg-white/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white">{plan.name}</h4>
                            <p className="text-sm text-white/70">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-300">
                              {plan.duration} min
                            </div>
                            <div className="text-xs text-white/60 capitalize">
                              {plan.difficulty}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/80">
                              {plan.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">
                              {plan.exercises.length} exercises
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => startExerciseSession(plan._id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Session Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Sessions</span>
                  <span className="font-semibold text-white">{totalSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Current Streak</span>
                  <span className="font-semibold text-green-400">{userStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Favorite Environment</span>
                  <span className="font-semibold text-white">Ocean</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Focus Score</span>
                  <span className="font-semibold text-purple-400">{focusScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Stress Level</span>
                  <span className="font-semibold text-red-400">{stressLevel}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-purple-400" />
                  VR Settings
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Audio Volume
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userPreferences.audioVolume}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, audioVolume: parseInt(e.target.value) }))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Visual Quality
                    </label>
                    <select 
                      value={userPreferences.visualQuality}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, visualQuality: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option className="bg-slate-800">High</option>
                      <option className="bg-slate-800">Medium</option>
                      <option className="bg-slate-800">Low</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="haptic" 
                      checked={userPreferences.hapticFeedback}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, hapticFeedback: e.target.checked }))}
                      className="accent-purple-500" 
                    />
                    <label htmlFor="haptic" className="text-sm text-white/80">
                      Enable Haptic Feedback
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="biometric" 
                      checked={userPreferences.biometricMonitoring}
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, biometricMonitoring: e.target.checked }))}
                      className="accent-purple-500" 
                    />
                    <label htmlFor="biometric" className="text-sm text-white/80">
                      Enable Biometric Monitoring
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSettings(false)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      saveUserPreferences(userPreferences)
                      setShowSettings(false)
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Save Settings
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default VRMeditation