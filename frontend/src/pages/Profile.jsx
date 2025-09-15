import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import { User, Settings, Target, Award, Calendar, BarChart3, Globe, Bell } from 'lucide-react'

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
      const goalsResponse = await fetch('http://localhost:5000/api/profile/wellness-goals', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch achievements
      const achievementsResponse = await fetch('http://localhost:5000/api/profile/achievements', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch user stats
      const statsResponse = await fetch('http://localhost:5000/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch user preferences
      const preferencesResponse = await fetch('http://localhost:5000/api/profile/preferences', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      // Fetch recent activity
      console.log('Fetching recent activity...')
      const activityResponse = await fetch('http://localhost:5000/api/profile/recent-activity', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      console.log('Activity response status:', activityResponse.status)
      
      // Fetch mood trend
      console.log('Fetching mood trend...')
      const moodTrendResponse = await fetch('http://localhost:5000/api/profile/mood-trend', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      console.log('Mood trend response status:', moodTrendResponse.status)
      
      // Fetch activity distribution
      console.log('Fetching activity distribution...')
      const activityDistResponse = await fetch('http://localhost:5000/api/profile/activity-distribution', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      console.log('Activity distribution response status:', activityDistResponse.status)
      
      // Check if any response failed
      if (!goalsResponse.ok || !achievementsResponse.ok || !statsResponse.ok || !preferencesResponse.ok || 
          !activityResponse.ok || !moodTrendResponse.ok || !activityDistResponse.ok) {
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
      const activityData = await activityResponse.json()
      console.log('Activity data:', activityData)
      const moodTrendData = await moodTrendResponse.json()
      console.log('Mood trend data:', moodTrendData)
      const activityDistData = await activityDistResponse.json()
      console.log('Activity distribution data:', activityDistData)
      
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
      
      if (activityData.success) {
        setRecentActivity(activityData.activities || [])
      } else {
        console.error('Failed to fetch recent activity:', activityData.error)
        setRecentActivity([])
      }
      
      if (moodTrendData.success) {
        console.log('Mood trend data received:', moodTrendData.moodTrend)
        setMoodTrend(moodTrendData.moodTrend || [])
      } else {
        console.error('Failed to fetch mood trend:', moodTrendData.error)
        setMoodTrend([])
      }
      
      if (activityDistData.success) {
        setActivityDistribution(activityDistData.distribution || {})
      } else {
        console.error('Failed to fetch activity distribution:', activityDistData.error)
        setActivityDistribution({})
      }
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

  const updateGoal = async (goalId, newValue) => {
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/profile/wellness-goals', {
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
      const response = await fetch('http://localhost:5000/api/profile/wellness-goals', {
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
                  <p className="text-sm text-gray-500">Manage your wellness journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-gray-600 mb-4">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-sm text-gray-500">
                  Member since {new Date().getFullYear()}
                </span>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading stats...</p>
              </div>
            </div>
          ) : (
            stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))
          )}
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">{item.activity}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-green-600">{item.points}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No recent activity found</p>
                        <p className="text-sm mt-2">Start journaling, meditating, or chatting with AI to see your activity here!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Mood Trend</h4>
                          <button
                            onClick={() => fetchProfileData()}
                            className="text-xs text-purple-600 hover:text-purple-800 underline"
                            disabled={isLoading}
                          >
                            Refresh
                          </button>
                        </div>
                        {isLoading ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-end justify-between h-20 px-1">
                              {moodTrend.length > 0 ? (
                                moodTrend.map((height, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-t from-purple-400 to-purple-500 rounded-t transition-all duration-300 flex-shrink-0"
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
                        <h4 className="font-semibold text-gray-900 mb-3">Activity Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Meditation</span>
                            <span className="text-sm font-medium">{activityDistribution.meditation || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${activityDistribution.meditation || 0}%` }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Journaling</span>
                            <span className="text-sm font-medium">{activityDistribution.journaling || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${activityDistribution.journaling || 0}%` }}></div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
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
                  <h3 className="text-xl font-bold text-gray-900">Wellness Goals</h3>
                  <Button 
                    onClick={() => setShowAddGoalModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
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
                    <div key={goal.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          <p className="text-sm text-gray-600">{goal.target} {goal.unit} per week</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.current}/{goal.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
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
                        >
                          +1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateGoal(goal.id, Math.max(0, goal.current - 1))}
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
                <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                
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
                <h3 className="text-xl font-bold text-gray-900">Settings</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Language & Region
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Push Notifications</div>
                          <div className="text-sm text-gray-600">Receive reminders and updates</div>
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

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Privacy</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={preferences.privacy}
                          onChange={(e) => setPreferences(prev => ({ ...prev, privacy: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              >
                Cancel
              </Button>
              <Button
                onClick={addGoal}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
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
