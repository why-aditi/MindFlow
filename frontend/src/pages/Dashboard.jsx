import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const quickActions = [
    {
      title: "AI Companion",
      description: "Chat with your AI wellness companion",
      icon: "🤖",
      color: "from-purple-500 to-purple-600",
      onClick: () => navigate('/ai-companion')
    },
    {
      title: "Journaling",
      description: "Record your thoughts and feelings",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate('/journaling')
    },
    {
      title: "VR Meditation",
      description: "Immersive relaxation experiences",
      icon: "🥽",
      color: "from-green-500 to-green-600",
      onClick: () => navigate('/vr-meditation')
    },
    {
      title: "Profile",
      description: "Manage your wellness goals",
      icon: "👤",
      color: "from-yellow-500 to-yellow-600",
      onClick: () => navigate('/profile')
    }
  ]

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
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
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                onClick={action.onClick}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    className={`w-16 h-16 mx-auto bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {action.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900">
                    {action.title}
                  </h3>
                  
                  <p className="text-gray-600">
                    {action.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: "Streak", value: "7 days", icon: "🔥" },
                { label: "Points", value: "1,250", icon: "⭐" },
                { label: "Sessions", value: "24", icon: "📊" },
                { label: "Mood Score", value: "8.5/10", icon: "😊" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard
