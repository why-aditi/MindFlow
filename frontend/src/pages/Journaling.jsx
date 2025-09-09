import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Mic, MicOff, Save, Calendar, BarChart3, PenTool, Volume2 } from 'lucide-react'

const Journaling = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: new Date(),
      text: "Today was a good day. I felt more energetic and focused on my goals.",
      mood: 8,
      tags: ['productive', 'energetic'],
      type: 'text'
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000),
      text: "Feeling a bit overwhelmed with school work, but I'm managing.",
      mood: 6,
      tags: ['overwhelmed', 'school'],
      type: 'text'
    }
  ])
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedMood, setSelectedMood] = useState(5)
  const [selectedTags, setSelectedTags] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [view, setView] = useState('write') // 'write', 'calendar', 'analytics'
  const [isSaving, setIsSaving] = useState(false)

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '😍', '🥰', '🤗']
  const availableTags = ['happy', 'sad', 'anxious', 'excited', 'tired', 'energetic', 'productive', 'overwhelmed', 'grateful', 'frustrated', 'peaceful', 'motivated']

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return

    setIsSaving(true)
    
    // Simulate save delay
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        date: new Date(),
        text: currentEntry,
        mood: selectedMood,
        tags: selectedTags,
        type: 'text'
      }
      
      setEntries(prev => [newEntry, ...prev])
      setCurrentEntry('')
      setSelectedMood(5)
      setSelectedTags([])
      setIsSaving(false)
    }, 1000)
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement speech-to-text functionality
  }

  const getMoodColor = (mood) => {
    if (mood <= 3) return 'from-red-400 to-red-500'
    if (mood <= 6) return 'from-yellow-400 to-yellow-500'
    return 'from-green-400 to-green-500'
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Journaling</h1>
                  <p className="text-sm text-gray-500">Express your thoughts and feelings</p>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'write', label: 'Write', icon: PenTool },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {view === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How are you feeling today?</h2>
              
              {/* Mood Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Mood Rating</label>
                <div className="flex items-center space-x-2">
                  {moodEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMood(index + 1)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                        selectedMood === index + 1
                          ? 'ring-2 ring-purple-500 ring-offset-2 scale-110'
                          : 'hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {selectedMood}/10 - {moodEmojis[selectedMood - 1]}
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Your Entry</label>
                <textarea
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Voice Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Voice Entry</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={toggleRecording}
                    className={`flex items-center space-x-2 ${
                      isRecording 
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                        : ''
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </Button>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Recording...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveEntry}
                  disabled={!currentEntry.trim() || isSaving}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Entry</span>
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Journal Entries</h2>
              
              <div className="space-y-4">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getMoodColor(entry.mood)} flex items-center justify-center text-white text-sm font-bold`}>
                          {entry.mood}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.date.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl">{moodEmojis[entry.mood - 1]}</div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{entry.text}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mood Analytics</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Mood</h3>
                  <div className="text-3xl font-bold text-purple-600">
                    {(entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">out of 10</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Entries</h3>
                  <div className="text-3xl font-bold text-blue-600">{entries.length}</div>
                  <p className="text-sm text-gray-600">journal entries</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Streak</h3>
                  <div className="text-3xl font-bold text-green-600">7</div>
                  <p className="text-sm text-gray-600">days in a row</p>
                </div>
              </div>

              {/* Mood Chart Placeholder */}
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mood Trends</h3>
                <p className="text-gray-600">Visual mood tracking chart coming soon!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Journaling
