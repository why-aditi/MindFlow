import mongoose from "mongoose";

const exerciseSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  exercisePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExercisePlan",
    required: true,
  },
  sessionType: {
    type: String,
    enum: ["yoga", "meditation", "breathing", "mindfulness"],
    required: true,
  },
  plannedDuration: {
    type: Number, // in minutes
    required: true,
  },
  actualDuration: {
    type: Number, // in minutes
    min: 0,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled", "paused"],
    default: "active",
  },
  progress: {
    currentExercise: {
      type: Number,
      default: 0,
    },
    completedExercises: [
      {
        exerciseIndex: Number,
        completedAt: Date,
        duration: Number, // actual duration in seconds
        accuracy: Number, // pose accuracy percentage
        breathingAccuracy: Number, // breathing pattern accuracy
      },
    ],
    overallAccuracy: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  monitoringData: {
    poseTracking: [
      {
        timestamp: Date,
        exerciseIndex: Number,
        keyPoints: [
          {
            name: String,
            x: Number,
            y: Number,
            confidence: Number,
          },
        ],
        accuracy: Number,
        feedback: String,
      },
    ],
    breathingTracking: [
      {
        timestamp: Date,
        exerciseIndex: Number,
        inhaleDuration: Number,
        exhaleDuration: Number,
        holdDuration: Number,
        accuracy: Number,
        feedback: String,
      },
    ],
    heartRate: [
      {
        timestamp: Date,
        bpm: Number,
      },
    ],
  },
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
  achievements: [
    {
      type: String, // e.g., "perfect_pose", "consistent_breathing", "completed_session"
      earnedAt: Date,
      exerciseIndex: Number,
    },
  ],
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
exerciseSessionSchema.index({ exercisePlanId: 1 });

export default mongoose.model("ExerciseSession", exerciseSessionSchema);
