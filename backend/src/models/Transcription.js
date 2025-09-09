import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
    default: "",
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  language: {
    type: String,
    default: "en",
  },
  duration: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  error: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Indexes for efficient queries
transcriptionSchema.index({ userId: 1, createdAt: -1 });
transcriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Transcription", transcriptionSchema);
