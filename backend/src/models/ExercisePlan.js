import mongoose from "mongoose";

const exercisePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["yoga", "meditation", "breathing", "mindfulness"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1,
    max: 120,
  },
  exercises: [
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number, // in seconds
        required: true,
      },
      instructions: [
        {
          step: {
            type: Number,
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
          audioFile: String, // URL to audio instruction
        },
      ],
      poseData: {
        keyPoints: [
          {
            name: String, // e.g., "left_shoulder", "right_hip"
            x: Number,
            y: Number,
            confidence: Number,
          },
        ],
        expectedPose: String, // Reference pose name
      },
      breathingPattern: {
        inhaleDuration: Number, // in seconds
        exhaleDuration: Number, // in seconds
        holdDuration: Number, // in seconds
        pattern: String, // e.g., "4-4-4" for inhale-hold-exhale
      },
    },
  ],
  environment: {
    type: String,
    enum: ["ocean", "forest", "mountain", "space", "garden", "studio"],
    default: "studio",
  },
  backgroundMusic: {
    type: String, // URL to background music
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
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
exercisePlanSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
exercisePlanSchema.index({ type: 1, difficulty: 1 });
exercisePlanSchema.index({ isActive: 1 });

export default mongoose.model("ExercisePlan", exercisePlanSchema);
