import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { getApiBaseUrl } from '../utils/config';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Archive,
  AlertTriangle
} from 'lucide-react';

const ChatSidebar = ({ 
  isOpen, 
  onToggle, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/ai/chat-sessions`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(data.error || 'Failed to load sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCloseSession = async (sessionId) => {
    if (!user) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/ai/conversations/${sessionId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        // Refresh sessions list
        await fetchSessions();
        // If this was the current session, start a new chat
        if (sessionId === currentSessionId) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error('Error closing session:', err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/ai/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        // Remove from local state immediately for better UX
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // If this was the current session, start a new chat
        if (sessionId === currentSessionId) {
          onNewChat();
        }
        
        // Close confirmation dialog
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete session');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          width: isOpen ? '320px' : '0px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md border-r border-emerald-100 z-50 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-700">Chat History</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="w-8 h-8 hover:bg-emerald-50 text-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="w-8 h-8 hover:bg-emerald-50 text-slate-600 lg:hidden"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  onClick={fetchSessions}
                  className="mt-2 text-emerald-600 hover:text-emerald-700"
                >
                  Try Again
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">No chat history yet</p>
                <p className="text-slate-400 text-xs mt-1">Start a new conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      session.id === currentSessionId
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-700 truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {session.preview}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center text-xs text-slate-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(session.lastActivity)}
                          </div>
                          <div className="text-xs text-slate-400">
                            {session.messageCount} messages
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseSession(session.id);
                          }}
                          className="w-6 h-6 hover:bg-blue-50 text-blue-500 hover:text-blue-600"
                          title="Archive session"
                        >
                          <Archive className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(session);
                          }}
                          className="w-6 h-6 hover:bg-red-50 text-red-500 hover:text-red-600"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                      session.status === 'active' 
                        ? 'bg-green-400' 
                        : session.status === 'completed'
                        ? 'bg-blue-400'
                        : 'bg-gray-400'
                    }`} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-emerald-100">
            <div className="text-xs text-slate-400 text-center">
              <p>Your conversations are private and secure</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Chat</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-700 mb-2">
                  Are you sure you want to delete this conversation?
                </p>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {deleteConfirm.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {deleteConfirm.messageCount} messages • {formatDate(deleteConfirm.lastActivity)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 hover:bg-slate-50"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteSession(deleteConfirm.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button for desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={`fixed left-4 top-24 z-40 w-10 h-10 bg-white/80 backdrop-blur-md border border-emerald-200 hover:bg-emerald-50 transition-all duration-200 ${
          isOpen ? 'lg:left-80' : 'lg:left-4'
        }`}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-600" />
        )}
      </Button>
    </>
  );
};

export default ChatSidebar;
