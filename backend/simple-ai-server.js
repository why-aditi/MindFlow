import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple AI Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock AI chat endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  
  // Simulate AI response
  const responses = [
    "I understand you're feeling that way. Let's work through this together.",
    "That sounds challenging. Can you tell me more about what's on your mind?",
    "I'm here to listen and support you. How can I help you feel better?",
    "It's okay to feel overwhelmed sometimes. What would help you right now?",
    "I appreciate you sharing that with me. You're not alone in this.",
    "Let's take this one step at a time. What's the most important thing right now?",
    "Your feelings are valid. What would make you feel more supported?",
    "I'm here to help you navigate through this. What's your biggest concern?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    response: randomResponse,
    timestamp: new Date().toISOString()
  });
});

// Mock AI messages endpoint
app.get('/api/ai/messages', (req, res) => {
  res.json({
    success: true,
    messages: [
      {
        id: "1",
        text: "Hello! I'm your AI companion. How are you feeling today?",
        sender: "ai",
        timestamp: new Date().toISOString(),
      }
    ],
    message: "Mock AI data - simple server is running"
  });
});

// Mock journal entries endpoint
app.get('/api/journal/entries', (req, res) => {
  res.json({
    success: true,
    entries: [
      {
        id: "1",
        title: "Today's Reflection",
        content: "Feeling grateful for the small moments today.",
        mood: "happy",
        timestamp: new Date().toISOString()
      }
    ],
    message: "Mock journal data - simple server is running"
  });
});

// Mock journal analytics endpoint
app.get('/api/journal/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalEntries: 5,
      moodTrend: "positive",
      insights: ["You've been feeling more positive lately"]
    },
    message: "Mock analytics - simple server is running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple AI Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 AI Chat: http://localhost:${PORT}/api/ai/chat`);
  console.log(`📝 Journal: http://localhost:${PORT}/api/journal/entries`);
});
