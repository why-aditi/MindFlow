import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import poseTrackingService from '../services/mediapipePoseService'
import { 
  Play, 
  Pause, 
  Square, 
  Camera, 
  Activity, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Trophy,
  Settings,
  ArrowLeft,
  Zap,
  Heart,
  Brain,
  Moon,
  Sun,
  Wind,
  Sparkles,
  Leaf,
  Waves,
  Cloud
} from 'lucide-react'

const VRExercise = () => {
  const { user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [sessionData, setSessionData] = useState({
    repCount: 0,
    holdTime: 0,
    accuracy: 0,
    elapsedTime: 0,
    remainingTime: 0
  })
  const [sessionId, setSessionId] = useState(null)
  const [vrAvailable, setVrAvailable] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customDuration, setCustomDuration] = useState(300) // 5 minutes default
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [poseTrackingActive, setPoseTrackingActive] = useState(false)

  const intervalRef = useRef(null)
  const videoRef = useRef(null)
  
  // Callback ref to connect stream immediately when video element is created
  const setVideoRef = (element) => {
    if (videoRef.current === element) return // Prevent re-connection
    
    videoRef.current = element
    if (element && cameraStream && !element.srcObject) {
      console.log('Video element created, connecting stream immediately')
      element.srcObject = cameraStream
    }
  }

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


  // Fetch available exercises
  const fetchExercises = useCallback(async () => {
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/exercises', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setExercises(data.exercises || [])
        }
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }, [user])

  // Check VR dependencies (now using browser camera API)
  const checkVrDependencies = useCallback(async () => {
    try {
      // Check if browser supports camera API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Initialize pose tracking
        const poseInitialized = await poseTrackingService.initialize()
        if (poseInitialized) {
          setVrAvailable(true)
        } else {
          setVrAvailable(false)
          setError('Pose tracking initialization failed')
        }
      } else {
        setVrAvailable(false)
        setError('Camera API not supported in this browser')
      }
    } catch (error) {
      console.error('Error checking VR dependencies:', error)
      setVrAvailable(false)
    }
  }, [])

  // Start exercise tracking
  const startExercise = async () => {
    if (!selectedExercise) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Start camera first
      const cameraStarted = await startCamera()
      if (!cameraStarted) {
        setError('Camera access required for exercise tracking')
        setIsLoading(false)
        return
      }
      
      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/vr/vr-exercise-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          exerciseType: typeof selectedExercise === 'string' ? selectedExercise : selectedExercise.name,
          duration: customDuration
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSessionId(data.sessionId)
          setIsTracking(true)
          setSessionData(prev => ({ ...prev, elapsedTime: 0, remainingTime: customDuration }))
          setSuccess('Exercise tracking started! Camera is now active.')
          
          // Start pose tracking after a short delay to ensure video element is ready
          setTimeout(() => {
            const exerciseType = typeof selectedExercise === 'string' ? selectedExercise : selectedExercise.name
            if (videoRef.current) {
              const poseStarted = poseTrackingService.startTracking(
                videoRef.current,
                exerciseType,
                (results) => {
                  // Update session data with pose tracking results
                  setSessionData(prev => ({
                    ...prev,
                    repCount: results.repCount,
                    holdTime: results.holdTime,
                    accuracy: results.accuracy,
                    qualityScore: results.qualityScore
                  }))
                },
                (error) => {
                  console.error('Pose tracking error:', error)
                }
              )
              
              if (poseStarted) {
                setPoseTrackingActive(true)
              }
            } else {
              console.error('Video element not available for pose tracking')
            }
          }, 1000) // Wait 1 second for video element to be ready
          
          // Start timer
          startTimer()
        } else {
          setError(data.error || 'Failed to start exercise tracking')
          stopCamera()
        }
      } else {
        setError('Failed to start exercise tracking')
        stopCamera()
      }
    } catch (error) {
      console.error('Error starting exercise:', error)
      setError('Failed to start exercise tracking')
      stopCamera()
    } finally {
      setIsLoading(false)
    }
  }

  // Stop exercise tracking
  const stopExercise = async () => {
    if (!sessionId) return

    try {
      setIsLoading(true)
      
      const idToken = await user.getIdToken()
      const response = await fetch(`http://localhost:5000/api/vr/vr-exercise-tracking/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsTracking(false)
          setSessionId(null)
          setSuccess('Exercise completed successfully!')
          
          // Stop timer
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          
          // Stop camera and pose tracking
          stopCamera()
          poseTrackingService.stopTracking()
          setPoseTrackingActive(false)
        }
      }
    } catch (error) {
      console.error('Error stopping exercise:', error)
      setError('Failed to stop exercise tracking')
    } finally {
      setIsLoading(false)
      // Always stop camera and pose tracking when stopping exercise
      stopCamera()
      poseTrackingService.stopTracking()
      setPoseTrackingActive(false)
    }
  }

  // Start timer
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setSessionData(prev => {
        const newElapsed = prev.elapsedTime + 1
        const newRemaining = Math.max(0, customDuration - newElapsed)
        
        if (newRemaining === 0) {
          // Auto-stop when time is up
          stopExercise()
        }
        
        return {
          ...prev,
          elapsedTime: newElapsed,
          remainingTime: newRemaining
        }
      })
    }, 1000)
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get exercise icon
  const getExerciseIcon = (exercise) => {
    // Handle both string and object inputs for backward compatibility
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name
    
    const icons = {
      bicep_curl: '💪',
      squat: '🦵',
      pushup: '🏋️',
      lunge: '🚶',
      tree_pose: '🌳',
      warrior_ii: '⚔️',
      plank: '📏',
      chair_pose: '🪑',
      cobra_pose: '🐍',
      meditation: '🧘',
      breathing: '🫁',
      stretching: '🤸'
    }
    return icons[exerciseName] || '🏃'
  }


  useEffect(() => {
    if (user) {
      fetchExercises()
      checkVrDependencies()
    }
  }, [user, fetchExercises, checkVrDependencies])

  useEffect(() => {
    setIsLoading(false)
  }, [exercises])

  // Connect camera stream to video element when stream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log('Connecting stream to video element in useEffect')
      videoRef.current.srcObject = cameraStream
    } else if (cameraStream && !videoRef.current) {
      console.log('Stream available but video ref not ready yet')
    }
  }, [cameraStream])


  // Cleanup timer, camera, and pose tracking on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      stopCamera()
      poseTrackingService.stopTracking()
    }
  }, [stopCamera])

  if (isLoading && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Floating nature elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 text-sky-200"
          >
            <Cloud className="w-16 h-16" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-32 right-32 text-emerald-200"
          >
            <Leaf className="w-12 h-12" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-32 left-32 text-violet-200"
          >
            <Sparkles className="w-14 h-14" />
          </motion.div>
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-sky-300 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-light text-slate-600 mb-2">Preparing Your Wellness Journey</h2>
          <p className="text-slate-500">Loading exercises...</p>
        </div>
      </div>
    )
  }

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
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            x: [0, -20, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-60 right-1/3 text-teal-200/20"
        >
          <Sparkles className="w-12 h-12" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-wellness border-b border-emerald-100/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
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
                  <p className="text-sm text-slate-500">Wellness & Exercise</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${vrAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <div className={`w-3 h-3 rounded-full ${vrAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <span className="text-sm font-medium">
                  {vrAvailable ? 'Ready for Wellness' : 'Setup Required'}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-emerald-50 border-emerald-200 text-slate-600 hover:text-emerald-600"
              >
                <Settings className="w-4 h-4" />
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

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-wellness-lg p-8 border border-emerald-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-light text-slate-700">Wellness Settings</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    Session Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value) || 300)}
                    className="w-full p-4 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 text-slate-700 placeholder-slate-400"
                    min="60"
                    max="3600"
                    disabled={isTracking}
                    placeholder="300"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={checkVrDependencies}
                    variant="outline"
                    disabled={isLoading}
                    className="bg-white/50 border-emerald-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 px-6 py-3 rounded-2xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check Wellness Status
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Selection */}
        {!isTracking && (
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-slate-700 mb-4">Choose Your Wellness Practice</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Select a mindful movement or meditation practice to begin your wellness journey
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exercises.map((exercise) => (
                <motion.div
                  key={exercise._id || exercise.name}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-wellness cursor-pointer transition-all duration-300 border ${
                    selectedExercise && (typeof selectedExercise === 'object' ? selectedExercise._id : selectedExercise) === (exercise._id || exercise.name)
                      ? 'ring-2 ring-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-wellness-lg' 
                      : 'hover:shadow-wellness-lg border-emerald-100 hover:border-emerald-200'
                  }`}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div className="text-center space-y-6">
                    <div className="text-6xl mb-2">{getExerciseIcon(exercise)}</div>
                    <h3 className="text-xl font-light text-slate-700 capitalize">
                      {exercise.displayName || exercise.name}
                    </h3>
                    <div className="flex items-center justify-center">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        exercise.type === 'hold' || exercise.type === 'meditation' || exercise.type === 'breathing'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {exercise.type === 'hold' || exercise.type === 'meditation' || exercise.type === 'breathing'
                          ? 'Mindful Practice'
                          : 'Active Movement'
                        }
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Control Panel */}
        {selectedExercise && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-wellness-lg p-12 border border-emerald-100">
            <div className="text-center mb-12">
              <div className="text-8xl mb-6">{getExerciseIcon(selectedExercise)}</div>
              <h2 className="text-4xl font-light text-slate-700 mb-4 capitalize">
                {typeof selectedExercise === 'string' 
                  ? selectedExercise.replace('_', ' ') 
                  : (selectedExercise.displayName || selectedExercise.name)
                }
              </h2>
              <div className="flex items-center justify-center">
                <div className={`px-6 py-3 rounded-full text-lg font-medium ${
                  isTracking 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-sky-100 text-sky-700'
                }`}>
                  {isTracking ? 'Wellness in Progress...' : 'Ready to Begin'}
                </div>
              </div>
            </div>

            {/* Session Stats */}
            {isTracking && (
              <div className="grid md:grid-cols-6 gap-6 mb-12">
                <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="text-3xl font-light text-emerald-600 mb-2">
                    {formatTime(sessionData.elapsedTime)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Elapsed</div>
                </div>
                <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                  <div className="text-3xl font-light text-teal-600 mb-2">
                    {formatTime(sessionData.remainingTime)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Remaining</div>
                </div>
                <div className="text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                  <div className="text-3xl font-light text-sky-600 mb-2">
                    {sessionData.repCount}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Reps</div>
                </div>
                <div className="text-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                  <div className="text-3xl font-light text-violet-600 mb-2">
                    {sessionData.holdTime}s
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Hold Time</div>
                </div>
                <div className="text-center bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                  <div className="text-3xl font-light text-rose-600 mb-2">
                    {sessionData.accuracy || 0}%
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Accuracy</div>
                </div>
                <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <div className="text-3xl font-light text-amber-600 mb-2">
                    {sessionData.qualityScore || 0}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Quality</div>
                </div>
              </div>
            )}

            {/* Camera Feed */}
            {isTracking && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-slate-700 mb-4">Live Wellness Tracking</h3>
                  <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${cameraStream ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span>Camera: {cameraStream ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${poseTrackingActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <span>Tracking: {poseTrackingActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl overflow-hidden mx-auto max-w-lg border border-emerald-200 shadow-wellness">
                  {cameraStream ? (
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-80 object-cover"
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
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
              </div>
            )}


            {/* Control Buttons */}
            <div className="flex justify-center space-x-6">
              {!isTracking ? (
                <Button
                  onClick={startExercise}
                  disabled={!vrAvailable || isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-xl rounded-2xl shadow-wellness hover:shadow-wellness-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      ></motion.div>
                      Preparing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="w-6 h-6 mr-3" />
                      Begin Wellness Journey
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={stopExercise}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      ></motion.div>
                      Completing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Square className="w-6 h-6 mr-3" />
                      Complete Session
                    </div>
                  )}
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-12 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-light text-slate-700">Wellness Guidelines</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-600">Ensure good lighting for optimal tracking</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-600">Position yourself 3-6 feet from camera</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-600">Follow mindful movement guidance</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-600">Listen to your body and rest when needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default VRExercise
