import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import Navbar from '../components/Navbar';
import ChatSidebar from '../components/ChatSidebar';
import { apiClient } from '../utils/apiClient';
import { Send, Mic, MicOff, Bot, User, Heart, Sparkles, Leaf, Cloud, Waves, ArrowLeft } from 'lucide-react';

const AICompanion = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);


  // Load specific conversation
  const loadConversation = useCallback(async (sessionId) => {
    if (!user || !sessionId) return

    setIsInitializing(true)
    try {
      const response = await apiClient.get(`/api/ai/conversations/${sessionId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const formattedMessages = data.conversation.messages.map(msg => ({
            id: msg._id,
            text: msg.message,
            sender: msg.sender,
            timestamp: msg.timestamp,
          }))
          setMessages(formattedMessages)
          setCurrentSessionId(sessionId)
          
          // Scroll to bottom to show the latest messages
          setTimeout(() => {
            scrollToBottom()
          }, 100)
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsInitializing(false)
    }
  }, [user])

  // Start new chat
  const startNewChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      text: "Hello! I'm your AI wellness companion. I'm here to listen, support, and help you on your mental wellness journey. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage])
    setCurrentSessionId(null)
    setIsInitializing(false)
  }, [])

  // Close current session on page refresh/unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentSessionId && user) {
        try {
          await apiClient.put(`/api/ai/conversations/${currentSessionId}/close`)
        } catch (error) {
          console.error('Error closing session on unload:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentSessionId, user])

  // Start with fresh chat - show welcome message immediately
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: "Hello! I'm your AI wellness companion. I'm here to listen, support, and help you on your mental wellness journey. How are you feeling today?",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    setIsInitializing(false);
  }, [messages.length])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to bottom when new messages are added (always)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]); // Only trigger when message count changes

  // Scroll to bottom when loading is complete
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoading, messages.length]);

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200); // Slightly longer delay for initial load
    }
  }, [messages.length]); // Include messages.length dependency

  // Handle scroll events to show/hide scroll to bottom button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      const isAtTop = scrollTop <= 50; // 50px threshold
      
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
      setShowScrollToTop(!isAtTop && messages.length > 0);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/ai/chat', { 
        message: messageText,
        ...(currentSessionId && { sessionId: currentSessionId })
      })
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          if (errorData.details) {
            console.error('Validation errors:', errorData.details)
          }
        } else {
          console.warn('Backend server not running or returned non-JSON response')
        }
        setIsLoading(false)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend server not running')
        setIsLoading(false)
        return
      }
      
      const data = await response.json()
      if (data.success) {
        const aiResponse = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        
        // Update current session ID if it's a new session
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
      } else {
        console.error('Failed to get AI response:', data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error.message)
    } finally {
      setIsLoading(false)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement speech-to-text functionality
  };

  return (
    <div className="min-h-screen wellness-bg relative overflow-hidden">
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentSessionId={currentSessionId}
        onSessionSelect={loadConversation}
        onNewChat={startNewChat}
      />

      {/* Floating wellness elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-sky-200/30"
        >
          <Cloud className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-32 text-emerald-200/25"
        >
          <Leaf className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-32 text-violet-200/20"
        >
          <Sparkles className="w-14 h-14" />
        </motion.div>
      </div>

      {/* Header */}
      <Navbar />

      {/* Chat Container */}
      <div className={`max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-80' : ''
      }`}>
        {/* New Chat Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={startNewChat}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-wellness hover:shadow-wellness-lg px-4 py-2 rounded-xl"
          >
            <span className="mr-2">+</span>
            New Chat
          </Button>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-wellness h-[calc(100vh-180px)] sm:h-[calc(100vh-240px)] flex flex-col border border-emerald-100">
          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="messages-container flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth relative"
          >
            {/* Scroll to top button */}
            {showScrollToTop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 z-10"
              >
                <Button
                  onClick={scrollToTop}
                  className="w-10 h-10 bg-white/90 hover:bg-white text-emerald-600 rounded-full shadow-lg border border-emerald-200"
                >
                  <Send className="w-4 h-4 -rotate-90" />
                </Button>
              </motion.div>
            )}
            
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading conversation...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-start max-w-[85%] sm:max-w-xs lg:max-w-md ${
                      message.sender === 'user'
                        ? 'flex-row-reverse space-x-reverse space-x-2 sm:space-x-3'
                        : 'space-x-2 sm:space-x-3'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-br from-violet-500 to-purple-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 mx-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                          : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-slate-900 border border-emerald-100'
                      }`}
                    >
                      <p className="text-xs sm:text-sm break-words">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-emerald-100'
                            : 'text-slate-500'
                        }`}
                      >
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
            
            {/* Scroll to bottom button */}
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed bottom-24 sm:bottom-32 right-4 sm:right-8 z-20"
              >
                <Button
                  onClick={scrollToBottom}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-lg"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-emerald-100 p-3 sm:p-6">
            <div className="flex items-end space-x-2 sm:space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/50 text-sm sm:text-base"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
