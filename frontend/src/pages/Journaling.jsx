import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { 
  Mic, MicOff, Save, Calendar, BarChart3, PenTool, Cloud, Leaf, Sparkles,
  Brain, Target, BookOpen, TrendingUp, Heart, Eye, EyeOff, Clock, BarChart, PieChart,
  Plus, Minus, ChevronRight, ChevronLeft, Zap, Star, Lightbulb
} from 'lucide-react'

const Journaling = () => {
  const { user } = useAuth()
  
  // Core journal state
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [view, setView] = useState('write')
  const [isSaving, setIsSaving] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [journalEntries] = useState({})
  
  // Theme and UI state
  const [selectedFramework, setSelectedFramework] = useState(null)
  
  // AI features state
  const [aiInsights, setAiInsights] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Visual highlights state
  const [showVisualHighlights] = useState(true)

  // Constants
  const availableTags = ['happy', 'sad', 'anxious', 'excited', 'tired', 'energetic', 'productive', 'overwhelmed', 'grateful', 'frustrated', 'peaceful', 'motivated']
  
  // Framework templates
  const frameworks = {
    ikigai: {
      name: 'Ikigai',
      icon: Target,
      description: 'Find your purpose through four key questions',
      color: 'from-purple-500 to-pink-500',
      prompts: [
        'What do you love doing?',
        'What are you good at?',
        'What does the world need?',
        'What can you be paid for?'
      ]
    },
    firstPrinciples: {
      name: 'First Principles',
      icon: Brain,
      description: 'Break down complex problems to their fundamentals',
      color: 'from-blue-500 to-cyan-500',
      prompts: [
        'What is the core problem you\'re facing?',
        'What are the fundamental truths about this situation?',
        'What assumptions are you making?',
        'How can you solve this from first principles?'
      ]
    },
    dailyReview: {
      name: 'Daily Review',
      icon: BookOpen,
      description: 'Reflect on your day with structured questions',
      color: 'from-emerald-500 to-teal-500',
      prompts: [
        'What went well today?',
        'What could have gone better?',
        'What did you learn today?',
        'What will you do differently tomorrow?'
      ]
    }
  }

  const fetchEntries = useCallback(async () => {
    try {
      if (!user) {
        console.warn('User not authenticated, cannot fetch entries')
        setEntries([])
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/journal/entries', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setEntries([])
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setEntries(data.entries || [])
      } else {
        console.error('Failed to fetch entries:', data.error)
        setEntries([])
      }
    } catch (error) {
      console.error('Error fetching entries:', error.message)
      setEntries([])
    }
  }, [user])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return

    setIsSaving(true)
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/journal/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          text: currentEntry,
          tags: selectedTags,
          type: 'text'
        })
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setIsSaving(false)
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setEntries(prev => [data.entry, ...prev])
        setCurrentEntry('')
        setSelectedTags([])
      } else {
        console.error('Failed to save entry:', data.error)
      }
    } catch (error) {
      console.error('Error saving entry:', error.message)
    } finally {
      setIsSaving(false)
    }
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
  }
  
  // AI Analysis Functions
  const analyzeEntry = async (entryText) => {
    setIsAnalyzing(true)
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('http://localhost:5000/api/ai/analyze-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ text: entryText })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.insights)
      }
    } catch (error) {
      console.error('Error analyzing entry:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]
  }

  const hasJournalEntry = (date) => {
    const dateKey = formatDateKey(date)
    return journalEntries[dateKey] || false
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-emerald-300"
        >
          <Cloud className="w-20 h-20" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-32 text-violet-300"
        >
          <Leaf className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -8, 0],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-32 text-blue-300"
        >
          <Sparkles className="w-18 h-18" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <PenTool className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Mindful Journal</h1>
                  <p className="text-sm text-slate-500">Express your thoughts and feelings</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl p-1">
              {[
                { id: 'write', label: 'Write', icon: PenTool },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'insights', label: 'Insights', icon: Brain }
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    view === id 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {React.createElement(icon, { className: "w-4 h-4" })}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {view === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 xl:grid-cols-4 gap-8"
            >
              {/* Main Writing Area */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">How are you feeling today?</h2>
                    <p className="text-emerald-100 mt-1">Take a moment to reflect and express yourself</p>
                  </div>

                  <div className="p-8 space-y-8">

                    {/* Framework Templates */}
                    <div>
                      <label className="block text-lg font-semibold text-slate-800 mb-4">Framework Templates</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(frameworks).map(([key, framework]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedFramework(selectedFramework === key ? null : key)}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                              selectedFramework === key
                                ? 'border-emerald-300 bg-emerald-50 shadow-lg'
                                : 'border-slate-200 hover:border-emerald-200 hover:shadow-md bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${framework.color} flex items-center justify-center`}>
                                <framework.icon className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="font-bold text-slate-800">{framework.name}</h3>
                            </div>
                            <p className="text-sm text-slate-600">{framework.description}</p>
                            {selectedFramework === key && (
                              <ChevronRight className="w-5 h-5 text-emerald-600 absolute top-4 right-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Framework Prompts */}
                    {selectedFramework && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl p-6 border border-slate-200"
                      >
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                          {frameworks[selectedFramework].name} Prompts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {frameworks[selectedFramework].prompts.map((prompt, index) => (
                            <div key={index} className="p-4 rounded-xl bg-white border border-slate-200">
                              <p className="text-sm text-slate-700 font-medium">{prompt}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Tags */}
                    <div>
                      <label className="block text-lg font-semibold text-slate-800 mb-4">Tags</label>
                      <div className="flex flex-wrap gap-3">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedTags.includes(tag)
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Writing Area */}
                    <div>
                      <label className="block text-lg font-semibold text-slate-800 mb-4">Your Entry</label>
                      <div className="relative">
                        <textarea
                          value={currentEntry}
                          onChange={(e) => setCurrentEntry(e.target.value)}
                          placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
                          className="w-full h-80 px-6 py-4 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 bg-slate-50 text-slate-900 placeholder-slate-500 text-base leading-relaxed"
                        />
                        {showVisualHighlights && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                              AI Analysis Available
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Voice Input */}
                    <div>
                      <label className="block text-lg font-semibold text-slate-800 mb-4">Voice Entry</label>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={toggleRecording}
                          className={`flex items-center space-x-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                            isRecording 
                              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                              : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          <span className="font-medium">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                        </Button>
                        
                        {isRecording && (
                          <div className="flex items-center space-x-3 text-red-500">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Recording...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                      <Button
                        onClick={() => analyzeEntry(currentEntry)}
                        disabled={!currentEntry.trim() || isAnalyzing}
                        variant="outline"
                        className="flex items-center space-x-3 px-6 py-3 rounded-xl border-2 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-medium"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            <span>Analyze Entry</span>
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleSaveEntry}
                        disabled={!currentEntry.trim() || isSaving}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isSaving ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <Save className="w-5 h-5" />
                            <span>Save Entry</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights Sidebar */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden sticky top-24">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      AI Insights
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    {aiInsights ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-emerald-600" />
                            Emotion Analysis
                          </h4>
                          <div className="space-y-3">
                            {aiInsights.emotions?.map((emotion, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">{emotion.name}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 h-2 bg-slate-200 rounded-full">
                                    <div 
                                      className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" 
                                      style={{ width: `${emotion.intensity}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">{emotion.intensity}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <Star className="w-4 h-4 mr-2 text-blue-600" />
                            Key Themes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.themes?.map((theme, index) => (
                              <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                            Summary
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiInsights.summary}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-slate-600 text-sm font-medium">
                          Write an entry and click "Analyze Entry" to get AI insights
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Journal Entries</h2>
                    <p className="text-blue-100 mt-1">Track your daily reflections</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setView('write')}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Write Entry
                  </Button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-slate-50 rounded-2xl p-6">
                  {/* Calendar Header */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-3 hover:bg-white rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    
                    <h3 className="text-2xl font-bold text-slate-800">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-3 hover:bg-white rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-600" />
                    </button>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-bold text-slate-600 py-3">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentDate).map((day, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200 cursor-pointer relative
                          ${day 
                            ? hasJournalEntry(day)
                              ? 'bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200'
                              : 'text-slate-600 hover:bg-white hover:text-slate-800'
                            : ''
                          }
                          ${day && day.toDateString() === new Date().toDateString() 
                            ? 'ring-2 ring-emerald-400 bg-emerald-50' 
                            : ''
                          }
                        `}
                        onClick={() => day && setView('write')}
                      >
                        {day ? day.getDate() : ''}
                        {day && hasJournalEntry(day) && (
                          <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -bottom-1"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center mt-8 space-x-8 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-100 rounded"></div>
                      <span className="text-slate-600 font-medium">Journal Entry</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-50 ring-2 ring-emerald-400 rounded"></div>
                      <span className="text-slate-600 font-medium">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">AI Insights & Patterns</h2>
                <p className="text-purple-100 mt-1">Discover patterns in your thoughts and emotions</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Emotion Trends */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-3 text-emerald-600" />
                      Emotion Trends
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Happiness</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-3 bg-slate-200 rounded-full">
                            <div className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          <span className="text-sm font-bold text-slate-600">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Anxiety</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-3 bg-slate-200 rounded-full">
                            <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <span className="text-sm font-bold text-slate-600">30%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Motivation</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-3 bg-slate-200 rounded-full">
                            <div className="h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="text-sm font-bold text-slate-600">60%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Writing Patterns */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <BarChart className="w-6 h-6 mr-3 text-blue-600" />
                      Writing Patterns
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Most Active Day</span>
                        <span className="text-sm font-bold text-slate-800">Tuesday</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Average Entry Length</span>
                        <span className="text-sm font-bold text-slate-800">247 words</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Most Used Tags</span>
                        <div className="flex space-x-2">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">grateful</span>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">productive</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Growth */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <Heart className="w-6 h-6 mr-3 text-purple-600" />
                      Personal Growth
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Positive Trend</p>
                          <p className="text-xs text-slate-600">Your mood has improved 15% this month</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Self-Care Focus</p>
                          <p className="text-xs text-slate-600">You've been prioritizing wellness</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <Lightbulb className="w-6 h-6 mr-3 text-yellow-600" />
                      AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-white border border-yellow-200">
                        <p className="text-sm text-slate-700 font-medium">
                          Consider trying the Ikigai framework to explore your purpose
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-yellow-200">
                        <p className="text-sm text-slate-700 font-medium">
                          Your gratitude practice is showing positive results
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-yellow-200">
                        <p className="text-sm text-slate-700 font-medium">
                          Try journaling in the morning for better mood throughout the day
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Mood Analytics</h2>
                <p className="text-indigo-100 mt-1">Track your emotional journey over time</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Average Mood</h3>
                    <div className="text-4xl font-bold text-emerald-600">
                      {entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1) : '0.0'}
                    </div>
                    <p className="text-sm text-slate-600 font-medium">out of 10</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Total Entries</h3>
                    <div className="text-4xl font-bold text-blue-600">{entries.length}</div>
                    <p className="text-sm text-slate-600 font-medium">journal entries</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Streak</h3>
                    <div className="text-4xl font-bold text-purple-600">7</div>
                    <p className="text-sm text-slate-600 font-medium">days in a row</p>
                  </div>
                </div>

                {/* Mood Chart Placeholder */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 text-center border border-slate-200">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Mood Trends</h3>
                  <p className="text-slate-600 font-medium">Visual mood tracking chart coming soon!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Journaling