import mongoose from "mongoose";

const exerciseSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    enum: ["rep", "hold", "meditation", "breathing", "stretch"],
    required: true,
  },
  plannedDuration: {
    type: Number, // in seconds
    required: true,
  },
  actualDuration: {
    type: Number, // in seconds
    min: 0,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled", "paused"],
    default: "active",
  },
  
  // Session results
  results: {
    // For rep-based exercises
    repCount: {
      type: Number,
      default: 0,
    },
    
    // For hold-based exercises
    holdTime: {
      type: Number, // in seconds
      default: 0,
    },
    maxHoldTime: {
      type: Number, // in seconds
      default: 0,
    },
    
    // For all exercises
    accuracy: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 0,
    },
    
    // Session quality metrics
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  
  // Real-time tracking data
  trackingData: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["rep", "hold", "angle", "quality", "progress"],
    },
    value: Number,
    metadata: mongoose.Schema.Types.Mixed,
  }],
  
  // Session feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: String,
    difficulty: {
      type: String,
      enum: ["too_easy", "just_right", "too_hard"],
    },
    enjoyment: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  
  // Achievements earned during session
  achievements: [{
    type: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  }],
  
  // Session metadata
  deviceInfo: {
    camera: String,
    resolution: String,
    fps: Number,
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
exerciseSessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
exerciseSessionSchema.index({ userId: 1, createdAt: -1 });
exerciseSessionSchema.index({ userId: 1, sessionType: 1 });
exerciseSessionSchema.index({ userId: 1, status: 1 });
exerciseSessionSchema.index({ exerciseId: 1 });
exerciseSessionSchema.index({ startedAt: -1 });

export default mongoose.model("ExerciseSession", exerciseSessionSchema);
