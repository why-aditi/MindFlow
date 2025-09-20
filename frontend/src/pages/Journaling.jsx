import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import Navbar from '../components/Navbar'
import { getApiBaseUrl } from '../utils/config'
import { 
  Mic, MicOff, Save, Calendar, BarChart3, PenTool, Cloud, Leaf, Sparkles,
  Brain, Target, BookOpen, TrendingUp, Heart, Eye, EyeOff, Clock, BarChart, PieChart,
  Plus, Minus, ChevronRight, ChevronLeft, Zap, Star, Lightbulb,
  CheckCircle, AlertCircle
} from 'lucide-react'

const Journaling = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Core journal state
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)
  const interimRef = useRef("")
  const [view, setView] = useState('write')
  const [isSaving, setIsSaving] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [journalEntries, setJournalEntries] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDateEntries, setSelectedDateEntries] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Voice journaling state
  const [recordingStatus, setRecordingStatus] = useState('')

  // Theme and UI state
  const [selectedFramework, setSelectedFramework] = useState(null)
  
  // AI features state
  const [aiInsights, setAiInsights] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Analytics state - used in JSX conditional rendering
  const [analyticsData, setAnalyticsData] = useState({
    moodTrends: [],
    writingPatterns: {},
    personalGrowth: {},
    insights: []
  })
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  
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
        setJournalEntries({})
        return
      }

      const idToken = await user.getIdToken()
      const response = await fetch(`${getApiBaseUrl()}/journal/entries`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setEntries([])
        setJournalEntries({})
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setEntries(data.entries || [])
        
        // Organize entries by date for calendar
        const entriesByDate = {}
        data.entries.forEach(entry => {
          const dateKey = formatDateKey(new Date(entry.createdAt))
          if (!entriesByDate[dateKey]) {
            entriesByDate[dateKey] = []
          }
          entriesByDate[dateKey].push(entry)
        })
        setJournalEntries(entriesByDate)
      } else {
        console.error('Failed to fetch entries:', data.error)
        setEntries([])
        setJournalEntries({})
      }
    } catch (error) {
      console.error('Error fetching entries:', error.message)
      setEntries([])
      setJournalEntries({})
    }
  }, [user])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Handle edit mode when navigating from detail page
  useEffect(() => {
    if (location.state?.editEntry) {
      const { editEntry } = location.state
      setEditingEntry(editEntry)
      setCurrentEntry(editEntry.content)
      setSelectedTags(editEntry.tags || [])
      setView('write')
      
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} })
      
      // Scroll to editor
      setTimeout(() => {
        const editorElement = document.querySelector('textarea')
        if (editorElement) {
          editorElement.focus()
          editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [location.state, navigate, location.pathname])

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return

    setIsSaving(true)
    
    try {
      const idToken = await user.getIdToken()
      
      // Determine if we're creating or updating
      const isUpdate = editingEntry !== null
      const url = isUpdate 
        ? `${getApiBaseUrl()}/journal/entries/${editingEntry.id}`
        : `${getApiBaseUrl()}/journal/entries`
      
      const method = isUpdate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          content: currentEntry,
          tags: selectedTags,
          isVoice: false,
          ...(isUpdate && { mood: editingEntry.mood }) // Preserve mood for updates
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
        if (isUpdate) {
          // Update existing entry in the list
          setEntries(prev => prev.map(entry => 
            entry._id === editingEntry.id 
              ? { ...entry, content: currentEntry, tags: selectedTags, updatedAt: new Date().toISOString() }
              : entry
          ))
          setEditingEntry(null)
        } else {
          // Add new entry
          const newEntry = {
            _id: data.entryId,
            content: currentEntry,
            tags: selectedTags,
            mood: data.detectedMood || 'neutral',
            isVoice: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setEntries(prev => [newEntry, ...prev])
        }
        
        setCurrentEntry('')
        setSelectedTags([])
        await fetchEntries() // Refresh entries to get updated data
      } else {
        console.error(`Failed to ${isUpdate ? 'update' : 'save'} entry:`, data.error)
        alert(`Failed to ${isUpdate ? 'update' : 'save'} entry. Please try again.`)
      }
    } catch (error) {
      console.error(`Error ${editingEntry ? 'updating' : 'saving'} entry:`, error.message)
      alert(`Failed to ${editingEntry ? 'update' : 'save'} entry. Please try again.`)
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
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.warn('Speech Recognition API not supported')
        setRecordingStatus('Speech Recognition not supported in this browser')
        return
      }
      
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = true
        recognition.continuous = true
        
        recognition.onresult = (event) => {
          let interimTranscript = ''
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0]?.transcript || ''
            
            if (result.isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          // Update the current entry with final results
          if (finalTranscript.trim()) {
            setCurrentEntry(prev => (prev ? prev + ' ' : '') + finalTranscript.trim())
            // Clear interim results when we have final results
            interimRef.current = ''
          }
          
          // Show interim results in real-time (only if no final results)
          if (interimTranscript.trim() && !finalTranscript.trim()) {
            interimRef.current = interimTranscript
          }
        }
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          setRecordingStatus(`Error: ${event.error}`)
        }
        
        recognition.onend = () => {
          interimRef.current = ''
          setIsRecording(false)
          setRecordingStatus('')
        }
        
        recognitionRef.current = recognition
      }
      
      if (isRecording) {
        recognitionRef.current.stop()
        setIsRecording(false)
        setRecordingStatus('')
      } else {
        recognitionRef.current.start()
        setIsRecording(true)
        setRecordingStatus('Listening...')
      }
    } catch (e) {
      console.error('Voice recording error:', e)
      setIsRecording(false)
      setRecordingStatus('Error starting voice recognition')
    }
  }
  
  // AI Analysis Functions
  const analyzeEntry = async (entryText) => {
    setIsAnalyzing(true)
    try {
      const idToken = await user.getIdToken()
      const response = await fetch(`${getApiBaseUrl()}/ai/analyze-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ text: entryText, tags: selectedTags })
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

  // Analytics calculation functions
  const calculateAnalytics = useCallback(() => {
    if (entries.length === 0) return
    
    setIsLoadingAnalytics(true)
    
    // Calculate mood trends based on tags -> sentiment score
    const sentimentWeights = {
      happy: 1,
      excited: 0.8,
      grateful: 0.7,
      peaceful: 0.6,
      motivated: 0.6,
      productive: 0.5,
      energetic: 0.5,
      neutral: 0,
      tired: -0.3,
      anxious: -0.7,
      sad: -0.8,
      frustrated: -0.6,
      overwhelmed: -0.7
    }

    const scoreEntry = (entry) => {
      if (!entry.tags || entry.tags.length === 0) return 0
      const sum = entry.tags.reduce((s, t) => s + (sentimentWeights[t] || 0), 0)
      return sum / entry.tags.length
    }

    const moodTrends = entries
      .map(entry => ({
        date: new Date(entry.createdAt),
        score: scoreEntry(entry),
        day: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short' })
      }))
      .sort((a, b) => a.date - b.date)
    
    // Calculate writing patterns
    const writingPatterns = {
      totalEntries: entries.length,
      totalWords: entries.reduce((sum, entry) => sum + (entry.text?.split(' ').length || 0), 0),
      averageWordsPerEntry: entries.length > 0 ? 
        Math.round(entries.reduce((sum, entry) => sum + (entry.content?.split(' ').length || 0), 0) / entries.length) : 0,
      longestEntry: entries.reduce((longest, entry) => 
        (entry.content?.length || 0) > (longest?.content?.length || 0) ? entry : longest, entries[0] || {}),
      writingFrequency: calculateWritingFrequency(entries),
      mostUsedTags: calculateMostUsedTags(entries),
      writingStreak: calculateWritingStreak(entries)
    }
    
    // Calculate personal growth metrics
    const personalGrowth = {
      emotionalRange: calculateEmotionalRange(entries),
      topicDiversity: calculateTopicDiversity(entries),
      reflectionDepth: calculateReflectionDepth(entries),
      positiveGrowth: calculatePositiveGrowth(entries)
    }
    
    // Generate insights
    const insights = generateInsights(writingPatterns, personalGrowth)
    
    setAnalyticsData({
      moodTrends,
      writingPatterns,
      personalGrowth,
      insights
    })
    
    setIsLoadingAnalytics(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])
  
  // Calculate analytics whenever entries change
  useEffect(() => {
    calculateAnalytics()
  }, [calculateAnalytics])
  
  // Helper functions for analytics
  const calculateWritingFrequency = (entries) => {
    const last30Days = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return entryDate >= thirtyDaysAgo
    })
    
    return {
      last30Days: last30Days.length,
      weeklyAverage: Math.round(last30Days.length / 4.3),
      mostActiveDay: getMostActiveDay(entries)
    }
  }
  
  const calculateMostUsedTags = (entries) => {
    const tagCounts = {}
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))
  }
  
  const calculateWritingStreak = (entries) => {
    if (entries.length === 0) return 0
    
    const sortedEntries = entries
      .map(entry => new Date(entry.createdAt))
      .sort((a, b) => b - a)
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i])
      entryDate.setHours(0, 0, 0, 0)
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break
      }
    }
    
    return streak
  }
  
  const calculateEmotionalRange = (entries) => {
    const emotions = entries
      .filter(entry => entry.tags)
      .flatMap(entry => entry.tags)
      .filter(tag => ['happy', 'sad', 'anxious', 'excited', 'frustrated', 'peaceful'].includes(tag))
    
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})
    
    return {
      mostCommon: Object.entries(emotionCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral',
      diversity: Object.keys(emotionCounts).length,
      positiveRatio: calculatePositiveRatio(emotionCounts)
    }
  }
  
  const calculateTopicDiversity = (entries) => {
    const allTags = entries
      .filter(entry => entry.tags)
      .flatMap(entry => entry.tags)
    
    const uniqueTags = new Set(allTags)
    return {
      totalTags: uniqueTags.size,
      averageTagsPerEntry: entries.length > 0 ? 
        Math.round(allTags.length / entries.length * 10) / 10 : 0
    }
  }
  
  const calculateReflectionDepth = (entries) => {
    const avgLength = entries.length > 0 ? entries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / entries.length : 0
    return {
      averageLength: Math.round(avgLength),
      depthLevel: avgLength > 500 ? 'Deep' : avgLength > 200 ? 'Moderate' : 'Brief',
      longestReflection: entries.reduce((longest, entry) => 
        (entry.content?.length || 0) > (longest?.content?.length || 0) ? entry : longest, entries[0] || {})
    }
  }
  
  const calculatePositiveGrowth = (entries) => {
    const positiveTags = ['happy', 'excited', 'grateful', 'peaceful', 'motivated']
    const negativeTags = ['sad', 'anxious', 'frustrated', 'overwhelmed']
    
    let positiveCount = 0
    let negativeCount = 0
    
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          if (positiveTags.includes(tag)) positiveCount++
          if (negativeTags.includes(tag)) negativeCount++
        })
      }
    })
    
    return {
      positiveRatio: positiveCount + negativeCount > 0 ? 
        Math.round((positiveCount / (positiveCount + negativeCount)) * 100) : 50,
      trend: calculateTrend(entries, positiveTags)
    }
  }
  
  const calculatePositiveRatio = (emotionCounts) => {
    const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'motivated']
    const negativeEmotions = ['sad', 'anxious', 'frustrated', 'overwhelmed']
    
    const positiveCount = positiveEmotions.reduce((sum, emotion) => sum + (emotionCounts[emotion] || 0), 0)
    const negativeCount = negativeEmotions.reduce((sum, emotion) => sum + (emotionCounts[emotion] || 0), 0)
    
    return positiveCount + negativeCount > 0 ? 
      Math.round((positiveCount / (positiveCount + negativeCount)) * 100) : 50
  }
  
  const calculateTrend = (entries, positiveTags) => {
    if (entries.length < 2) return 'stable'
    
    const recentEntries = entries.slice(0, Math.min(7, entries.length))
    const olderEntries = entries.slice(Math.min(7, entries.length), Math.min(14, entries.length))
    
    const recentPositive = recentEntries.reduce((count, entry) => 
      count + (entry.tags?.filter(tag => positiveTags.includes(tag)).length || 0), 0)
    const olderPositive = olderEntries.reduce((count, entry) => 
      count + (entry.tags?.filter(tag => positiveTags.includes(tag)).length || 0), 0)
    
    if (recentPositive > olderPositive) return 'improving'
    if (recentPositive < olderPositive) return 'declining'
    return 'stable'
  }
  
  const getMostActiveDay = (entries) => {
    const dayCounts = {}
    entries.forEach(entry => {
      const day = new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    
    return Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Monday'
  }
  
  const generateInsights = (writingPatterns, personalGrowth) => {
    const insights = []
    
    // Writing frequency insights
    if (writingPatterns.writingStreak > 0) {
      insights.push({
        type: 'achievement',
        title: 'Writing Streak',
        description: `You've been journaling for ${writingPatterns.writingStreak} days in a row!`,
        icon: '🔥'
      })
    }
    
    // Emotional insights
    if (personalGrowth.emotionalRange.diversity > 3) {
      insights.push({
        type: 'growth',
        title: 'Emotional Awareness',
        description: `You express ${personalGrowth.emotionalRange.diversity} different emotions regularly`,
        icon: '💭'
      })
    }
    
    // Writing depth insights
    if (personalGrowth.reflectionDepth.depthLevel === 'Deep') {
      insights.push({
        type: 'depth',
        title: 'Deep Reflection',
        description: 'Your entries show thoughtful self-reflection',
        icon: '🔍'
      })
    }
    
    // Positive growth insights
    if (personalGrowth.positiveGrowth.trend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Positive Trend',
        description: 'Your emotional well-being is trending upward',
        icon: '📈'
      })
    }
    
    return insights
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
    // Use local date instead of UTC to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const hasJournalEntry = (date) => {
    const dateKey = formatDateKey(date)
    return journalEntries[dateKey] && journalEntries[dateKey].length > 0
  }

  const getJournalEntriesForDate = (date) => {
    const dateKey = formatDateKey(date)
    return journalEntries[dateKey] || []
  }

  const getMoodForDate = (date) => {
    const entries = getJournalEntriesForDate(date)
    if (entries.length === 0) return null
    
    // Get the most recent entry's mood
    const latestEntry = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    return latestEntry.mood
  }

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      anxious: 'bg-red-100 text-red-800 border-red-200',
      calm: 'bg-green-100 text-green-800 border-green-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      excited: 'bg-purple-100 text-purple-800 border-purple-200',
      tired: 'bg-gray-100 text-gray-800 border-gray-200',
      confused: 'bg-orange-100 text-orange-800 border-orange-200',
      neutral: 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[mood] || colors.neutral
  }

  const handleDateClick = (date) => {
    if (!date) return
    
    const entriesForDate = getJournalEntriesForDate(date)
    setSelectedDate(date)
    setSelectedDateEntries(entriesForDate)
    setIsModalOpen(true)
  }

  const handleEntryClick = (entry) => {
    navigate(`/journal-entry/${entry._id}`)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
    setSelectedDateEntries([])
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
      <Navbar />

      {/* Page Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-center">
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
      </div>

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
                  value={currentEntry + (interimRef.current ? ' ' + interimRef.current : '')}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
                          className={`w-full h-80 px-6 py-4 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 text-slate-900 placeholder-slate-500 text-base leading-relaxed transition-all duration-200 ${
                            isRecording 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        />
                        {isRecording && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center space-x-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>Voice Input Active</span>
                            </div>
                          </div>
                        )}
                        {showVisualHighlights && !isRecording && (
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
                      <label className="block text-lg font-semibold text-slate-800 mb-4">Voice to Text</label>
                      <p className="text-sm text-slate-600 mb-4">Speak naturally and your words will appear in the text area above</p>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={toggleRecording}
                    disabled={false}
                          className={`flex items-center space-x-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                              : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          <span className="font-medium">{isRecording ? 'Stop Listening' : 'Start Voice Input'}</span>
                  </Button>
                  
                  {isRecording && (
                          <div className="flex items-center space-x-3 text-red-500">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Listening...</span>
                    </div>
                  )}

                  {recordingStatus && !isRecording && (
                    <div className={`flex items-center space-x-3 ${
                      recordingStatus.includes('Error') ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {recordingStatus.includes('Error') ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{recordingStatus}</span>
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
                      <span>{editingEntry ? 'Updating...' : 'Saving...'}</span>
                    </div>
                  ) : (
                          <div className="flex items-center space-x-3">
                            <Save className="w-5 h-5" />
                      <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
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
                          aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200 cursor-pointer relative border-2
                        ${day 
                          ? hasJournalEntry(day)
                              ? `${getMoodColor(getMoodForDate(day))} font-bold hover:opacity-80`
                              : 'text-slate-600 hover:bg-white hover:text-slate-800 border-transparent'
                          : 'border-transparent'
                        }
                        ${day && day.toDateString() === new Date().toDateString() 
                            ? 'ring-2 ring-emerald-400 ring-offset-2' 
                          : ''
                        }
                      `}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day ? day.getDate() : ''}
                      {day && hasJournalEntry(day) && (
                          <div className="absolute w-2 h-2 bg-current rounded-full -bottom-1"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                  <div className="mt-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-slate-100 border-2 border-slate-200 rounded"></div>
                          <span className="text-slate-600 font-medium">Journal Entry</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-8">
                          <div className="w-4 h-4 bg-slate-50 ring-2 ring-emerald-400 rounded"></div>
                          <span className="text-slate-600 font-medium">Today</span>
                        </div>
                    </div>
                    
                    {/* Mood Legend */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {['happy', 'sad', 'anxious', 'calm', 'angry', 'excited', 'tired', 'confused', 'neutral'].map(mood => (
                        <div key={mood} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded border ${getMoodColor(mood).split(' ')[0]} ${getMoodColor(mood).split(' ')[2]}`}></div>
                          <span className="text-slate-600 capitalize">{mood}</span>
                        </div>
                      ))}
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
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-slate-600">Analyzing your journal...</span>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No entries yet</h3>
                    <p className="text-slate-500">Start journaling to see your insights and patterns</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Emotion Trends */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-3 text-emerald-600" />
                      Emotion Trends
                    </h3>
                    <div className="space-y-4">
                      {calculateMostUsedTags(entries).map((t) => (
                        <div key={t.tag} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 capitalize">{t.tag}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-3 bg-slate-200 rounded-full">
                              <div className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${Math.min(100, t.count * 20)}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-slate-600">{Math.min(100, t.count * 20)}%</span>
                          </div>
                        </div>
                      ))}
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
                        <span className="text-sm font-bold text-slate-800">{analyticsData.writingPatterns?.writingFrequency?.mostActiveDay || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Average Entry Length</span>
                        <span className="text-sm font-bold text-slate-800">{analyticsData.writingPatterns?.averageWordsPerEntry || 0} words</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Most Used Tags</span>
                        <div className="flex space-x-2">
                          {analyticsData.writingPatterns?.mostUsedTags?.map((t) => (
                            <span key={t.tag} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{t.tag}</span>
                          ))}
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
                )}
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
                      {entries.length > 0 ? ((analyticsData.personalGrowth?.positiveGrowth?.positiveRatio || 50) / 10).toFixed(1) : '0.0'}
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
                    <div className="text-4xl font-bold text-purple-600">{analyticsData.writingPatterns?.writingStreak || 0}</div>
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

      {/* Journal Entries Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    {selectedDateEntries.length} journal {selectedDateEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedDateEntries.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEntries.map((entry, index) => (
                    <motion.div
                      key={entry._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.mood === 'happy' ? 'bg-yellow-100 text-yellow-800' :
                            entry.mood === 'sad' ? 'bg-blue-100 text-blue-800' :
                            entry.mood === 'anxious' ? 'bg-red-100 text-red-800' :
                            entry.mood === 'calm' ? 'bg-green-100 text-green-800' :
                            entry.mood === 'angry' ? 'bg-red-100 text-red-800' :
                            entry.mood === 'excited' ? 'bg-purple-100 text-purple-800' :
                            entry.mood === 'tired' ? 'bg-gray-100 text-gray-800' :
                            entry.mood === 'confused' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.mood}
                          </span>
                          {entry.isVoice && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Voice
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(entry.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed line-clamp-3">{entry.content}</p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-slate-500">
                        Click to open →
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No journal entries</h3>
                  <p className="text-slate-500 mb-6">No journal entries were saved on this date.</p>
                  <Button
                    onClick={() => {
                      setView('write')
                      closeModal()
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Write Entry
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}

export default Journaling