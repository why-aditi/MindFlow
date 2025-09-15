import { Message, AISession } from "../models/Conversation.js";
import geminiService from "../services/geminiService.js";

export const aiController = {
  // Send message to AI companion
  async sendMessage(req, res) {
    try {
      const { uid } = req.user;
      const { message, sessionId, language, context } = req.body;

      // Validate message
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: "Message cannot be empty",
        });
      }

      // Check for crisis indicators first
      const crisisCheck = await geminiService.checkCrisisIndicators(message);
      if (crisisCheck.isCrisis) {
        return res.json({
          success: true,
          response: crisisCheck.response,
          sessionId: sessionId || null,
          isCrisis: true,
          resources: crisisCheck.resources,
          model: "crisis-response"
        });
      }

      // Create or get session
      let session = null;
      if (sessionId) {
        session = await AISession.findOne({ _id: sessionId, userId: uid });
      }

      if (!session) {
        session = new AISession({
          userId: uid,
          language: language || "en",
          context: context || {},
        });
        await session.save();
      }

      // Generate AI response using Gemini
      const aiResult = await geminiService.generateResponse(
        message,
        session._id,
        uid,
        language || "en",
        { ...context, ...session.context }
      );

      // Update session
      session.lastActivity = new Date();
      session.messageCount = (session.messageCount || 0) + 1;
      await session.save();

      res.json({
        success: aiResult.success,
        response: aiResult.response,
        sessionId: session._id,
        model: aiResult.model,
        timestamp: aiResult.timestamp,
        conversationLength: aiResult.conversationLength,
        error: aiResult.error
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({
        error: "Failed to send message",
        message: error.message,
      });
    }
  },

  // Get conversations
  async getConversations(req, res) {
    try {
      const { uid } = req.user;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sessions = await AISession.find({ userId: uid })
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const conversations = await Promise.all(
        sessions.map(async (session) => {
          // Get last message for preview
          const lastMessage = await Message.findOne({
            sessionId: session._id,
          }).sort({ timestamp: -1 });

          return {
            id: session._id,
            ...session.toObject(),
            lastMessage: lastMessage ? lastMessage.message : null,
          };
        })
      );

      const total = await AISession.countDocuments({ userId: uid });

      res.json({
        success: true,
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({
        error: "Failed to get conversations",
        message: error.message,
      });
    }
  },

  // Get single conversation
  async getConversation(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const session = await AISession.findOne({ _id: id, userId: uid });

      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Get all messages in this conversation
      const messages = await Message.find({ sessionId: id }).sort({
        timestamp: 1,
      });

      res.json({
        success: true,
        conversation: {
          id: session._id,
          ...session.toObject(),
          messages,
        },
      });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        error: "Failed to get conversation",
        message: error.message,
      });
    }
  },

  // Submit feedback for conversation
  async submitFeedback(req, res) {
    try {
      const { uid } = req.user;
      const { conversationId, rating, feedback } = req.body;

      // For now, we'll store feedback in the session document
      // In a production app, you might want a separate Feedback model
      const session = await AISession.findOne({
        _id: conversationId,
        userId: uid,
      });

      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Add feedback to session (you might want to create a separate model for this)
      session.feedback = {
        rating,
        comment: feedback || "",
        submittedAt: new Date(),
      };
      await session.save();

      res.json({
        success: true,
        message: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      res.status(500).json({
        error: "Failed to submit feedback",
        message: error.message,
      });
    }
  },

  // Get AI sessions
  async getSessions(req, res) {
    try {
      const { uid } = req.user;

      const sessions = await AISession.find({ userId: uid }).sort({
        lastActivity: -1,
      });

      res.json({
        success: true,
        sessions,
      });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({
        error: "Failed to get sessions",
        message: error.message,
      });
    }
  },

  // Get all messages for AI companion
  async getMessages(req, res) {
    try {
      const { uid } = req.user;
      const { limit = 50 } = req.query;

      // Get recent messages across all conversations for this user
      const messages = await Message.find({ userId: uid })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .populate("sessionId", "language");

      // Format messages for the frontend
      const formattedMessages = messages.map((msg) => ({
        id: msg._id,
        message: msg.message,
        sender: msg.sender,
        timestamp: msg.timestamp,
        sessionId: msg.sessionId?._id,
        language: msg.language || "en",
      }));

      res.json({
        success: true,
        messages: formattedMessages.reverse(), // Reverse to show oldest first
      });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({
        error: "Failed to get messages",
        message: error.message,
      });
    }
  },

  // Analyze mood from conversation
  async analyzeMood(req, res) {
    try {
      const { uid } = req.user;
      const { sessionId } = req.params;

      // Verify session belongs to user
      const session = await AISession.findOne({ _id: sessionId, userId: uid });
      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Get conversation history
      const conversationHistory = await geminiService.getConversationHistory(sessionId);
      
      // Analyze mood
      const moodAnalysis = await geminiService.analyzeMood(conversationHistory);

      res.json({
        success: true,
        moodAnalysis,
        sessionId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Mood analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze mood",
        message: error.message,
      });
    }
  },

  // Get personalized wellness suggestions
  async getWellnessSuggestions(req, res) {
    try {
      const { uid } = req.user;
      const { sessionId } = req.params;
      const { userProfile } = req.body;

      // Verify session belongs to user
      const session = await AISession.findOne({ _id: sessionId, userId: uid });
      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Get current mood analysis
      const conversationHistory = await geminiService.getConversationHistory(sessionId);
      const moodAnalysis = await geminiService.analyzeMood(conversationHistory);

      // Generate personalized suggestions
      const suggestions = await geminiService.generateWellnessSuggestions(
        userProfile || {},
        moodAnalysis
      );

      res.json({
        success: true,
        suggestions,
        moodAnalysis,
        sessionId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Wellness suggestions error:", error);
      res.status(500).json({
        error: "Failed to generate wellness suggestions",
        message: error.message,
      });
    }
  },

  // Generate conversation summary
  async getConversationSummary(req, res) {
    try {
      const { uid } = req.user;
      const { sessionId } = req.params;

      // Verify session belongs to user
      const session = await AISession.findOne({ _id: sessionId, userId: uid });
      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Get conversation history
      const conversationHistory = await geminiService.getConversationHistory(sessionId);
      
      // Generate summary
      const summary = await geminiService.generateConversationSummary(conversationHistory);

      res.json({
        success: true,
        summary,
        sessionId,
        messageCount: conversationHistory.length,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Conversation summary error:", error);
      res.status(500).json({
        error: "Failed to generate conversation summary",
        message: error.message,
      });
    }
  },

  // Get AI model information
  async getModelInfo(req, res) {
    try {
      res.json({
        success: true,
        model: {
          name: "Gemini 2.0 Flash",
          version: "gemini-2.5-flash",
          provider: "Google",
          capabilities: [
            "Mental wellness support",
            "Multi-language support",
            "Crisis detection",
            "Mood analysis",
            "Personalized suggestions",
            "Conversation summarization"
          ],
          supportedLanguages: [
            "en", "es", "fr", "de", "zh", "ja", "ko", "pt", "ru", "ar"
          ]
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Model info error:", error);
      res.status(500).json({
        error: "Failed to get model information",
        message: error.message,
      });
    }
  },

  // Update session context
  async updateSessionContext(req, res) {
    try {
      const { uid } = req.user;
      const { sessionId } = req.params;
      const { context } = req.body;

      // Verify session belongs to user
      const session = await AISession.findOne({ _id: sessionId, userId: uid });
      if (!session) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      // Update context
      session.context = { ...session.context, ...context };
      await session.save();

      res.json({
        success: true,
        message: "Session context updated successfully",
        sessionId,
        context: session.context,
      });
    } catch (error) {
      console.error("Update session context error:", error);
      res.status(500).json({
        error: "Failed to update session context",
        message: error.message,
      });
    }
  },
};
