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
  Wind
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VR Exercise</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${vrAvailable ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${vrAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {vrAvailable ? 'VR Ready' : 'VR Not Available'}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800">{success}</p>
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
              className="mb-8 bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value) || 300)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="60"
                    max="3600"
                    disabled={isTracking}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={checkVrDependencies}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Check VR Status
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Selection */}
        {!isTracking && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Exercise</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <motion.div
                  key={exercise._id || exercise.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all ${
                    selectedExercise && (typeof selectedExercise === 'object' ? selectedExercise._id : selectedExercise) === (exercise._id || exercise.name)
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-4xl">{getExerciseIcon(exercise)}</div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {exercise.displayName || exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {exercise.type === 'hold' || exercise.type === 'meditation' || exercise.type === 'breathing'
                        ? 'Hold-based exercise'
                        : 'Rep-based exercise'
                      }
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Control Panel */}
        {selectedExercise && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{getExerciseIcon(selectedExercise)}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                {typeof selectedExercise === 'string' 
                  ? selectedExercise.replace('_', ' ') 
                  : (selectedExercise.displayName || selectedExercise.name)
                }
              </h2>
              <p className="text-gray-600">
                {isTracking ? 'Exercise in progress...' : 'Ready to start'}
              </p>
            </div>

            {/* Session Stats */}
            {isTracking && (
              <div className="grid md:grid-cols-6 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatTime(sessionData.elapsedTime)}
                  </div>
                  <div className="text-sm text-gray-600">Elapsed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatTime(sessionData.remainingTime)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {sessionData.repCount}
                  </div>
                  <div className="text-sm text-gray-600">Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {sessionData.holdTime}s
                  </div>
                  <div className="text-sm text-gray-600">Hold Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {sessionData.accuracy || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-2">
                    {sessionData.qualityScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">Quality</div>
                </div>
              </div>
            )}

            {/* Camera Feed */}
            {isTracking && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Live Camera Feed</h3>
                <div className="text-center mb-2 text-sm text-gray-600">
                  Stream Status: {cameraStream ? 'Active' : 'Inactive'} | 
                  Video Ref: {videoRef.current ? 'Connected' : 'Not Connected'} |
                  Pose Tracking: {poseTrackingActive ? 'Active' : 'Inactive'}
                </div>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto max-w-md">
                  {cameraStream ? (
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Camera loading...</p>
                      </div>
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
                      <div className="text-center text-red-600">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{cameraError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isTracking ? (
                <Button
                  onClick={startExercise}
                  disabled={!vrAvailable || isLoading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Start Exercise
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={stopExercise}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Stopping...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Exercise
                    </div>
                  )}
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Make sure you have good lighting and the camera can see you clearly</p>
                <p>• Position yourself 3-6 feet away from the camera</p>
                <p>• Follow the on-screen guidance for proper form</p>
                <p>• Press 'q' in the camera window to quit early if needed</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default VRExercise
