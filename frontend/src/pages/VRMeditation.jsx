import { useState, useRef, useEffect, useMemo } from 'react'
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
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const poseCanvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  // Core states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState('ocean')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionMode, setSessionMode] = useState('guided') // guided, free, exercise
  
  // Enhanced meditation states
  const [breathingPhase, setBreathingPhase] = useState('inhale')
  const [breathingCycle, setBreathingCycle] = useState(0)
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
  const [poseDetectionService, setPoseDetectionService] = useState(null)
  
  // Social and gamification states
  const [userStreak, setUserStreak] = useState(7)
  const [totalSessions, setTotalSessions] = useState(24)

  const environments = useMemo(() => [
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Calming ocean sounds with gentle waves',
      icon: '🌊',
      color: 'from-blue-400 to-blue-600',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      particles: 'bubbles',
      soundscape: 'ocean-waves'
    },
    {
      id: 'forest',
      name: 'Forest Sanctuary',
      description: 'Peaceful forest with birds and wind',
      icon: '🌲',
      color: 'from-green-400 to-green-600',
      gradient: 'from-green-500/20 to-emerald-500/20',
      particles: 'leaves',
      soundscape: 'forest-ambient'
    },
    {
      id: 'rain',
      name: 'Rain Meditation',
      description: 'Gentle rain and thunder sounds',
      icon: '🌧️',
      color: 'from-gray-400 to-gray-600',
      gradient: 'from-gray-500/20 to-slate-500/20',
      particles: 'raindrops',
      soundscape: 'rain-thunder'
    },
    {
      id: 'space',
      name: 'Cosmic Silence',
      description: 'Ambient space sounds and silence',
      icon: '🌌',
      color: 'from-purple-400 to-purple-600',
      gradient: 'from-purple-500/20 to-indigo-500/20',
      particles: 'stars',
      soundscape: 'space-ambient'
    },
    {
      id: 'mountain',
      name: 'Mountain Peak',
      description: 'Serene mountain views and wind',
      icon: '🏔️',
      color: 'from-orange-400 to-red-600',
      gradient: 'from-orange-500/20 to-red-500/20',
      particles: 'snowflakes',
      soundscape: 'mountain-wind'
    },
    {
      id: 'zen',
      name: 'Zen Garden',
      description: 'Minimalist zen garden with flowing water',
      icon: '🎋',
      color: 'from-teal-400 to-green-600',
      gradient: 'from-teal-500/20 to-green-500/20',
      particles: 'sand',
      soundscape: 'zen-water'
    }
  ], [])

  const guidedSessions = [
    {
      id: 1,
      title: '5-Minute Breathing',
      duration: 300,
      description: 'Quick breathing exercise for stress relief',
      difficulty: 'Beginner',
      category: 'Breathing',
      benefits: ['Stress Relief', 'Focus', 'Calm'],
      icon: Wind
    },
    {
      id: 2,
      title: 'Body Scan Meditation',
      duration: 900,
      description: 'Progressive relaxation technique',
      difficulty: 'Intermediate',
      category: 'Relaxation',
      benefits: ['Deep Relaxation', 'Body Awareness', 'Sleep'],
      icon: Activity
    },
    {
      id: 3,
      title: 'Mindfulness Walk',
      duration: 1200,
      description: 'Guided walking meditation',
      difficulty: 'Beginner',
      category: 'Movement',
      benefits: ['Mindfulness', 'Grounding', 'Energy'],
      icon: Mountain
    },
    {
      id: 4,
      title: 'Sleep Preparation',
      duration: 1800,
      description: 'Calming session before bedtime',
      difficulty: 'Beginner',
      category: 'Sleep',
      benefits: ['Better Sleep', 'Relaxation', 'Dreams'],
      icon: Moon
    },
    {
      id: 5,
      title: 'Focus Enhancement',
      duration: 600,
      description: 'Boost concentration and mental clarity',
      difficulty: 'Advanced',
      category: 'Focus',
      benefits: ['Concentration', 'Mental Clarity', 'Productivity'],
      icon: Brain
    },
    {
      id: 6,
      title: 'Energy Boost',
      duration: 480,
      description: 'Energizing morning meditation',
      difficulty: 'Intermediate',
      category: 'Energy',
      benefits: ['Energy', 'Motivation', 'Vitality'],
      icon: Sun
    }
  ]


  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported)
      })
    }

    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()

    // Initialize Three.js scene
    const initializeVRScene = () => {
      if (!canvasRef.current) return

      // Create immersive 3D environment
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Create particle system
      const createParticleSystem = (ctx) => {
        const particles = []
        const currentEnv = environments.find(env => env.id === currentEnvironment)
        
        // Create particles based on environment
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * canvasRef.current.width,
            y: Math.random() * canvasRef.current.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.3,
            color: getParticleColor(currentEnv.particles)
          })
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          
          particles.forEach(particle => {
            particle.x += particle.vx
            particle.y += particle.vy
            
            // Wrap around screen
            if (particle.x < 0) particle.x = canvasRef.current.width
            if (particle.x > canvasRef.current.width) particle.x = 0
            if (particle.y < 0) particle.y = canvasRef.current.height
            if (particle.y > canvasRef.current.height) particle.y = 0
            
            // Draw particle
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = particle.color
            ctx.globalAlpha = particle.opacity
            ctx.fill()
          })
          
          animationFrameRef.current = requestAnimationFrame(animate)
        }
        
        animate()
      }

      const getParticleColor = (type) => {
        const colors = {
          bubbles: '#87CEEB',
          leaves: '#90EE90',
          raindrops: '#B0C4DE',
          stars: '#FFD700',
          snowflakes: '#FFFFFF',
          sand: '#F4A460'
        }
        return colors[type] || '#FFFFFF'
      }

      createParticleSystem(ctx)
    }

    // Start biometric simulation
    const startBiometricSimulation = () => {
      const interval = setInterval(() => {
        if (isPlaying) {
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
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }

    initializeVRScene()
    fetchExercisePlans()
    const cleanup = startBiometricSimulation()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (poseDetectionService) {
        poseDetectionService.stop()
      }
      cleanup()
    }
  }, [isPlaying, sessionDuration, breathingAccuracy, poseDetectionService, currentEnvironment, environments])


  const fetchExercisePlans = async () => {
    try {
      const response = await fetch('/api/vr/exercise-plans')
      
      // Check if response is HTML (server not running)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, using mock data')
        // Set mock exercise plans for demo
        setExercisePlans([
          {
            _id: 'mock-1',
            name: 'Beginner Meditation',
            description: 'Perfect for newcomers to meditation',
            duration: 10,
            difficulty: 'beginner',
            type: 'breathing',
            exercises: [
              { name: 'Breathing Exercise', description: 'Focus on your breath' },
              { name: 'Body Scan', description: 'Progressive relaxation' }
            ]
          },
          {
            _id: 'mock-2',
            name: 'Advanced Focus',
            description: 'Challenge your concentration skills',
            duration: 20,
            difficulty: 'advanced',
            type: 'focus',
            exercises: [
              { name: 'Mindfulness', description: 'Present moment awareness' },
              { name: 'Visualization', description: 'Guided imagery practice' }
            ]
          }
        ])
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setExercisePlans(data.exercisePlans)
      }
    } catch (error) {
      console.warn('Error fetching exercise plans, using mock data:', error.message)
      // Set mock exercise plans for demo
      setExercisePlans([
        {
          _id: 'mock-1',
          name: 'Beginner Meditation',
          description: 'Perfect for newcomers to meditation',
          duration: 10,
          difficulty: 'beginner',
          type: 'breathing',
          exercises: [
            { name: 'Breathing Exercise', description: 'Focus on your breath' },
            { name: 'Body Scan', description: 'Progressive relaxation' }
          ]
        },
        {
          _id: 'mock-2',
          name: 'Advanced Focus',
          description: 'Challenge your concentration skills',
          duration: 20,
          difficulty: 'advanced',
          type: 'focus',
          exercises: [
            { name: 'Mindfulness', description: 'Present moment awareness' },
            { name: 'Visualization', description: 'Guided imagery practice' }
          ]
        }
      ])
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
      
      // Check if response is HTML (server not running)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running, starting mock exercise session')
        setIsMonitoring(true)
        setShowMonitoring(true)
        setSelectedPlan(exercisePlans.find(plan => plan._id === planId))
        setIsPlaying(true)
        setSessionMode('exercise')
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
        setPoseDetectionService(service)
      }
    } catch (error) {
      console.error('Error initializing pose detection:', error)
      startMonitoringSimulation()
    }
  }

  const updateBreathingPhase = (breathingData) => {
    const { phase } = breathingData
    setBreathingPhase(phase)
    
    if (phase === 'inhale') {
      setBreathingCycle(prev => prev + 1)
    }
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

  const startMonitoringSimulation = () => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        const poseAcc = Math.floor(Math.random() * 25) + 70
        setPoseAccuracy(poseAcc)
        
        const breathingAcc = Math.floor(Math.random() * 30) + 60
        setBreathingAccuracy(breathingAcc)
        
        const feedbacks = [
          'Perfect posture! ✨',
          'Great breathing rhythm 🌊',
          'Excellent form! 🎯',
          'Stay focused and calm 🧘',
          'Beautiful meditation pose 🌸',
          'Keep that steady rhythm 💫'
        ]
        const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)]
        setMonitoringFeedback(randomFeedback)
      } else {
        clearInterval(interval)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }

  const startSession = (session) => {
    setIsPlaying(true)
    setSessionDuration(session.duration)
    setSessionMode('guided')
    
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
  }

  const stopSession = () => {
    setIsPlaying(false)
    setSessionDuration(0)
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

  const getBreathingInstruction = () => {
    const instructions = {
      inhale: 'Breathe in slowly...',
      exhale: 'Breathe out gently...',
      hold: 'Hold your breath...',
      pause: 'Rest and prepare...'
    }
    return instructions[breathingPhase] || 'Follow your breath...'
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
                    background: `linear-gradient(135deg, ${environments.find(env => env.id === currentEnvironment)?.gradient})`
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
                
                {/* Enhanced VR Scene Overlay */}
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
                      {environments.find(env => env.id === currentEnvironment)?.icon}
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {environments.find(env => env.id === currentEnvironment)?.name}
                    </h2>
                    <p className="text-white/80 text-lg max-w-md mx-auto">
                      {environments.find(env => env.id === currentEnvironment)?.description}
                    </p>
                  </motion.div>
                </div>

                {/* Breathing Visualization */}
                {isPlaying && sessionMode === 'guided' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 left-8 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className="text-center text-white">
                      <div className="flex items-center justify-center mb-4">
                        <motion.div
                          className="w-20 h-20 border-4 border-white/30 rounded-full flex items-center justify-center"
                          animate={{
                            scale: breathingPhase === 'inhale' ? [1, 1.3, 1] : 1,
                            opacity: breathingPhase === 'hold' ? [0.7, 1, 0.7] : 1
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Wind className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Breathing Guide</h3>
                      <p className="text-white/80 text-sm mb-2">{getBreathingInstruction()}</p>
                      <div className="text-xs text-white/60">
                        Cycle {breathingCycle} • {breathingPhase}
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
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20 w-12 h-12"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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
            {/* Environment Selection - Enhanced */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Environments
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setCurrentEnvironment(env.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      currentEnvironment === env.id
                        ? `bg-gradient-to-r ${env.color} text-white shadow-lg transform scale-105`
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{env.icon}</div>
                      <div className="text-sm font-medium">{env.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guided Sessions - Enhanced */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Guided Sessions
              </h3>
              <div className="space-y-3">
                {guidedSessions.map((session) => {
                  const IconComponent = session.icon
                  return (
                    <button
                      key={session.id}
                      onClick={() => startSession(session)}
                      className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 rounded-xl text-left transition-all border border-white/20 hover:border-white/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{session.title}</div>
                            <div className="text-sm text-white/70">{session.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/80">
                                {session.difficulty}
                              </span>
                              <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/80">
                                {session.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-purple-300">
                            {formatTime(session.duration)}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
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
                      defaultValue="70"
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Visual Quality
                    </label>
                    <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option className="bg-slate-800">High</option>
                      <option className="bg-slate-800">Medium</option>
                      <option className="bg-slate-800">Low</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="haptic" defaultChecked className="accent-purple-500" />
                    <label htmlFor="haptic" className="text-sm text-white/80">
                      Enable Haptic Feedback
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="biometric" defaultChecked className="accent-purple-500" />
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
                    onClick={() => setShowSettings(false)}
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