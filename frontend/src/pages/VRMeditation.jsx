import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Play, Pause, Volume2, VolumeX, RotateCcw, Settings, Headphones } from 'lucide-react'

const VRMeditation = () => {
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentEnvironment, setCurrentEnvironment] = useState('ocean')
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
  }, [])

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
                      onClick={isPlaying ? stopSession : startSession}
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
