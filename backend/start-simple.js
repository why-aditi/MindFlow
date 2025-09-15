#!/usr/bin/env node
/**
 * Simple backend startup without Babel
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
    port: PORT,
  });
});

// Basic API routes
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Mock journal endpoint for testing
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

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 MindFlow Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Test: http://localhost:${PORT}/api/test`);
  console.log(`📝 Journal API: http://localhost:${PORT}/api/journal/entries`);
  console.log(`\n✅ Backend is ready to receive requests!`);
});

export default app;
