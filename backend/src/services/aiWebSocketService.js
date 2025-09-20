import { Server } from "socket.io";
import geminiService from "./geminiService.js";
import { Message, AISession } from "../models/Conversation.js";

class AIWebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.activeChats = new Map();
  }

  /**
   * Initialize AI WebSocket service
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`AI Chat client connected: ${socket.id}`);

      // Store client connection
      this.connectedClients.set(socket.id, {
        socket,
        userId: null,
        sessionId: null,
        connectedAt: new Date(),
      });

      // Handle client authentication
      socket.on("authenticate", (data) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.userId = data.userId;
          client.sessionId = data.sessionId;
          console.log(
            `AI Chat client ${socket.id} authenticated for user ${data.userId}`
          );
        }
      });

      // Handle chat messages
      socket.on("chat-message", async (data) => {
        await this.handleChatMessage(socket, data);
      });

      // Handle typing indicators
      socket.on("typing-start", (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on("typing-stop", (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle mood analysis request
      socket.on("request-mood-analysis", async (data) => {
        await this.handleMoodAnalysis(socket, data);
      });

      // Handle wellness suggestions request
      socket.on("request-wellness-suggestions", async (data) => {
        await this.handleWellnessSuggestions(socket, data);
      });

      // Handle client disconnection
      socket.on("disconnect", () => {
        console.log(`AI Chat client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });

    console.log("AI WebSocket service initialized");
  }

  /**
   * Handle incoming chat messages
   */
  async handleChatMessage(socket, data) {
    try {
      const client = this.connectedClients.get(socket.id);
      if (!client || !client.userId) {
        socket.emit("chat-error", { message: "Authentication required" });
        return;
      }

      const { message, sessionId, language, context } = data;

      // Validate message
      if (!message || message.trim().length === 0) {
        socket.emit("chat-error", { message: "Message cannot be empty" });
        return;
      }

      // Emit typing indicator
      socket.emit("ai-typing", { isTyping: true });

      // Check for crisis indicators first
      const crisisCheck = await geminiService.checkCrisisIndicators(message);
      if (crisisCheck.isCrisis) {
        socket.emit("chat-response", {
          message: crisisCheck.response,
          sessionId: sessionId || null,
          isCrisis: true,
          resources: crisisCheck.resources,
          model: "crisis-response",
          timestamp: new Date(),
        });
        socket.emit("ai-typing", { isTyping: false });
        return;
      }

      // Create or get session
      let session = null;
      if (sessionId) {
        session = await AISession.findOne({
          _id: sessionId,
          userId: client.userId,
        });
      }

      if (!session) {
        session = new AISession({
          userId: client.userId,
          language: language || "en",
          context: context || {},
        });

        // Add welcome message to new session
        const welcomeMessage = {
          message:
            "Hello! I'm your AI wellness companion. I'm here to listen, support, and help you on your mental wellness journey. How are you feeling today?",
          sender: "ai",
          timestamp: new Date(),
          language: language || "en",
        };

        session.messages = [welcomeMessage];
        await session.save();
      }

      // Generate AI response using Gemini
      const aiResult = await geminiService.generateResponse(
        message,
        session._id,
        client.userId,
        language || "en",
        { ...context, ...session.context }
      );

      // Update session
      session.lastActivity = new Date();
      session.messageCount = (session.messageCount || 0) + 1;
      await session.save();

      // Emit response
      socket.emit("chat-response", {
        message: aiResult.response,
        sessionId: session._id,
        model: aiResult.model,
        timestamp: aiResult.timestamp,
        conversationLength: aiResult.conversationLength,
        success: aiResult.success,
        error: aiResult.error,
      });

      socket.emit("ai-typing", { isTyping: false });
    } catch (error) {
      console.error("Chat message error:", error);
      socket.emit("chat-error", {
        message: "Failed to process message",
        error: error.message,
      });
      socket.emit("ai-typing", { isTyping: false });
    }
  }

  /**
   * Handle typing start
   */
  handleTypingStart(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (client && client.sessionId) {
      socket.to(client.sessionId).emit("user-typing", {
        isTyping: true,
        userId: client.userId,
      });
    }
  }

  /**
   * Handle typing stop
   */
  handleTypingStop(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (client && client.sessionId) {
      socket.to(client.sessionId).emit("user-typing", {
        isTyping: false,
        userId: client.userId,
      });
    }
  }

  /**
   * Handle mood analysis request
   */
  async handleMoodAnalysis(socket, data) {
    try {
      const client = this.connectedClients.get(socket.id);
      if (!client || !client.userId) {
        socket.emit("mood-analysis-error", {
          message: "Authentication required",
        });
        return;
      }

      const { sessionId } = data;

      // Verify session belongs to user
      const session = await AISession.findOne({
        _id: sessionId,
        userId: client.userId,
      });
      if (!session) {
        socket.emit("mood-analysis-error", {
          message: "Conversation not found",
        });
        return;
      }

      // Get conversation history and analyze mood
      const conversationHistory = await geminiService.getConversationHistory(
        sessionId
      );
      const moodAnalysis = await geminiService.analyzeMood(conversationHistory);

      socket.emit("mood-analysis-result", {
        moodAnalysis,
        sessionId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Mood analysis error:", error);
      socket.emit("mood-analysis-error", {
        message: "Failed to analyze mood",
        error: error.message,
      });
    }
  }

  /**
   * Handle wellness suggestions request
   */
  async handleWellnessSuggestions(socket, data) {
    try {
      const client = this.connectedClients.get(socket.id);
      if (!client || !client.userId) {
        socket.emit("wellness-suggestions-error", {
          message: "Authentication required",
        });
        return;
      }

      const { sessionId, userProfile } = data;

      // Verify session belongs to user
      const session = await AISession.findOne({
        _id: sessionId,
        userId: client.userId,
      });
      if (!session) {
        socket.emit("wellness-suggestions-error", {
          message: "Conversation not found",
        });
        return;
      }

      // Get current mood analysis
      const conversationHistory = await geminiService.getConversationHistory(
        sessionId
      );
      const moodAnalysis = await geminiService.analyzeMood(conversationHistory);

      // Generate personalized suggestions
      const suggestions = await geminiService.generateWellnessSuggestions(
        userProfile || {},
        moodAnalysis
      );

      socket.emit("wellness-suggestions-result", {
        suggestions,
        moodAnalysis,
        sessionId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Wellness suggestions error:", error);
      socket.emit("wellness-suggestions-error", {
        message: "Failed to generate wellness suggestions",
        error: error.message,
      });
    }
  }

  /**
   * Broadcast message to all clients in a session
   */
  broadcastToSession(sessionId, event, data) {
    if (!this.io) return;

    const sessionClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.sessionId === sessionId
    );

    sessionClients.forEach((client) => {
      client.socket.emit(event, {
        sessionId,
        timestamp: new Date(),
        ...data,
      });
    });
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId, notification) {
    if (!this.io) return;

    const userClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.userId === userId
    );

    userClients.forEach((client) => {
      client.socket.emit("ai-notification", {
        timestamp: new Date(),
        ...notification,
      });
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount() {
    return this.connectedClients.size;
  }

  /**
   * Get clients for a specific session
   */
  getSessionClients(sessionId) {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.sessionId === sessionId
    );
  }

  /**
   * Get clients for a specific user
   */
  getUserClients(userId) {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.userId === userId
    );
  }
}

export default new AIWebSocketService();
