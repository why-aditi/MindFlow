import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    default: "en",
  },
});

const aiSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  language: {
    type: String,
    default: "en",
  },
  status: {
    type: String,
    enum: ["active", "completed", "archived"],
    default: "active",
  },
  summary: {
    type: String,
    default: "",
  },
  messages: [messageSchema],
  messageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

// Update lastActivity before saving
aiSessionSchema.pre("save", function (next) {
  this.lastActivity = new Date();
  next();
});

// Legacy Message schema for backward compatibility (deprecated)
const legacyMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AISession",
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    default: "en",
  },
});

// Indexes for efficient queries
legacyMessageSchema.index({ sessionId: 1, timestamp: 1 });
legacyMessageSchema.index({ userId: 1, timestamp: -1 });
aiSessionSchema.index({ userId: 1, lastActivity: -1 });

export const Message = mongoose.model("Message", legacyMessageSchema);
export const AISession = mongoose.model("AISession", aiSessionSchema);
