import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
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
  const [wellnessGoals, setWellnessGoals] = useState([
    { id: 1, title: 'Daily Meditation', target: 10, current: 7, unit: 'minutes', icon: '🧘‍♀️' },
    { id: 2, title: 'Journal Entries', target: 5, current: 3, unit: 'per week', icon: '📝' },
    { id: 3, title: 'VR Sessions', target: 3, current: 2, unit: 'per week', icon: '🥽' },
    { id: 4, title: 'Sleep Hours', target: 8, current: 6.5, unit: 'hours', icon: '😴' }
  ])

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first meditation session', icon: '🌟', earned: true },
    { id: 2, title: 'Week Warrior', description: '7-day meditation streak', icon: '🔥', earned: true },
    { id: 3, title: 'Journal Keeper', description: 'Wrote 10 journal entries', icon: '📚', earned: true },
    { id: 4, title: 'VR Explorer', description: 'Completed 5 VR sessions', icon: '🚀', earned: false },
    { id: 5, title: 'Mood Master', description: 'Maintained positive mood for 30 days', icon: '😊', earned: false }
  ]

  const stats = [
    { label: 'Total Points', value: '2,450', icon: '⭐', color: 'from-yellow-400 to-yellow-500' },
    { label: 'Current Streak', value: '12 days', icon: '🔥', color: 'from-red-400 to-red-500' },
    { label: 'Sessions Completed', value: '47', icon: '✅', color: 'from-green-400 to-green-500' },
    { label: 'Mood Average', value: '8.2/10', icon: '😊', color: 'from-blue-400 to-blue-500' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const updateGoal = (goalId, newValue) => {
    setWellnessGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, current: Math.min(newValue, goal.target) }
          : goal
      )
    )
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
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
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
                    {[
                      { activity: 'Completed 10-minute meditation', time: '2 hours ago', points: '+50' },
                      { activity: 'Wrote journal entry', time: '1 day ago', points: '+30' },
                      { activity: 'Finished VR session', time: '2 days ago', points: '+100' },
                      { activity: 'Achieved weekly goal', time: '3 days ago', points: '+200' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.activity}</p>
                          <p className="text-sm text-gray-500">{item.time}</p>
                        </div>
                        <div className="text-sm font-semibold text-green-600">{item.points}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Mood Trend</h4>
                        <div className="flex items-end space-x-2 h-20">
                          {[7, 8, 6, 9, 8, 7, 8].map((height, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-t from-purple-400 to-purple-500 rounded-t"
                              style={{ height: `${height * 8}px`, width: '20px' }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Activity Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Meditation</span>
                            <span className="text-sm font-medium">40%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Journaling</span>
                            <span className="text-sm font-medium">30%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">VR Sessions</span>
                            <span className="text-sm font-medium">30%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
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
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                    Add Goal
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {wellnessGoals.map((goal) => (
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
                  ))}
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
                  {achievements.map((achievement) => (
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
                  ))}
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
    </div>
  )
}

export default Profile
