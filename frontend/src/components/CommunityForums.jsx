import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import Navbar from './Navbar';
import { getApiBaseUrl } from '../utils/config';
import languageService from '../services/languageService.js';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  MapPin,
  ChevronLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CommunityForums = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [newForum, setNewForum] = useState({ name: '', description: '', category: 'general', region: 'global' });
  
  // Moderation state
  const [isModerating, setIsModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const [showModerationDetails, setShowModerationDetails] = useState(false);

  const fetchForums = useCallback(async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/community-forums/`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForums(data.forums || []);
      }
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Moderation functions
  const moderateContent = async (text) => {
    setIsModerating(true);
    setModerationResult(null);
    
    try {
      const authToken = await user.getIdToken();
      const result = await languageService.moderateContent(text, "en", authToken);
      setModerationResult(result);
      return result;
    } catch (error) {
      console.error('Moderation error:', error);
      setModerationResult({
        success: false,
        moderation: { approved: true, reason: 'Moderation unavailable' },
        error: error.message
      });
      return { success: false, moderation: { approved: true } };
    } finally {
      setIsModerating(false);
    }
  };

  const createForum = async () => {
    try {
      // Moderate forum content before creating
      const contentToModerate = `${newForum.name} ${newForum.description}`;
      const moderationResult = await moderateContent(contentToModerate);
      
      if (!moderationResult.success || !moderationResult.moderation.approved) {
        // Show moderation warning but allow user to proceed
        const shouldProceed = window.confirm(
          `Content moderation detected: ${moderationResult.moderation.reason}\n\nDo you want to proceed anyway?`
        );
        if (!shouldProceed) {
          return;
        }
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/community-forums/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newForum,
          moderationResult: moderationResult.moderation
        }),
      });

      if (response.ok) {
        await fetchForums();
        setShowCreateForum(false);
        setNewForum({ name: '', description: '', category: 'general', region: 'global' });
        setModerationResult(null);
      }
    } catch (error) {
      console.error('Error creating forum:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'No date';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-slate-100 text-slate-800',
      anxiety: 'bg-blue-100 text-blue-800',
      depression: 'bg-indigo-100 text-indigo-800',
      relationships: 'bg-pink-100 text-pink-800',
      academic: 'bg-green-100 text-green-800',
      family: 'bg-yellow-100 text-yellow-800',
      'self-care': 'bg-purple-100 text-purple-800',
      'crisis-support': 'bg-red-100 text-red-800',
    };
    return colors[category] || colors.general;
  };

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         forum.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || forum.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
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
          className="absolute top-20 left-20 text-blue-200"
        >
          <MessageSquare className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-32 text-indigo-200"
        >
          <Users className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 8, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-40 text-purple-200"
        >
          <Clock className="w-14 h-14" />
        </motion.div>
      </div>

      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Discover Forums</h2>
              <p className="text-blue-100 mt-1">Find communities that resonate with you</p>
            </div>
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search forums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="relationships">Relationships</option>
                  <option value="academic">Academic</option>
                  <option value="family">Family</option>
                  <option value="self-care">Self Care</option>
                  <option value="crisis-support">Crisis Support</option>
                </select>
                <Button
                  onClick={() => setShowCreateForum(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Forum
                </Button>
              </div>

              {/* Forums Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-3xl border border-slate-200/50 p-6 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded mb-4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : filteredForums.length > 0 ? (
                  filteredForums.map((forum) => (
                    <motion.div
                      key={forum._id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-3xl border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer shadow-lg"
                      onClick={() => {
                        navigate(`/community-forums/${forum._id}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{forum.name}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(forum.category)}`}>
                          {forum.category.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 mb-4 line-clamp-2">{forum.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{forum.stats?.postCount || 0} posts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(forum.stats?.lastActivity || forum.createdAt)}</span>
                          </div>
                        </div>
                        {forum.region !== 'global' && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{forum.region}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No forums found</h3>
                    <p className="text-slate-500 mb-6">Try adjusting your search or create a new forum</p>
                    <Button 
                      onClick={() => setShowCreateForum(true)} 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Forum
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Forum Modal */}
      {showCreateForum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Forum</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Forum Name</label>
                <input
                  type="text"
                  value={newForum.name}
                  onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter forum name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newForum.description}
                  onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows="3"
                  placeholder="Describe your forum"
                />
              </div>
              
              {/* Moderation Status */}
              {moderationResult && (
                <div className={`p-3 rounded-lg border ${
                  moderationResult.moderation.approved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {moderationResult.moderation.approved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      moderationResult.moderation.approved ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {moderationResult.moderation.approved ? 'Content Approved' : 'Content Review Required'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    moderationResult.moderation.approved ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {moderationResult.moderation.reason}
                  </p>
                  
                  {moderationResult.moderation.analysis && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowModerationDetails(!showModerationDetails)}
                        className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        {showModerationDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showModerationDetails ? 'Hide' : 'Show'} Details</span>
                      </button>
                      
                      {showModerationDetails && (
                        <div className="mt-2 p-2 bg-white rounded border text-xs">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Sentiment:</span> {moderationResult.moderation.analysis.sentiment?.label || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Confidence:</span> {Math.round((moderationResult.moderation.confidence || 0) * 100)}%
                            </div>
                            {moderationResult.moderation.analysis.crisisIndicators?.length > 0 && (
                              <div>
                                <span className="font-medium">Crisis Indicators:</span> {moderationResult.moderation.analysis.crisisIndicators.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Moderation Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => moderateContent(`${newForum.name} ${newForum.description}`)}
                  disabled={isModerating || (!newForum.name.trim() && !newForum.description.trim())}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isModerating ? 'Checking...' : 'Check Content'}</span>
                </button>
                
                {isModerating && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={newForum.category}
                  onChange={(e) => setNewForum({ ...newForum, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="general">General</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="relationships">Relationships</option>
                  <option value="academic">Academic</option>
                  <option value="family">Family</option>
                  <option value="self-care">Self Care</option>
                  <option value="crisis-support">Crisis Support</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForum(false);
                  setModerationResult(null);
                  setShowModerationDetails(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createForum}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Forum
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForums;