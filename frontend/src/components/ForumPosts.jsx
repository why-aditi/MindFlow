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
  MessageSquare
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
      console.error('Title is required');
      return;
    }
    
    if (!newPost.content.trim()) {
      console.error('Content is required');
      return;
    }
    
    if (!forumId) {
      console.error('No forum ID');
      return;
    }
    
    try {
      const idToken = await user.getIdToken();
      const postData = {
        ...newPost,
        forumId: forumId
      };
      
      console.log('postData being sent:', postData);
      
      const response = await fetch(`${getApiBaseUrl()}/community-forums/${forumId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        await fetchPosts();
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', tags: [], isAnonymous: false });
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error creating post:', error);
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
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
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
                          by {post.isAnonymous ? 'Anonymous' : post.userId?.username || 'Unknown'} • {formatDate(post.createdAt)}
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
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
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
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreatePost(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createPost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPosts;
