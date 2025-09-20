import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Heart, 
  Brain, 
  Tag, 
  Edit3, 
  Trash2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Lightbulb
} from 'lucide-react';

const JournalEntryDetail = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (entryId && user) {
      fetchEntryDetails();
    }
  }, [entryId, user]);

  const fetchEntryDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:8000/api/journal/entries/${entryId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEntry(data.entry);
          // Fetch analysis if available
          await fetchAnalysis(data.entry);
        } else {
          setError('Entry not found');
        }
      } else {
        setError('Failed to load entry');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      setError('Failed to load entry');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysis = async (entryData) => {
    try {
      setIsAnalyzing(true);
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:8000/api/ai/analyze-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          text: entryData.content, 
          tags: entryData.tags || [] 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.insights);
        }
      }
    } catch (error) {
      console.error('Error analyzing entry:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      calm: '😌',
      angry: '😠',
      excited: '🤩',
      tired: '😴',
      confused: '😕',
      neutral: '😐'
    };
    return icons[mood] || '😐';
  };

  const handleEdit = () => {
    navigate(`/journaling?edit=${entryId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:8000/api/journal/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        navigate('/journaling');
      } else {
        alert('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen wellness-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading journal entry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen wellness-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Entry Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This journal entry could not be found.'}</p>
            <Button onClick={() => navigate('/journaling')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wellness-bg">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/journaling')}
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex items-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Entry Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-wellness border border-emerald-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(entry.mood)}`}>
                    {getMoodIcon(entry.mood)} {entry.mood}
                  </span>
                  {entry.isVoice && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Voice Entry
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(entry.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-wellness border border-emerald-100"
            >
              <div className="flex items-center mb-4">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">AI Analysis</h3>
                {isAnalyzing && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>

              {analysis ? (
                <div className="space-y-4">
                  {/* Emotions */}
                  {analysis.emotions && analysis.emotions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        Emotions Detected
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.emotions.map((emotion, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm"
                          >
                            {emotion.name} ({emotion.intensity}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Themes */}
                  {analysis.themes && analysis.themes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Key Themes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.themes.map((theme, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {analysis.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Summary
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
                  )}

                  {/* Insights */}
                  {analysis.insights && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Insights
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {analysis.insights}
                      </p>
                    </div>
                  )}
                </div>
              ) : !isAnalyzing ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No analysis available</p>
                  <Button
                    onClick={() => fetchAnalysis(entry)}
                    className="mt-2 bg-purple-500 hover:bg-purple-600 text-white text-sm"
                  >
                    Analyze Entry
                  </Button>
                </div>
              ) : null}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entry Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-wellness border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Entry Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {new Date(entry.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Heart className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 capitalize">{entry.mood}</span>
                </div>

                {entry.isVoice && (
                  <div className="flex items-center text-sm">
                    <Tag className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Voice Entry</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-wellness border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <span className="text-sm font-medium text-gray-800">
                    {entry.content.split(' ').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Character Count</span>
                  <span className="text-sm font-medium text-gray-800">
                    {entry.content.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tags</span>
                  <span className="text-sm font-medium text-gray-800">
                    {entry.tags ? entry.tags.length : 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetail;
