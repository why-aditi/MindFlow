import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import PoseDetectionService from '../services/poseDetectionService'
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
  AlertCircle
} from 'lucide-react'

const VRMeditation = () => {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const poseCanvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState('ocean')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Exercise plan states
  const [exercisePlans, setExercisePlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [exerciseSession, setExerciseSession] = useState(null)
  const [showExercisePlans, setShowExercisePlans] = useState(false)
  
  // Computer vision monitoring states
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [poseAccuracy, setPoseAccuracy] = useState(0)
  const [breathingAccuracy, setBreathingAccuracy] = useState(0)
  const [monitoringFeedback, setMonitoringFeedback] = useState('')
  const [showMonitoring, setShowMonitoring] = useState(false)
  const [poseDetectionService, setPoseDetectionService] = useState(null)

  const environments = [
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Calming ocean sounds with gentle waves',
      icon: '🌊',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'forest',
      name: 'Forest Sounds',
      description: 'Peaceful forest with birds and wind',
      icon: '🌲',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'rain',
      name: 'Rain Drops',
      description: 'Gentle rain and thunder sounds',
      icon: '🌧️',
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'space',
      name: 'Cosmic Silence',
      description: 'Ambient space sounds and silence',
      icon: '🌌',
      color: 'from-purple-400 to-purple-600'
    }
  ]

  const guidedSessions = [
    {
      id: 1,
      title: '5-Minute Breathing',
      duration: 300,
      description: 'Quick breathing exercise for stress relief'
    },
    {
      id: 2,
      title: 'Body Scan Meditation',
      duration: 900,
      description: 'Progressive relaxation technique'
    },
    {
      id: 3,
      title: 'Mindfulness Walk',
      duration: 1200,
      description: 'Guided walking meditation'
    },
    {
      id: 4,
      title: 'Sleep Preparation',
      duration: 1800,
      description: 'Calming session before bedtime'
    }
  ]

  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported)
      })
    }

    // Initialize Three.js scene (simplified for demo)
    if (canvasRef.current) {
      // TODO: Implement Three.js scene with WebXR
      console.log('Three.js scene would be initialized here')
    }

    // Fetch exercise plans
    fetchExercisePlans()
  }, [])

  const fetchExercisePlans = async () => {
    try {
      const response = await fetch('/api/vr/exercise-plans')
      const data = await response.json()
      if (data.success) {
        setExercisePlans(data.exercisePlans)
      }
    } catch (error) {
      console.error('Error fetching exercise plans:', error)
    }
  }

  const startExerciseSession = async (planId) => {
    try {
      const response = await fetch('/api/vr/exercise-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ exercisePlanId: planId })
      })
      
      const data = await response.json()
      if (data.success) {
        setExerciseSession(data.sessionId)
        setIsMonitoring(true)
        setShowMonitoring(true)
        setSelectedPlan(exercisePlans.find(plan => plan._id === planId))
        setIsPlaying(true)
        
        // Initialize JavaScript pose detection
        await initializePoseDetection()
      }
    } catch (error) {
      console.error('Error starting exercise session:', error)
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
            // Analyze pose accuracy against expected pose
            const accuracy = analyzePoseAccuracy(data.keyPoints, selectedPlan)
            setPoseAccuracy(accuracy)
            setMonitoringFeedback(accuracy > 85 ? 'Great form!' : 'Try to adjust your posture')
          },
          onBreathingDetected: (data) => {
            // Analyze breathing accuracy
            const accuracy = analyzeBreathingAccuracy(data.breathingData, selectedPlan)
            setBreathingAccuracy(accuracy)
          }
        }
      )
      
      if (result.success) {
        setPoseDetectionService(service)
      }
    } catch (error) {
      console.error('Error initializing pose detection:', error)
      // Fallback to simulation
      startMonitoringSimulation()
    }
  }

  const analyzePoseAccuracy = (keyPoints, exercisePlan) => {
    if (!exercisePlan || !exercisePlan.exercises[currentExercise]) {
      return Math.floor(Math.random() * 25) + 70 // Fallback simulation
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
      return Math.floor(Math.random() * 30) + 60 // Fallback simulation
    }

    const expectedPattern = exercisePlan.exercises[currentExercise].breathingPattern
    if (!expectedPattern) {
      return Math.floor(Math.random() * 30) + 60
    }

    const { inhale_duration, exhale_duration, hold_duration } = breathingData
    const { inhaleDuration, exhaleDuration, holdDuration } = expectedPattern

    let accuracy = 0
    const tolerance = 0.2 // 20% tolerance

    // Check inhale duration
    if (Math.abs(inhale_duration - inhaleDuration) / inhaleDuration <= tolerance) {
      accuracy += 33
    }

    // Check exhale duration
    if (Math.abs(exhale_duration - exhaleDuration) / exhaleDuration <= tolerance) {
      accuracy += 33
    }

    // Check hold duration
    if (Math.abs(hold_duration - holdDuration) / holdDuration <= tolerance) {
      accuracy += 34
    }

    return Math.round(accuracy)
  }

  const startMonitoringSimulation = () => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        // Simulate pose accuracy (70-95%)
        const poseAcc = Math.floor(Math.random() * 25) + 70
        setPoseAccuracy(poseAcc)
        
        // Simulate breathing accuracy (60-90%)
        const breathingAcc = Math.floor(Math.random() * 30) + 60
        setBreathingAccuracy(breathingAcc)
        
        // Simulate feedback messages
        const feedbacks = [
          'Great form! Keep it up!',
          'Try to straighten your back a bit more',
          'Perfect breathing rhythm',
          'Adjust your shoulder position',
          'Excellent posture!',
          'Focus on your breathing',
          'Almost perfect form!'
        ]
        const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)]
        setMonitoringFeedback(randomFeedback)
      } else {
        clearInterval(interval)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }

  const updateExerciseProgress = async (progressData) => {
    if (!exerciseSession) return
    
    try {
      await fetch(`/api/vr/exercise-sessions/${exerciseSession}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(progressData)
      })
    } catch (error) {
      console.error('Error updating exercise progress:', error)
    }
  }

  const completeExerciseSession = async () => {
    if (!exerciseSession) return
    
    try {
      // Update final progress before completing
      await updateExerciseProgress({
        currentExercise: selectedPlan?.exercises.length || 0,
        completedExercise: {
          exerciseIndex: currentExercise,
          duration: sessionDuration,
          accuracy: poseAccuracy,
          breathingAccuracy: breathingAccuracy
        }
      })
      
      const response = await fetch(`/api/vr/exercise-sessions/${exerciseSession}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actualDuration: Math.floor(sessionDuration / 60),
          rating: 5
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Stop pose detection service
        if (poseDetectionService) {
          poseDetectionService.stop()
          setPoseDetectionService(null)
        }
        
        setIsMonitoring(false)
        setShowMonitoring(false)
        setExerciseSession(null)
        setSelectedPlan(null)
        setCurrentExercise(0)
        setIsPlaying(false)
        setSessionDuration(0)
        setPoseAccuracy(0)
        setBreathingAccuracy(0)
        setMonitoringFeedback('')
      }
    } catch (error) {
      console.error('Error completing exercise session:', error)
    }
  }

  const startSession = () => {
    setIsPlaying(true)
    // TODO: Start meditation session and timer
  }

  const stopSession = () => {
    setIsPlaying(false)
    setSessionDuration(0)
    // TODO: Stop session and save data
  }

  const resetSession = () => {
    setSessionDuration(0)
    setIsPlaying(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="mr-4"
              >
                ← Back
              </Button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">VR Meditation</h1>
                  <p className="text-sm text-gray-500">Immersive relaxation experiences</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isVRSupported && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">VR Ready</span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* VR Scene */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}
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
                
                {/* VR Scene Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    <div className="text-6xl mb-4">
                      {currentEnvironment === 'ocean' && '🌊'}
                      {currentEnvironment === 'forest' && '🌲'}
                      {currentEnvironment === 'rain' && '🌧️'}
                      {currentEnvironment === 'space' && '🌌'}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {environments.find(env => env.id === currentEnvironment)?.name}
                    </h2>
                    <p className="text-gray-300">
                      {environments.find(env => env.id === currentEnvironment)?.description}
                    </p>
                  </motion.div>
                </div>

                {/* Session Timer */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2"
                  >
                    <div className="text-white text-lg font-mono">
                      {formatTime(sessionDuration)}
                    </div>
                  </motion.div>
                )}

                {/* Computer Vision Monitoring */}
                {showMonitoring && isMonitoring && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 min-w-[200px]"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Camera className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm font-medium">AI Monitoring</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs">Pose Accuracy</span>
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-blue-400" />
                          <span className="text-white text-xs font-mono">{poseAccuracy}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs">Breathing</span>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-green-400" />
                          <span className="text-white text-xs font-mono">{breathingAccuracy}%</span>
                        </div>
                      </div>
                      
                      {monitoringFeedback && (
                        <div className="mt-2 p-2 bg-white/10 rounded text-xs text-white">
                          {monitoringFeedback}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Current Exercise Info */}
                {selectedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-20 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4"
                  >
                    <div className="text-center text-white">
                      <h3 className="text-lg font-semibold mb-1">
                        {selectedPlan.exercises[currentExercise]?.name || 'Exercise Complete'}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {selectedPlan.exercises[currentExercise]?.description || 'Great job!'}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-xs">
                          Exercise {currentExercise + 1} of {selectedPlan.exercises.length}
                        </div>
                        <div className="w-32 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentExercise + 1) / selectedPlan.exercises.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* VR Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      onClick={isPlaying ? (exerciseSession ? completeExerciseSession : stopSession) : startSession}
                      className={`w-12 h-12 rounded-full ${
                        isPlaying 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetSession}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Environment Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environments</h3>
              <div className="space-y-3">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setCurrentEnvironment(env.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      currentEnvironment === env.id
                        ? `bg-gradient-to-r ${env.color} text-white shadow-lg`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{env.icon}</span>
                      <div>
                        <div className="font-medium">{env.name}</div>
                        <div className={`text-sm ${
                          currentEnvironment === env.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {env.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guided Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guided Sessions</h3>
              <div className="space-y-3">
                {guidedSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      setSessionDuration(session.duration)
                      startSession()
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{session.title}</div>
                        <div className="text-sm text-gray-600">{session.description}</div>
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        {formatTime(session.duration)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Plans */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exercise Plans</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExercisePlans(!showExercisePlans)}
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
                        className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{plan.name}</h4>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">
                              {plan.duration} min
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {plan.difficulty}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              {plan.type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-600">
                              {plan.exercises.length} exercises
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => startExerciseSession(plan._id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
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

            {/* Session Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Time</span>
                  <span className="font-semibold text-gray-900">12h 30m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorite Environment</span>
                  <span className="font-semibold text-gray-900">Ocean</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-green-600">7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
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
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">VR Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio Volume
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visual Quality
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="haptic" defaultChecked />
                    <label htmlFor="haptic" className="text-sm text-gray-700">
                      Enable Haptic Feedback
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowSettings(false)}>
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
