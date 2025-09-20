import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import { User, Settings, Target, Award, Calendar, BarChart3, Globe, Bell, Cloud, Leaf, Sparkles, Brain, Heart } from 'lucide-react'
import { getApiBaseUrl } from '../utils/config'

const Profile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [preferences, setPreferences] = useState({
    language: 'en',
    notifications: true,
    theme: 'light',
    privacy: 'friends'
  })
  const [wellnessGoals, setWellnessGoals] = useState([])
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'times',
    priority: 'medium'
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [moodTrend, setMoodTrend] = useState([])
  const [activityDistribution, setActivityDistribution] = useState({})
  const [journalEntries, setJournalEntries] = useState([])
  const [aiConversations, setAiConversations] = useState([])
  const [exerciseSessions, setExerciseSessions] = useState([])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const fetchProfileData = useCallback(async () => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot fetch profile data')
        setWellnessGoals([])
        setAchievements([])
        setStats([])
        setIsLoading(false)
        return
      }

      const idToken = await user.getIdToken()
      
      // Fetch wellness goals
      const goalsResponse = await fetch(`${getApiBaseUrl()}/profile/wellness-goals`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch achievements
      const achievementsResponse = await fetch(`${getApiBaseUrl()}/profile/achievements`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch user stats
      const statsResponse = await fetch(`${getApiBaseUrl()}/profile/stats`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch user preferences
      const preferencesResponse = await fetch(`${getApiBaseUrl()}/profile/preferences`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      
      
      
      // Fetch journal entries for wellness calculation
      const journalResponse = await fetch(`${getApiBaseUrl()}/journal/entries`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch AI conversations for wellness calculation
      const aiResponse = await fetch(`${getApiBaseUrl()}/ai/conversations`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch exercise sessions for wellness calculation
      const exerciseResponse = await fetch(`${getApiBaseUrl()}/vr/sessions`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Check if any response failed
      if (!goalsResponse.ok || !achievementsResponse.ok || !statsResponse.ok || !preferencesResponse.ok || 
          !journalResponse.ok || !aiResponse.ok || !exerciseResponse.ok) {
        console.warn('Backend server not running')
        setWellnessGoals([])
        setAchievements([])
        setStats([])
        setJournalEntries([])
        setAiConversations([])
        setExerciseSessions([])
        setIsLoading(false)
        return
      }
      
      const contentType = goalsResponse.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setWellnessGoals([])
        setAchievements([])
        setStats([])
        setRecentActivity([])
        setMoodTrend([])
        setActivityDistribution({})
        setIsLoading(false)
        return
      }
      
      const goalsData = await goalsResponse.json()
      const achievementsData = await achievementsResponse.json()
      const statsData = await statsResponse.json()
      const preferencesData = await preferencesResponse.json()
      const journalData = await journalResponse.json()
      const aiData = await aiResponse.json()
      const exerciseData = await exerciseResponse.json()
      
      if (goalsData.success) {
        setWellnessGoals(goalsData.goals || [])
      } else {
        console.error('Failed to fetch wellness goals:', goalsData.error)
        setWellnessGoals([])
      }
      
      if (achievementsData.success) {
        setAchievements(achievementsData.achievements || [])
      } else {
        console.error('Failed to fetch achievements:', achievementsData.error)
        setAchievements([])
      }
      
      if (statsData.success) {
        // Transform backend stats object into frontend format
        const backendStats = statsData.stats || {}
        const transformedStats = [
          {
            label: 'Journal Entries',
            value: backendStats.journalEntries || 0,
            icon: <Calendar className="w-6 h-6 text-white" />,
            color: 'from-blue-500 to-blue-600'
          },
          {
            label: 'AI Conversations',
            value: backendStats.aiConversations || 0,
            icon: <User className="w-6 h-6 text-white" />,
            color: 'from-green-500 to-green-600'
          }
        ]
        setStats(transformedStats)
      } else {
        console.error('Failed to fetch stats:', statsData.error)
        setStats([])
      }
      
      // Process journal entries and AI conversations for wellness calculation
      if (journalData.success) {
        setJournalEntries(journalData.entries || [])
      } else {
        console.error('Failed to fetch journal entries:', journalData.error)
        setJournalEntries([])
      }
      
      if (aiData.success) {
        setAiConversations(aiData.conversations || [])
      } else {
        console.error('Failed to fetch AI conversations:', aiData.error)
        setAiConversations([])
      }
      
      // Process exercise sessions for wellness calculation
      if (exerciseData.success) {
        setExerciseSessions(exerciseData.sessions || [])
      } else {
        console.error('Failed to fetch exercise sessions:', exerciseData.error)
        setExerciseSessions([])
      }
      
      if (preferencesData.success) {
        setPreferences(preferencesData.preferences || {
          language: 'en',
          notifications: true,
          theme: 'light',
          privacy: 'friends'
        })
      } else {
        console.error('Failed to fetch preferences:', preferencesData.error)
      }
      
      // Set default activity distribution since we're not fetching it from backend
      setActivityDistribution({})
    } catch (error) {
      console.error('Error fetching profile data:', error.message)
      setWellnessGoals([])
      setAchievements([])
      setStats([])
      setRecentActivity([])
      setMoodTrend([])
      setActivityDistribution({})
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // Update stats when wellness scores change
  useEffect(() => {
    setStats([
      {
        label: 'Journal Entries',
        value: journalEntries.length.toString(),
        icon: <Calendar className="w-6 h-6 text-white" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        label: 'AI Conversations',
        value: aiConversations.length.toString(),
        icon: <User className="w-6 h-6 text-white" />,
        color: 'from-green-500 to-green-600'
      },
      {
        label: 'Mental Wellness',
        value: `${exerciseSessions.length} exercises`,
        icon: <Brain className="w-6 h-6 text-white" />,
        color: 'from-indigo-500 to-purple-600'
      },
      {
        label: 'Physical Wellness',
        value: `${exerciseSessions.length} exercises`,
        icon: <Heart className="w-6 h-6 text-white" />,
        color: 'from-rose-500 to-pink-600'
      }
    ])
  }, [journalEntries, aiConversations, exerciseSessions])

  // Create dynamic recent activity from all sources
  const createRecentActivity = useCallback(() => {
    const activities = []
    
    // Add journal entries
    journalEntries.forEach(entry => {
      activities.push({
        id: `journal_${entry._id || entry.id}`,
        type: 'journal',
        activity: 'Journal Entry',
        description: entry.content ? entry.content.substring(0, 100) + '...' : 'Reflected on your day',
        time: new Date(entry.createdAt || entry.date).toLocaleDateString(),
        timestamp: new Date(entry.createdAt || entry.date),
        points: 10,
        icon: '📝'
      })
    })
    
    // Add AI conversations
    aiConversations.forEach(conv => {
      activities.push({
        id: `ai_${conv._id || conv.id}`,
        type: 'ai',
        activity: 'AI Conversation',
        description: conv.lastMessage ? conv.lastMessage.substring(0, 100) + '...' : 'Chatted with AI companion',
        time: new Date(conv.createdAt || conv.date).toLocaleDateString(),
        timestamp: new Date(conv.createdAt || conv.date),
        points: 5,
        icon: '🤖'
      })
    })
    
    // Add exercise sessions
    exerciseSessions.forEach(session => {
      activities.push({
        id: `exercise_${session._id || session.id}`,
        type: 'exercise',
        activity: 'Exercise Session',
        description: `${session.exerciseName || 'Exercise'} - ${session.actualDuration || session.plannedDuration || 0} minutes`,
        time: new Date(session.createdAt || session.date).toLocaleDateString(),
        timestamp: new Date(session.createdAt || session.date),
        points: 15,
        icon: '💪'
      })
    })
    
    // Sort by timestamp (most recent first) and limit to 10
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  }, [journalEntries, aiConversations, exerciseSessions])

  // Update recent activity when data changes
  useEffect(() => {
    const dynamicActivity = createRecentActivity()
    setRecentActivity(dynamicActivity)
  }, [createRecentActivity])

  // Calculate dynamic activity distribution
  const calculateActivityDistribution = useCallback(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    // Count activities this week
    const journalCount = journalEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt || entry.date)
      return entryDate >= weekStart
    }).length
    
    const aiCount = aiConversations.filter(conv => {
      const convDate = new Date(conv.createdAt || conv.date)
      return convDate >= weekStart
    }).length
    
    const exerciseCount = exerciseSessions.filter(session => {
      const sessionDate = new Date(session.createdAt || session.date)
      return sessionDate >= weekStart
    }).length
    
    const total = journalCount + aiCount + exerciseCount
    
    if (total === 0) {
      return {
        meditation: 0,
        journaling: 0,
        exercise: 0
      }
    }
    
    return {
      meditation: Math.round((aiCount / total) * 100), // AI conversations as meditation
      journaling: Math.round((journalCount / total) * 100),
      exercise: Math.round((exerciseCount / total) * 100)
    }
  }, [journalEntries, aiConversations, exerciseSessions])

  // Update activity distribution when data changes
  useEffect(() => {
    const dynamicDistribution = calculateActivityDistribution()
    setActivityDistribution(dynamicDistribution)
  }, [calculateActivityDistribution])

  // Calculate dynamic mood trend from journal entries
  const calculateMoodTrend = useCallback(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    // Get mood scores for the last 7 days
    const moodTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)
      
      // Find journal entries for this day
      const dayEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt || entry.date)
        return entryDate >= date && entryDate < nextDate
      })
      
      if (dayEntries.length > 0) {
        // Calculate average mood for the day
        const avgMood = dayEntries.reduce((sum, entry) => {
          return sum + (entry.mood || 5) // Default to 5 if no mood
        }, 0) / dayEntries.length
        
        moodTrend.push(Math.round(avgMood))
      } else {
        // No entries for this day, use neutral mood
        moodTrend.push(5)
      }
    }
    
    return moodTrend
  }, [journalEntries])

  // Update mood trend when data changes
  useEffect(() => {
    const dynamicMoodTrend = calculateMoodTrend()
    setMoodTrend(dynamicMoodTrend)
  }, [calculateMoodTrend])

  const updateGoal = async (goalId, newValue) => {
    try {
      const idToken = await user.getIdToken()
      const response = await fetch(`${getApiBaseUrl()}/profile/wellness-goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ goalId, current: newValue })
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setWellnessGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, current: Math.min(newValue, goal.target) }
              : goal
          )
        )
      } else {
        console.error('Failed to update goal:', data.error)
      }
    } catch (error) {
      console.error('Error updating goal:', error.message)
    }
  }

  const addGoal = async () => {
    try {
      if (!newGoal.title.trim() || !newGoal.target) {
        alert('Please fill in all required fields')
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch(`${getApiBaseUrl()}/profile/wellness-goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          goals: [
            ...wellnessGoals,
            {
              id: Date.now().toString(),
              title: newGoal.title,
              description: newGoal.description,
              target: parseInt(newGoal.target),
              current: 0,
              unit: newGoal.unit,
              priority: newGoal.priority,
              icon: '🎯'
            }
          ]
        })
      })
      
      if (!response.ok) {
        console.warn('Backend server not running')
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setWellnessGoals(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            title: newGoal.title,
            description: newGoal.description,
            target: parseInt(newGoal.target),
            current: 0,
            unit: newGoal.unit,
            priority: newGoal.priority,
            icon: '🎯'
          }
        ])
        setNewGoal({
          title: '',
          description: '',
          target: '',
          unit: 'times',
          priority: 'medium'
        })
        setShowAddGoalModal(false)
      } else {
        console.error('Failed to add goal:', data.error)
      }
    } catch (error) {
      console.error('Error adding goal:', error.message)
    }
  }

  return (
    <div className="min-h-screen wellness-bg relative overflow-hidden">
      {/* Floating wellness elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-sky-200/30"
        >
          <Cloud className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-32 text-emerald-200/25"
        >
          <Leaf className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-32 text-violet-200/20"
        >
          <Sparkles className="w-14 h-14" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-wellness border-b border-emerald-100/50 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="mr-6 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
              >
                ← Back
              </Button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-slate-700">Wellness Profile</h1>
                  <p className="text-sm text-slate-500">Manage your wellness journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-wellness p-8 mb-8 border border-emerald-100"
        >
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-wellness">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-light text-slate-700 mb-2">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-slate-600 mb-4">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-sm text-slate-500">
                  Member since {new Date().getFullYear()}
                </span>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-wellness hover:shadow-wellness-lg">
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading stats...</p>
              </div>
            </div>
          ) : (
            stats.map((stat, index) => (
            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-wellness p-6 border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-wellness`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-700 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))
          )}
        </motion.div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-wellness overflow-hidden border border-emerald-100">
          <div className="border-b border-emerald-100">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                                <div>
                  <h3 className="text-xl font-light text-slate-700 mb-6">Weekly Progress</h3>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-700">Mood Trend</h4>
                          <button
                            onClick={() => fetchProfileData()}
                            className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                            disabled={isLoading}
                          >
                            Refresh
                          </button>
                        </div>
                        {isLoading ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-end justify-between h-20 px-1">
                              {moodTrend.length > 0 ? (
                                moodTrend.map((height, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-t from-emerald-400 to-emerald-500 rounded-t transition-all duration-300 flex-shrink-0"
                                    style={{ height: `${Math.max(height * 8, 8)}px`, width: '20px' }}
                                    title={`Day ${index + 1}: Mood ${height}/10`}
                                  />
                                ))
                              ) : (
                                // Show default bars when no data
                                [5, 5, 5, 5, 5, 5, 5].map((height, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t flex-shrink-0"
                                    style={{ height: `${height * 8}px`, width: '20px' }}
                                    title={`No mood data for day ${index + 1}`}
                                  />
                                ))
                              )}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                              <span className="flex-shrink-0">Mon</span>
                              <span className="flex-shrink-0">Tue</span>
                              <span className="flex-shrink-0">Wed</span>
                              <span className="flex-shrink-0">Thu</span>
                              <span className="flex-shrink-0">Fri</span>
                              <span className="flex-shrink-0">Sat</span>
                              <span className="flex-shrink-0">Sun</span>
                            </div>
                            {moodTrend.length > 0 ? (
                              <div className="text-xs text-gray-400 mt-2 text-center">
                                Based on {moodTrend.filter(m => m !== 5).length} days with journal entries
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 mt-2 text-center">
                                No mood data available. Write journal entries to see your mood trend!
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3">Activity Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Meditation</span>
                            <span className="text-sm font-medium">{activityDistribution.meditation || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${activityDistribution.meditation || 0}%` }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Journaling</span>
                            <span className="text-sm font-medium">{activityDistribution.journaling || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${activityDistribution.journaling || 0}%` }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Exercise</span>
                            <span className="text-sm font-medium">{activityDistribution.exercise || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${activityDistribution.exercise || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-light text-slate-700 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{item.icon}</div>
                            <div>
                              <p className="font-medium text-slate-700">{item.activity}</p>
                              <p className="text-sm text-slate-500">{item.time}</p>
                              {item.description && (
                                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-emerald-600">+{item.points}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No recent activity found</p>
                        <p className="text-sm mt-2">Start journaling, meditating, or chatting with AI to see your activity here!</p>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-light text-slate-700">Wellness Goals</h3>
                  <Button 
                    onClick={() => setShowAddGoalModal(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-wellness hover:shadow-wellness-lg"
                  >
                    Add Goal
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading goals...</p>
                      </div>
                    </div>
                  ) : (
                    wellnessGoals.map((goal) => (
                    <div key={goal.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h4 className="font-semibold text-slate-700">{goal.title}</h4>
                          <p className="text-sm text-slate-600">{goal.target} {goal.unit} per week</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium">{goal.current}/{goal.target}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(goal.current / goal.target) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoal(goal.id, goal.current + 1)}
                          disabled={goal.current >= goal.target}
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          +1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoal(goal.id, Math.max(0, goal.current - 1))}
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          -1
                        </Button>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-light text-slate-700">Achievements</h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading achievements...</p>
                      </div>
                    </div>
                  ) : (
                    achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-3 ${achievement.earned ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                        {achievement.earned ? (
                          <div className="text-sm font-medium text-green-600">✓ Earned</div>
                        ) : (
                          <div className="text-sm text-gray-500">Not earned yet</div>
                        )}
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-light text-slate-700">Settings</h3>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Language & Region
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full p-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-700">Push Notifications</div>
                          <div className="text-sm text-slate-600">Receive reminders and updates</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.notifications}
                            onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                    <h4 className="font-semibold text-slate-700 mb-4">Privacy</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={preferences.privacy}
                          onChange={(e) => setPreferences(prev => ({ ...prev, privacy: e.target.value }))}
                          className="w-full p-3 border border-violet-200 rounded-2xl focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white/50"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">Reset to Defaults</Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-wellness hover:shadow-wellness-lg">
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-light text-slate-700 mb-6">Add New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50"
                  placeholder="e.g., Daily Meditation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe your goal..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target *
                  </label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="times">times</option>
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                    <option value="sessions">sessions</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddGoalModal(false)}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                Cancel
              </Button>
              <Button
                onClick={addGoal}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-wellness hover:shadow-wellness-lg"
              >
                Add Goal
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Profile
