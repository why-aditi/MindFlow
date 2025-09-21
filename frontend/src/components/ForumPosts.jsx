import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import Navbar from './Navbar';
import { getApiBaseUrl } from '../utils/config';
import { 
  ArrowLeft,
  Plus,
  MessageCircle,
  Heart,
  Reply,
  Flag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ForumPosts = () => {
  const { user } = useAuth();
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [], isAnonymous: false });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState(null);
  
  // Reply-related state
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [newReply, setNewReply] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [isCreatingReply, setIsCreatingReply] = useState({});
  const [replyError, setReplyError] = useState({});

  const fetchForum = useCallback(async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/community-forums/${forumId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForum(data.forum);
      }
    } catch (error) {
      console.error('Error fetching forum:', error);
    } finally {
      setLoading(false);
    }
  }, [forumId, user]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/community-forums/${forumId}/posts`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [forumId, user]);

  const createPost = async () => {
    console.log('Create post button clicked');
    console.log('newPost:', newPost);
    console.log('forumId:', forumId);
    
    // Validate required fields
    if (!newPost.title.trim()) {
      setCreatePostError('Title is required');
      return;
    }
    
    if (!newPost.content.trim()) {
      setCreatePostError('Content is required');
      return;
    }
    
    if (!forumId) {
      setCreatePostError('No forum ID');
      return;
    }
    
    setIsCreatingPost(true);
    setCreatePostError(null);
    
    try {
      const idToken = await user.getIdToken();
      const postData = {
        ...newPost,
        forumId: forumId
      };
      
      console.log('postData being sent:', postData);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${getApiBaseUrl()}/community-forums/${forumId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        await fetchPosts();
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', tags: [], isAnonymous: false });
        setCreatePostError(null);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setCreatePostError(errorData.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.name === 'AbortError') {
        setCreatePostError('Request timed out. Please try again.');
      } else {
        setCreatePostError('Failed to create post. Please try again.');
      }
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Fetch replies for a specific post
  const fetchReplies = async (postId) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [postId]: true }));
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/community-forums/posts/${postId}/replies`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(prev => ({ ...prev, [postId]: data.replies || [] }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Toggle replies visibility
  const toggleReplies = (postId) => {
    setShowReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!replies[postId] && !showReplies[postId]) {
      fetchReplies(postId);
    }
  };

  // Toggle reply form visibility
  const toggleReplyForm = (postId) => {
    setShowReplyForm(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!showReplyForm[postId]) {
      setNewReply(prev => ({ ...prev, [postId]: { content: '', isAnonymous: false } }));
    }
  };

  // Create a reply
  const createReply = async (postId) => {
    const replyData = newReply[postId];
    
    if (!replyData || !replyData.content.trim()) {
      setReplyError(prev => ({ ...prev, [postId]: 'Reply content is required' }));
      return;
    }
    
    setIsCreatingReply(prev => ({ ...prev, [postId]: true }));
    setReplyError(prev => ({ ...prev, [postId]: null }));
    
    try {
      const idToken = await user.getIdToken();
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${getApiBaseUrl()}/community-forums/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        await fetchReplies(postId);
        setShowReplyForm(prev => ({ ...prev, [postId]: false }));
        setNewReply(prev => ({ ...prev, [postId]: { content: '', isAnonymous: false } }));
        setReplyError(prev => ({ ...prev, [postId]: null }));
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setReplyError(prev => ({ ...prev, [postId]: errorData.error || 'Failed to create reply' }));
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      if (error.name === 'AbortError') {
        setReplyError(prev => ({ ...prev, [postId]: 'Request timed out. Please try again.' }));
      } else {
        setReplyError(prev => ({ ...prev, [postId]: 'Failed to create reply. Please try again.' }));
      }
    } finally {
      setIsCreatingReply(prev => ({ ...prev, [postId]: false }));
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

  useEffect(() => {
    if (forumId) {
      fetchForum();
      fetchPosts();
    }
  }, [forumId, fetchForum, fetchPosts]);

  if (loading && !forum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Forum not found</h2>
          <Button onClick={() => navigate('/community-forums')}>
            Back to Forums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Forum Info and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/community-forums')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Forums</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{forum?.name || 'Loading...'}</h1>
                <p className="text-slate-600">{forum?.description || 'Loading forum details...'}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center overflow-hidden">
                      {post.userId?.picture ? (
                        <img 
                          src={post.userId.picture} 
                          alt={post.userId.username || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.type === 'crisis' ? 'bg-red-100 text-red-800' :
                          post.type === 'support' ? 'bg-blue-100 text-blue-800' :
                          post.type === 'celebration' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {post.type}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{post.title}</h3>
                        <p className="text-sm text-slate-500">
                          by {post.isAnonymous ? 'Anonymous' : post.userId?.username || `User ${post.authorId?.slice(-4) || 'Unknown'}`} • {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.type === 'crisis' ? 'bg-red-100 text-red-800' :
                        post.type === 'support' ? 'bg-blue-100 text-blue-800' :
                        post.type === 'celebration' ? 'bg-green-100 text-green-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {post.type}
                      </span>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Heart className="w-4 h-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={() => toggleReplyForm(post._id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Reply className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Flag className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 text-slate-700">
                    {post.content}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {showReplyForm[post._id] && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-3">
                        <textarea
                          value={newReply[post._id]?.content || ''}
                          onChange={(e) => setNewReply(prev => ({
                            ...prev,
                            [post._id]: { ...prev[post._id], content: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          rows="3"
                          placeholder="Write your reply..."
                          disabled={isCreatingReply[post._id]}
                        />
                        
                        {/* Reply Error Message */}
                        {replyError[post._id] && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{replyError[post._id]}</p>
                          </div>
                        )}
                        
                        {/* Reply Loading State */}
                        {isCreatingReply[post._id] && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <p className="text-blue-700 text-sm">Creating reply...</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`anonymous-${post._id}`}
                              checked={newReply[post._id]?.isAnonymous || false}
                              onChange={(e) => setNewReply(prev => ({
                                ...prev,
                                [post._id]: { ...prev[post._id], isAnonymous: e.target.checked }
                              }))}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              disabled={isCreatingReply[post._id]}
                            />
                            <label htmlFor={`anonymous-${post._id}`} className="text-sm text-slate-700">
                              Reply anonymously
                            </label>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toggleReplyForm(post._id);
                                setReplyError(prev => ({ ...prev, [post._id]: null }));
                              }}
                              disabled={isCreatingReply[post._id]}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => createReply(post._id)}
                              disabled={!newReply[post._id]?.content?.trim() || isCreatingReply[post._id]}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isCreatingReply[post._id] ? (
                                <div className="flex items-center space-x-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  <span>Replying...</span>
                                </div>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-1" />
                                  Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => toggleReplies(post._id)}
                      className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      {showReplies[post._id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>
                        {loadingReplies[post._id] ? 'Loading...' : 
                         replies[post._id]?.length > 0 ? 
                         `${replies[post._id].length} replies` : 
                         'Show replies'}
                      </span>
                    </button>

                    {showReplies[post._id] && (
                      <div className="mt-3 space-y-3">
                        {loadingReplies[post._id] ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                          </div>
                        ) : replies[post._id]?.length > 0 ? (
                          replies[post._id].map((reply) => (
                            <motion.div
                              key={reply._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="ml-6 p-3 bg-slate-50 rounded-lg border-l-2 border-emerald-200"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center overflow-hidden">
                                  {reply.userId?.picture ? (
                                    <img 
                                      src={reply.userId.picture} 
                                      alt={reply.userId.username || 'User'} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <MessageCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm font-medium text-slate-900">
                                      {reply.isAnonymous ? 'Anonymous' : reply.userId?.username || `User ${reply.authorId?.slice(-4) || 'Unknown'}`}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700">{reply.content}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <button className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700">
                                      <Heart className="w-3 h-3" />
                                      <span>{reply.engagement?.likes || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="ml-6 text-center py-4 text-slate-500 text-sm">
                            No replies yet. Be the first to reply!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
                <p className="text-slate-500 mb-4">Be the first to start a conversation</p>
                <Button onClick={() => setShowCreatePost(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows="6"
                  placeholder="Share your thoughts..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newPost.isAnonymous}
                  onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="anonymous" className="text-sm text-slate-700">
                  Post anonymously
                </label>
              </div>
            </div>
            
            {/* Processing Status */}
            {isCreatingPost && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="text-blue-800 font-medium">Creating your post...</p>
                    <p className="text-blue-600 text-sm">AI is reviewing content for safety</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {createPostError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{createPostError}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreatePost(false);
                  setCreatePostError(null);
                }}
                disabled={isCreatingPost}
              >
                Cancel
              </Button>
              <Button
                onClick={createPost}
                disabled={!newPost.title.trim() || !newPost.content.trim() || isCreatingPost}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreatingPost ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Post...</span>
                  </div>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPosts;
