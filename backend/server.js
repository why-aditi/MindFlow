import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";

// Load environment variables
dotenv.config();

// Import initialization
import { initializeFirebase } from "./src/config/firebase.js";
import { connectMongoDB } from "./src/config/mongodb.js";

// Import routes
import authRoutes from "./src/routes/auth.js";
import journalRoutes from "./src/routes/journal.js";
import aiRoutes from "./src/routes/ai.js";
import userRoutes from "./src/routes/user.js";
import profileRoutes from "./src/routes/profile.js";
import vrRoutes from "./src/routes/vr.js";

// Import middleware
import { errorHandler } from "./src/middleware/errorHandler.js";
import { authMiddleware } from "./src/middleware/auth.js";

// Import services
import websocketService from "./src/services/websocketService.js";
import aiWebSocketService from "./src/services/aiWebSocketService.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/journal", authMiddleware, journalRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);
app.use("/api/vr", authMiddleware, vrRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket services
websocketService.initialize(server);
aiWebSocketService.initialize(server);

// Start server
server.listen(PORT, async () => {
  try {
    // Initialize Firebase (for auth only)
    initializeFirebase();

    // Connect to MongoDB (for data storage)
    await connectMongoDB();

    console.log(`🚀 MindFlow Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🔥 Firebase: Authentication only`);
    console.log(`🍃 MongoDB: Data storage`);
    console.log(`🔌 WebSocket: Real-time VR tracking enabled`);
    console.log(`🤖 AI Chat: Gemini 2.0 Flash powered chatbot`);
  } catch (error) {
    console.error("❌ Backend initialization failed:", error);
    process.exit(1);
  }
});

export default app;
