import { useState, useRef, useCallback } from 'react'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Square, Volume2, VolumeX, Camera } from 'lucide-react'

// Import modular components
import ExerciseCategorySelector from '../components/mindful-movement/ExerciseCategorySelector'
import ExerciseSelector from '../components/mindful-movement/ExerciseSelector'
import ActivitySettingsPopup from '../components/mindful-movement/ActivitySettingsPopup'
import CountdownDisplay from '../components/mindful-movement/CountdownDisplay'
import CameraFeed from '../components/mindful-movement/CameraFeed'
import SessionStats from '../components/mindful-movement/SessionStats'

// Import data
import { exerciseCategories } from '../data/exerciseCategories'
import { exercises } from '../data/exercises'
import { getExerciseInstructions } from '../data/exerciseInstructions'

// Import custom hook
import { useMindfulSession } from '../hooks/useMindfulSession'

const MindfulMovementRefactored = () => {
  // UI State
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [activitySettings, setActivitySettings] = useState({
    duration: 5, // minutes for mental wellness
    targetReps: 10 // for physical exercises
  })
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Use custom hook for session logic
  const {
    sessionState,
    setSessionState,
    sessionData,
    setSessionData,
    isTracking,
    setIsTracking,
    cameraStream,
    cameraError,
    poseTrackingActive,
    isCompleting,
    setIsCompleting,
    intervalRef,
    isCompletingRef,
    countdownRef,
    poseDefinitionRef,
    videoRef,
    setErrorMessage,
    speak,
    startCamera,
    stopCamera,
    startSession,
    stopSession,
    resetSession
  } = useMindfulSession()

  // Navigation function
  const handleBackNavigation = useCallback(() => {
    if (selectedActivity) {
      setSelectedActivity(null)
      setSessionState('idle')
      resetSession()
    } else if (selectedCategory) {
      setSelectedCategory(null)
    } else {
      window.history.back()
    }
  }, [selectedActivity, selectedCategory, setSessionState, resetSession])

  // Category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  // Activity selection
  const handleActivitySelect = useCallback((activity) => {
    setSelectedActivity(activity)
    setShowSettingsPopup(true)
  }, [])

  // Settings change
  const handleSettingsChange = useCallback((newSettings) => {
    setActivitySettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Start session from settings popup
  const handleStartSession = useCallback(() => {
    setShowSettingsPopup(false)
    startSession(selectedCategory, selectedActivity, activitySettings)
    showPoseDefinition()
  }, [selectedCategory, selectedActivity, activitySettings, startSession])

  // Show pose definition
  const showPoseDefinition = useCallback(() => {
    setSessionState('pose_definition')
    
    let instruction = "Please sit comfortably with your back straight, hands resting on your knees, and close your eyes gently."
    if (selectedActivity?.id === 'breathing') {
      instruction = "Please sit or stand comfortably with your back straight. Place one hand on your chest and the other on your belly. Focus on your breathing rhythm."
    } else if (selectedActivity?.id === 'mindfulness') {
      instruction = "Please find a comfortable seated position with your back straight. Keep your eyes gently closed or softly focused. Bring your attention to the present moment."
    }
    
    speak(instruction)
    
    poseDefinitionRef.current = setTimeout(() => {
      setSessionState('ready_to_start')
    }, 10000)
  }, [selectedActivity, setSessionState, speak])

  // Manual start function
  const startExerciseManually = useCallback(async () => {
    setSessionState('countdown')
    let count = 3
    
    setSessionData(prev => ({ ...prev, countdown: count }))
    await speak(count.toString())
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    for (let i = 2; i >= 1; i--) {
      count = i
      setSessionData(prev => ({ ...prev, countdown: count }))
      await speak(count.toString())
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setSessionData(prev => ({ ...prev, countdown: "Let's start" }))
    await speak("Let's start")
    
    if (selectedCategory.id === 'mental') {
      startMeditation()
    } else {
      startPhysicalExercise(selectedActivity)
    }
  }, [selectedCategory, setSessionState, setSessionData, speak])

  // Start meditation
  const startMeditation = useCallback(async () => {
    try {
      setSessionState('active')
      setIsTracking(true)
      setIsCompleting(false)
      isCompletingRef.current = false
      
      const cameraStarted = await startCamera()
      if (!cameraStarted) {
        setErrorMessage('Camera access required for pose tracking')
        return
      }
      
      // Initialize pose tracking
      const initialized = await poseTrackingService.initialize()
      if (!initialized) {
        setErrorMessage('Failed to initialize pose tracking service')
        return
      }
      
      // Start pose tracking
      const poseStarted = await poseTrackingService.startTracking(
        videoRef.current,
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
      
      startTimer()
      setSuccess(`${selectedActivity?.name} session started!`)
      
    } catch (error) {
      console.error('Error starting mental wellness session:', error)
      setErrorMessage('Failed to start mindfulness session')
    }
  }, [selectedActivity, setSessionState, setIsTracking, setIsCompleting, startCamera, setErrorMessage, setSuccess, setPoseTrackingActive, setSessionData])

  // Timer function
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const totalSeconds = activitySettings.duration * 60
    setSessionData(prev => ({ ...prev, remainingTime: totalSeconds }))
    
    intervalRef.current = setInterval(() => {
      setSessionData(prev => {
        const newElapsed = prev.elapsedTime + 1
        const newRemaining = Math.max(0, totalSeconds - newElapsed)
        
        if (prev.poseCorrect && prev.accuracy >= 100) {
          const newActualPoseTime = Math.min(prev.actualPoseTime + 1, totalSeconds)
          
          if (newActualPoseTime >= totalSeconds && !isCompletingRef.current) {
            isCompletingRef.current = true
            setIsCompleting(true)
            setTimeout(() => {
              stopSession(true)
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
  }, [activitySettings.duration, setSessionData, setIsCompleting, stopSession])

  // Start physical exercise
  const startPhysicalExercise = useCallback(async (activity) => {
    try {
      setSessionState('active')
      setIsTracking(true)
      setIsCompleting(false)
      isCompletingRef.current = false
      
      const cameraStarted = await startCamera()
      if (!cameraStarted) {
        setErrorMessage('Camera access required for exercise tracking')
        return
      }
      
      const initialized = await poseTrackingService.initialize()
      if (!initialized) {
        setErrorMessage('Failed to initialize pose tracking service')
        return
      }
      
      const poseStarted = await poseTrackingService.startTracking(
        videoRef.current,
        (results) => {
          setSessionData(prev => ({
            ...prev,
            accuracy: results.accuracy || 0,
            poseCorrect: results.poseDetected && results.accuracy >= 80,
            qualityScore: results.qualityScore || 0
          }))
        },
        (error) => {
          console.error('Pose tracking error:', error)
        }
      )
      
      if (poseStarted) {
        setPoseTrackingActive(true)
      }
      
      startExerciseTimer()
      setSuccess(`${activity.name} session started!`)
      
    } catch (error) {
      console.error('Error starting physical exercise:', error)
      setErrorMessage('Failed to start exercise session')
    }
  }, [setSessionState, setIsTracking, setIsCompleting, startCamera, setErrorMessage, setSuccess, setPoseTrackingActive, setSessionData])

  // Exercise timer
  const startExerciseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      setSessionData(prev => {
        const newElapsed = prev.elapsedTime + 1
        
        if (prev.poseCorrect) {
          const newRepCount = prev.repCount + 1
          
          if (newRepCount >= activitySettings.targetReps) {
            setTimeout(() => {
              stopSession(true)
            }, 1000)
          }
          
          return {
            ...prev,
            elapsedTime: newElapsed,
            repCount: newRepCount
          }
        }
        
        return {
          ...prev,
          elapsedTime: newElapsed
        }
      })
    }, 1000)
  }, [activitySettings.targetReps, setSessionData, stopSession])

  // Stop session
  const handleStopSession = useCallback((forceComplete = false) => {
    if (selectedCategory.id === 'mental' && !forceComplete) {
      const totalSeconds = activitySettings.duration * 60
      if (sessionData.actualPoseTime < totalSeconds) {
        speak(`Session not completed. You need to maintain correct pose for the full duration.`)
        setErrorMessage(`Session not completed. You spent ${formatTime(sessionData.actualPoseTime)} in correct pose, but needed ${formatTime(totalSeconds)}.`)
        return
      }
    }
    
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
    
    const sessionType = selectedCategory.id === 'mental' ? 'Mindfulness' : 'Exercise'
    
    if (forceComplete) {
      if (selectedCategory.id === 'mental') {
        const durationText = formatDurationForSpeech(activitySettings.duration)
        speak(`Congratulations! You completed ${durationText} of ${selectedActivity?.name.toLowerCase()}!`)
      } else {
        speak(`Congratulations! You completed ${activitySettings.targetReps} ${selectedActivity?.name.toLowerCase()}!`)
      }
      
      setSuccess(`${sessionType} session completed successfully!`)
    } else {
      setSuccess(`${sessionType} session stopped.`)
    }
  }, [selectedCategory, selectedActivity, activitySettings, sessionData, setSessionState, setIsTracking, stopCamera, setPoseTrackingActive, speak, setErrorMessage, setSuccess])

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDurationForSpeech = (duration) => {
    if (duration < 1) {
      const seconds = Math.round(duration * 60)
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    } else {
      return `${duration} minute${duration !== 1 ? 's' : ''}`
    }
  }

  // Render different states
  const renderContent = () => {
    if (!selectedCategory) {
      return <ExerciseCategorySelector onCategorySelect={handleCategorySelect} />
    }

    if (!selectedActivity) {
      return (
        <ExerciseSelector
          selectedCategory={selectedCategory}
          exercises={exercises[selectedCategory.id]}
          onExerciseSelect={handleActivitySelect}
          onBack={() => setSelectedCategory(null)}
        />
      )
    }

    if (sessionState === 'pose_definition') {
      return (
        <div className="text-center">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedActivity(null)
                setSessionState('idle')
                resetSession()
              }}
              className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
          
          <div className="text-6xl mb-6">🧘‍♀️</div>
          <h2 className="text-3xl font-light text-slate-800 mb-4">
            {selectedActivity.name} Session
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Please get into the correct position as instructed. The session will begin automatically in a few seconds.
          </p>
          
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 max-w-2xl mx-auto">
            <h4 className="text-lg font-medium text-slate-700 mb-3">Pose Instructions</h4>
            <div className="text-sm text-slate-600 space-y-2">
              <p>✓ Sit with your back straight</p>
              <p>✓ Keep your hips lower than shoulders</p>
              <p>✓ Bend your knees in seated position</p>
              <p>✓ Keep your head centered between shoulders</p>
              <p className="font-medium text-violet-600 mt-3">Timer only runs when the pose accuracy is at least 80%</p>
            </div>
          </div>
        </div>
      )
    }

    if (sessionState === 'ready_to_start') {
      return (
        <div className="text-center">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedActivity(null)
                setSessionState('idle')
                resetSession()
              }}
              className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
          
          <div className="text-6xl mb-6">🧘‍♀️</div>
          <h2 className="text-3xl font-light text-slate-800 mb-4">
            {selectedActivity.name} Session
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Ready to begin your {selectedActivity.name.toLowerCase()} session?
          </p>
          
          <Button
            onClick={startExerciseManually}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-xl rounded-2xl shadow-wellness hover:shadow-wellness-lg transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Exercise
          </Button>
        </div>
      )
    }

    if (sessionState === 'countdown') {
      return (
        <div className="text-center">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedActivity(null)
                setSessionState('idle')
                resetSession()
              }}
              className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
          
          <div className="text-6xl mb-6">🧘‍♀️</div>
          <h2 className="text-3xl font-light text-slate-800 mb-4">
            {selectedActivity.name} Session
          </h2>
          
          <CountdownDisplay countdown={sessionData.countdown} />
        </div>
      )
    }

    if (sessionState === 'active' || sessionState === 'completed') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedActivity(null)
                setSessionState('idle')
                resetSession()
              }}
              className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h2 className="text-3xl font-light text-slate-800 mb-2">
              {selectedActivity.name} Session
            </h2>
            <div className="inline-block bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
              {sessionState === 'active' && 'Session Active'}
              {sessionState === 'completed' && 'Session Complete'}
            </div>
          </div>

          <CameraFeed
            isTracking={isTracking}
            cameraStream={cameraStream}
            cameraError={cameraError}
            videoRef={videoRef}
            poseTrackingActive={poseTrackingActive}
            selectedCategory={selectedCategory}
            sessionState={sessionState}
            sessionData={sessionData}
          />

          <SessionStats
            selectedCategory={selectedCategory}
            sessionState={sessionState}
            sessionData={sessionData}
            activitySettings={activitySettings}
          />

          <div className="text-center">
            {sessionState === 'active' && (
              <Button
                onClick={() => handleStopSession(false)}
                className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Square className="w-6 h-6 mr-3" />
                Complete Session
              </Button>
            )}
            
            {sessionState === 'completed' && (
              <Button
                onClick={() => {
                  setSelectedActivity(null)
                  setSessionState('idle')
                  resetSession()
                }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-6 h-6 mr-3" />
                Start New Session
              </Button>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mr-6 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🧘</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">Mindful Movement</h1>
                  <p className="text-sm text-slate-600">Wellness & Mindfulness</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                className="p-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={sessionState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings Popup */}
      <ActivitySettingsPopup
        isOpen={showSettingsPopup}
        onClose={() => {
          setShowSettingsPopup(false)
          setSelectedActivity(null)
        }}
        selectedActivity={selectedActivity}
        selectedCategory={selectedCategory}
        activitySettings={activitySettings}
        onSettingsChange={handleSettingsChange}
        onStart={handleStartSession}
      />

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50"
          >
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 text-sm">⚠️</span>
                </div>
                <p className="text-rose-700 font-medium">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">✓</span>
                </div>
                <p className="text-emerald-700 font-medium">{success}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MindfulMovementRefactored
