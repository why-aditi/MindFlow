import { Server } from "socket.io";

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  /**
   * Initialize WebSocket service
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

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
            `Client ${socket.id} authenticated for user ${data.userId}`
          );
        }
      });

      // Handle VR exercise tracking requests
      socket.on("start-vr-tracking", (data) => {
        console.log(`Starting VR tracking for session ${data.sessionId}`);
        // This will be handled by the VR controller
        socket.emit("vr-tracking-started", {
          sessionId: data.sessionId,
          exerciseType: data.exerciseType,
        });
      });

      // Handle client disconnection
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });

    console.log("WebSocket service initialized");
  }

  /**
   * Broadcast VR exercise data to connected clients
   */
  broadcastVrExerciseData(sessionId, data) {
    if (!this.io) return;

    // Find clients connected to this session
    const sessionClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.sessionId === sessionId
    );

    sessionClients.forEach((client) => {
      client.socket.emit("vr-exercise-data", {
        sessionId,
        timestamp: new Date(),
        ...data,
      });
    });
  }

  /**
   * Broadcast pose detection data
   */
  broadcastPoseData(sessionId, poseData) {
    if (!this.io) return;

    const sessionClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.sessionId === sessionId
    );

    sessionClients.forEach((client) => {
      client.socket.emit("pose-detection", {
        sessionId,
        timestamp: new Date(),
        ...poseData,
      });
    });
  }

  /**
   * Broadcast breathing data
   */
  broadcastBreathingData(sessionId, breathingData) {
    if (!this.io) return;

    const sessionClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.sessionId === sessionId
    );

    sessionClients.forEach((client) => {
      client.socket.emit("breathing-detection", {
        sessionId,
        timestamp: new Date(),
        ...breathingData,
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
      client.socket.emit("notification", {
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

export default new WebSocketService();
