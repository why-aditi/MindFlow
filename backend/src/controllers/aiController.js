import { Message, AISession } from "../models/Conversation.js";

export const aiController = {
  // Send message to AI companion
  async sendMessage(req, res) {
    try {
      const { uid } = req.user;
      const { message, sessionId, language } = req.body;

      // Create or get session
      let session = null;
      if (sessionId) {
        session = await AISession.findOne({ _id: sessionId, userId: uid });
      }

      if (!session) {
        session = new AISession({
          userId: uid,
          language: language || "en",
        });
        await session.save();
      }

      // Store user message
      const userMessage = new Message({
        sessionId: session._id,
        userId: uid,
        message: message,
        sender: "user",
        language: language || "en",
      });
      await userMessage.save();

      // TODO: Integrate with Dialogflow CX API
      // For now, return a mock response
      const aiResponse =
        "I'm here to help you with your mental wellness journey. How are you feeling today?";

      // Store AI response
      const aiMessage = new Message({
        sessionId: session._id,
        userId: uid,
        message: aiResponse,
        sender: "ai",
        language: language || "en",
      });
      await aiMessage.save();

      // Update session
      session.lastActivity = new Date();
      await session.save();

      res.json({
        success: true,
        response: aiResponse,
        sessionId: session._id,
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
};
