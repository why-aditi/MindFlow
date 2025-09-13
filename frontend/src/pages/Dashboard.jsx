import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [quickActions, setQuickActions] = useState([])
  const [userStats, setUserStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [journalEntries, setJournalEntries] = useState([])
  const [vrSessions, setVrSessions] = useState([])
  const [aiConversations, setAiConversations] = useState([])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Calculate dynamic progress metrics
  const calculateProgressMetrics = useCallback(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Calculate day streak
    const calculateStreak = () => {
      if (journalEntries.length === 0) return 0
      
      const sortedEntries = journalEntries
        .map(entry => new Date(entry.createdAt || entry.date))
        .sort((a, b) => b - a)
      
      let streak = 0
      let currentDate = new Date(todayStart)
      
      for (const entryDate of sortedEntries) {
        const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
        const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        
        if (entryDateOnly.getTime() === expectedDate.getTime()) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (entryDateOnly.getTime() < expectedDate.getTime()) {
          break
        }
      }
      
      return streak
    }
    
    // Calculate minutes today
    const calculateMinutesToday = () => {
      const todayEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt || entry.date)
        return entryDate >= todayStart
      })
      
      const todayVrSessions = vrSessions.filter(session => {
        const sessionDate = new Date(session.createdAt || session.date)
        return sessionDate >= todayStart
      })
      
      const journalMinutes = todayEntries.length * 5 // Assume 5 minutes per journal entry
      const vrMinutes = todayVrSessions.reduce((total, session) => total + (session.duration || 0), 0)
      
      return journalMinutes + vrMinutes
    }
    
    // Calculate goals completed
    const calculateGoalsCompleted = () => {
      const completedGoals = []
      
      // Journal goal (daily)
      const hasJournalToday = journalEntries.some(entry => {
        const entryDate = new Date(entry.createdAt || entry.date)
        return entryDate >= todayStart
      })
      if (hasJournalToday) completedGoals.push('journal')
      
      // Exercise goal (VR sessions)
      const hasExerciseToday = vrSessions.some(session => {
        const sessionDate = new Date(session.createdAt || session.date)
        return sessionDate >= todayStart
      })
      if (hasExerciseToday) completedGoals.push('exercise')
      
      // AI interaction goal
      const hasAiToday = aiConversations.some(conv => {
        const convDate = new Date(conv.createdAt || conv.date)
        return convDate >= todayStart
      })
      if (hasAiToday) completedGoals.push('ai_interaction')
      
      return completedGoals.length
    }
    
    // Calculate wellness score
    const calculateWellnessScore = () => {
      const streak = calculateStreak()
      const minutesToday = calculateMinutesToday()
      const goalsCompleted = calculateGoalsCompleted()
      
      // Base score from streak (max 40 points)
      const streakScore = Math.min(streak * 5, 40)
      
      // Activity score from minutes today (max 30 points)
      const activityScore = Math.min(minutesToday * 0.5, 30)
      
      // Goals score (max 30 points)
      const goalsScore = goalsCompleted * 10
      
      const totalScore = streakScore + activityScore + goalsScore
      return Math.min(Math.round(totalScore), 100)
    }
    
    return {
      streak: calculateStreak(),
      minutesToday: calculateMinutesToday(),
      goalsCompleted: calculateGoalsCompleted(),
      wellnessScore: calculateWellnessScore()
    }
  }, [journalEntries, vrSessions, aiConversations])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Hardcoded modules - no backend dependency
      const hardcodedActions = [
        {
          title: 'VR Exercise',
          description: 'AI-powered exercise tracking with pose detection',
          icon: '💪',
          color: 'from-green-500 to-blue-500',
          route: '/vr-meditation',
          onClick: () => navigate('/vr-meditation')
        },
        {
          title: 'AI Companion',
          description: 'Chat with your AI wellness coach',
          icon: '🤖',
          color: 'from-purple-500 to-pink-500',
          route: '/ai-companion',
          onClick: () => navigate('/ai-companion')
        },
        {
          title: 'Journaling',
          description: 'Reflect on your wellness journey',
          icon: '📝',
          color: 'from-blue-500 to-cyan-500',
          route: '/journaling',
          onClick: () => navigate('/journaling')
        },
        {
          title: 'Profile',
          description: 'View your progress and settings',
          icon: '👤',
          color: 'from-orange-500 to-red-500',
          route: '/profile',
          onClick: () => navigate('/profile')
        }
      ]

      // Fetch user data for dynamic calculations
      if (user) {
        try {
          const idToken = await user.getIdToken()
          
          // Fetch journal entries
          const journalResponse = await fetch('http://localhost:5000/api/journal/entries', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          })
          if (journalResponse.ok) {
            const journalData = await journalResponse.json()
            if (journalData.success) {
              setJournalEntries(journalData.entries || [])
            }
          }
          
          // Fetch VR sessions
          const vrResponse = await fetch('http://localhost:5000/api/vr/sessions', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          })
          if (vrResponse.ok) {
            const vrData = await vrResponse.json()
            if (vrData.success) {
              setVrSessions(vrData.sessions || [])
            }
          }
          
          // Fetch AI conversations
          const aiResponse = await fetch('http://localhost:5000/api/ai/conversations', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          })
          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            if (aiData.success) {
              setAiConversations(aiData.conversations || [])
            }
          }
        } catch {
          console.warn('Backend not available, using mock data for progress calculation')
          // Set mock data for demonstration
          setJournalEntries([
            { createdAt: new Date().toISOString(), mood: 8 },
            { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), mood: 7 },
            { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 6 }
          ])
          setVrSessions([
            { createdAt: new Date().toISOString(), duration: 15 },
            { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), duration: 20 }
          ])
          setAiConversations([
            { createdAt: new Date().toISOString() },
            { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
          ])
        }
      }

      setQuickActions(hardcodedActions)
      setIsLoading(false)
    } catch (err) {
      console.error('Error setting dashboard data:', err.message)
      setQuickActions([])
      setIsLoading(false)
    }
  }, [navigate, user])

  // Update stats when data changes
  useEffect(() => {
    const metrics = calculateProgressMetrics()
    const dynamicStats = [
      { icon: '🔥', value: metrics.streak.toString(), label: 'Day Streak' },
      { icon: '⏱️', value: metrics.minutesToday.toString(), label: 'Minutes Today' },
      { icon: '🎯', value: metrics.goalsCompleted.toString(), label: 'Goals Completed' },
      { icon: '📊', value: `${metrics.wellnessScore}%`, label: 'Wellness Score' }
    ]
    setUserStats(dynamicStats)
  }, [calculateProgressMetrics])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MindFlow</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.displayName || 'User'}!
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Wellness Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Choose your wellness activity for today
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading dashboard...</p>
                </div>
              </div>
            ) : (
              quickActions.map((action) => (
                <div
                  key={action.title}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={action.onClick}
                >
                  <div className="text-center space-y-4">
                    <div
                      className={`w-16 h-16 mx-auto bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {action.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900">
                      {action.title}
                    </h3>
                    
                    <p className="text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Progress Section */}
          <div
            className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                userStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard
