import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: [
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "confused",
      "neutral",
    ],
    default: "neutral",
  },
  tags: [
    {
      type: String,
    },
  ],
  source: {
    type: String,
    enum: ["text", "speech", "import"],
    default: "text",
  },
  metadata: {
    audioFile: {
      originalName: String,
      size: Number,
      mimeType: String,
    },
    transcription: {
      confidence: Number,
      languageCode: String,
      wordCount: Number,
    },
    aiAnalysis: {
      emotions: [
        {
          name: String,
          intensity: Number,
        },
      ],
      themes: [String],
      summary: String,
      insights: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
journalEntrySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });

export default mongoose.model("JournalEntry", journalEntrySchema);
