#!/usr/bin/env node
/**
 * Quick start script for testing backend connection
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Basic middleware
app.use(cors({
  origin: "*", // Allow all origins for testing
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Mock journal endpoint (no auth required for testing)
app.get("/api/journal/entries", (req, res) => {
  res.json({
    success: true,
    entries: [
      {
        id: "1",
        title: "Test Entry",
        content: "This is a test journal entry",
        mood: "happy",
        createdAt: new Date().toISOString(),
      }
    ],
    message: "Mock data - backend is running"
  });
});

// Mock journal analytics endpoint
app.get("/api/journal/analytics", (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalEntries: 1,
      moodDistribution: { happy: 1, sad: 0, anxious: 0, calm: 0 },
      averageMood: "happy",
      entriesThisWeek: 1,
      streak: 1
    },
    message: "Mock analytics - backend is running"
  });
});

// Mock AI chat endpoint
app.post("/api/ai/chat", (req, res) => {
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
app.get("/api/ai/messages", (req, res) => {
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
    message: "Mock AI data - backend is running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quick Start Backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Test: http://localhost:${PORT}/api/test`);
  console.log(`📝 Journal API: http://localhost:${PORT}/api/journal/entries`);
  console.log(`🤖 AI Messages: http://localhost:${PORT}/api/ai/messages`);
  console.log(`\n✅ Backend is ready for testing!`);
  console.log(`\n💡 This is a minimal backend for testing.`);
  console.log(`   For full functionality, use: npm run dev`);
});
