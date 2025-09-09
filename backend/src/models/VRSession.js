import mongoose from "mongoose";

const vrSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sessionType: {
    type: String,
    enum: ["meditation", "breathing", "visualization", "mindfulness"],
    required: true,
  },
  environment: {
    type: String,
    enum: ["ocean", "forest", "mountain", "space", "garden"],
    default: "ocean",
  },
  plannedDuration: {
    type: Number,
    default: 10,
    min: 1,
    max: 60,
  },
  actualDuration: {
    type: Number,
    min: 1,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  feedback: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
vrSessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
vrSessionSchema.index({ userId: 1, createdAt: -1 });
vrSessionSchema.index({ userId: 1, sessionType: 1 });
vrSessionSchema.index({ userId: 1, status: 1 });

export default mongoose.model("VRSession", vrSessionSchema);
