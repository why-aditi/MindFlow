import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Brain, 
  BookOpen, 
  User, 
  Sparkles, 
  Leaf, 
  Cloud, 
  Waves,
  TrendingUp,
  Target,
  Clock,
  Award
} from 'lucide-react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [quickActions, setQuickActions] = useState([])
  const [userStats, setUserStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [journalEntries, setJournalEntries] = useState([])
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
      
      const journalMinutes = todayEntries.length * 5 // Assume 5 minutes per journal entry
      
      return journalMinutes
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
  }, [journalEntries, aiConversations])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Wellness-focused modules
      const hardcodedActions = [
        {
          title: 'Mindful Movement',
          description: 'AI-guided wellness exercises with pose tracking',
          icon: Heart,
          color: 'from-emerald-400 to-sky-500',
          bgColor: 'from-emerald-50 to-sky-50',
          borderColor: 'border-emerald-200',
          route: '/vr-exercise',
          onClick: () => navigate('/vr-exercise')
        },
        {
          title: 'AI Wellness Coach',
          description: 'Your personal companion for mental wellness',
          icon: Brain,
          color: 'from-violet-400 to-purple-500',
          bgColor: 'from-violet-50 to-purple-50',
          borderColor: 'border-violet-200',
          route: '/ai-companion',
          onClick: () => navigate('/ai-companion')
        },
        {
          title: 'Reflection Journal',
          description: 'Mindful journaling for inner peace',
          icon: BookOpen,
          color: 'from-sky-400 to-cyan-500',
          bgColor: 'from-sky-50 to-cyan-50',
          borderColor: 'border-sky-200',
          route: '/journaling',
          onClick: () => navigate('/journaling')
        },
        {
          title: 'Wellness Profile',
          description: 'Track your journey and achievements',
          icon: User,
          color: 'from-rose-400 to-pink-500',
          bgColor: 'from-rose-50 to-pink-50',
          borderColor: 'border-rose-200',
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
      { 
        icon: TrendingUp, 
        value: metrics.streak.toString(), 
        label: 'Wellness Streak', 
        color: 'from-emerald-400 to-green-500',
        bgColor: 'from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200'
      },
      { 
        icon: Clock, 
        value: metrics.minutesToday.toString(), 
        label: 'Mindful Minutes', 
        color: 'from-sky-400 to-blue-500',
        bgColor: 'from-sky-50 to-blue-50',
        borderColor: 'border-sky-200'
      },
      { 
        icon: Target, 
        value: metrics.goalsCompleted.toString(), 
        label: 'Goals Achieved', 
        color: 'from-violet-400 to-purple-500',
        bgColor: 'from-violet-50 to-purple-50',
        borderColor: 'border-violet-200'
      },
      { 
        icon: Award, 
        value: `${metrics.wellnessScore}%`, 
        label: 'Wellness Score', 
        color: 'from-rose-400 to-pink-500',
        bgColor: 'from-rose-50 to-pink-50',
        borderColor: 'border-rose-200'
      }
    ]
    setUserStats(dynamicStats)
  }, [calculateProgressMetrics])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])


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
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, -15, 0]
          }}
          transition={{ 
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-60 left-1/3 text-teal-200/20"
        >
          <Waves className="w-10 h-10" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-wellness border-b border-emerald-100/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-slate-700">MindFlow</h1>
                <p className="text-sm text-slate-500">Your Wellness Journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  Welcome back, {user?.displayName || 'Wellness Seeker'}!
                </p>
                <p className="text-xs text-slate-500">Ready for your wellness journey?</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover:bg-emerald-50 border-emerald-200 text-slate-600 hover:text-emerald-600 px-4 py-2 rounded-xl"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div>
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-light text-slate-700 mb-6"
            >
              Your Wellness Sanctuary
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto"
            >
              Choose your mindful practice for today and nurture your inner peace
            </motion.p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-emerald-300 border-t-emerald-500 rounded-full mx-auto mb-4"
                  ></motion.div>
                  <p className="text-slate-600 font-light">Preparing your wellness space...</p>
                </div>
              </div>
            ) : (
              quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-wellness hover:shadow-wellness-lg transition-all duration-500 cursor-pointer border ${action.borderColor} card-hover`}
                  onClick={action.onClick}
                >
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${action.color} rounded-3xl flex items-center justify-center shadow-lg`}>
                      <action.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-light text-slate-700">
                      {action.title}
                    </h3>
                    
                    <p className="text-slate-500 font-light leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-wellness-lg border border-emerald-100"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-slate-700 mb-4">Your Wellness Journey</h2>
              <p className="text-slate-500 font-light">Track your mindful progress and celebrate your growth</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-500 rounded-full"
                  ></motion.div>
                </div>
              ) : (
                userStats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`text-center bg-gradient-to-br ${stat.bgColor} rounded-2xl p-8 border ${stat.borderColor} shadow-wellness`}
                  >
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-light text-slate-700 mb-2">{stat.value}</div>
                    <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard
