import mongoose from "mongoose";

const voiceJournalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AISession",
      required: true,
    },
    // Audio file information
    audioFile: {
      bucketName: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number, // in seconds
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      uploadUrl: {
        type: String,
        required: true,
      },
    },
    // Transcription data
    transcription: {
      text: {
        type: String,
        required: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
      language: {
        type: String,
        default: "en-US",
      },
      alternatives: [
        {
          text: String,
          confidence: Number,
        },
      ],
    },
    // Natural Language Analysis
    nlpAnalysis: {
      sentiment: {
        score: {
          type: Number,
          min: -1,
          max: 1,
        },
        magnitude: {
          type: Number,
          min: 0,
        },
      },
      entities: [
        {
          name: String,
          type: String,
          salience: Number,
          mentions: [
            {
              text: String,
              beginOffset: Number,
              endOffset: Number,
            },
          ],
        },
      ],
      categories: [
        {
          name: String,
          confidence: Number,
        },
      ],
    },
    // AI Analysis (using Gemini)
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
      moodScore: {
        type: Number,
        min: 1,
        max: 10,
      },
    },
    // Memory system integration
    memoryTags: {
      episodic: [String], // Breakthrough moments, significant events
      semantic: [String], // Coping strategies, recurring triggers
      contextual: [String], // Calendar events, stress periods
    },
    // Metadata
    tags: [String],
    privacy: {
      type: String,
      enum: ["private", "anonymous-research"],
      default: "private",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
voiceJournalEntrySchema.index({ userId: 1, createdAt: -1 });
voiceJournalEntrySchema.index({ "memoryTags.episodic": 1 });
voiceJournalEntrySchema.index({ "memoryTags.semantic": 1 });
voiceJournalEntrySchema.index({ "aiAnalysis.moodScore": 1 });

// Virtual for audio file URL
voiceJournalEntrySchema.virtual("audioUrl").get(function () {
  return `https://storage.googleapis.com/${this.audioFile.bucketName}/${this.audioFile.fileName}`;
});

// Method to get formatted duration
voiceJournalEntrySchema.methods.getFormattedDuration = function () {
  const minutes = Math.floor(this.audioFile.duration / 60);
  const seconds = Math.floor(this.audioFile.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Method to check if entry is recent (within last 24 hours)
voiceJournalEntrySchema.methods.isRecent = function () {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return this.createdAt > twentyFourHoursAgo;
};

// Static method to get entries by mood range
voiceJournalEntrySchema.statics.getByMoodRange = function (
  userId,
  minMood,
  maxMood
) {
  return this.find({
    userId,
    "aiAnalysis.moodScore": { $gte: minMood, $lte: maxMood },
  }).sort({ createdAt: -1 });
};

// Static method to get entries with specific themes
voiceJournalEntrySchema.statics.getByThemes = function (userId, themes) {
  return this.find({
    userId,
    "aiAnalysis.themes": { $in: themes },
  }).sort({ createdAt: -1 });
};

export default mongoose.model("VoiceJournalEntry", voiceJournalEntrySchema);
