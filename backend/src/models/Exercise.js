import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "strength",
      "cardio",
      "flexibility",
      "balance",
      "yoga",
      "pilates",
      "dance",
      "martial_arts",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
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
      imageUrl: String, // Reference image for the step
    },
  ],

  // MediaPipe Pose Landmarks for this exercise
  poseLandmarks: {
    // Expected pose landmarks (33 MediaPipe landmarks)
    expectedLandmarks: [
      {
        landmarkId: {
          type: Number,
          required: true,
          min: 0,
          max: 32, // MediaPipe has 33 landmarks (0-32)
        },
        name: {
          type: String,
          required: true,
        },
        expectedPosition: {
          x: Number, // Normalized coordinates (0-1)
          y: Number,
          z: Number,
        },
        tolerance: {
          type: Number,
          default: 0.1, // Tolerance for position matching
        },
        importance: {
          type: String,
          enum: ["critical", "important", "optional"],
          default: "important",
        },
      },
    ],

    // Key pose transitions for the exercise
    transitions: [
      {
        name: String,
        fromLandmarks: [
          {
            landmarkId: Number,
            position: {
              x: Number,
              y: Number,
              z: Number,
            },
          },
        ],
        toLandmarks: [
          {
            landmarkId: Number,
            position: {
              x: Number,
              y: Number,
              z: Number,
            },
          },
        ],
        duration: Number, // Expected transition time in seconds
      },
    ],

    // Pose validation rules
    validationRules: {
      minConfidence: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1,
      },
      requiredLandmarks: [Number], // Array of landmark IDs that must be visible
      angleConstraints: [
        {
          name: String, // e.g., "knee_angle", "elbow_angle"
          landmarks: [Number], // 3 landmark IDs to form the angle
          minAngle: Number, // in degrees
          maxAngle: Number, // in degrees
        },
      ],
      distanceConstraints: [
        {
          name: String, // e.g., "shoulder_width", "arm_length"
          landmarks: [Number], // 2 landmark IDs
          minDistance: Number, // normalized distance
          maxDistance: Number, // normalized distance
        },
      ],
    },
  },

  // Exercise-specific metrics
  metrics: {
    caloriesPerMinute: {
      type: Number,
      default: 0,
    },
    muscleGroups: [
      {
        type: String,
        enum: [
          "chest",
          "back",
          "shoulders",
          "arms",
          "core",
          "legs",
          "glutes",
          "calves",
        ],
      },
    ],
    equipment: [
      {
        type: String,
        enum: [
          "none",
          "dumbbells",
          "resistance_bands",
          "yoga_mat",
          "chair",
          "wall",
        ],
      },
    ],
    spaceRequired: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
  },

  // Feedback and scoring
  scoring: {
    poseAccuracyWeight: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    timingWeight: {
      type: Number,
      default: 0.2,
      min: 0,
      max: 1,
    },
    consistencyWeight: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1,
    },
    perfectScoreThreshold: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
  },

  // MediaPipe-specific configuration
  mediapipeConfig: {
    modelComplexity: {
      type: Number,
      default: 1,
      min: 0,
      max: 2,
    },
    smoothLandmarks: {
      type: Boolean,
      default: true,
    },
    enableSegmentation: {
      type: Boolean,
      default: false,
    },
    smoothSegmentation: {
      type: Boolean,
      default: true,
    },
    minDetectionConfidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    minTrackingConfidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
  },

  // Metadata
  tags: [String],
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
exerciseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ isActive: 1 });
exerciseSchema.index({ tags: 1 });
exerciseSchema.index({ "metrics.muscleGroups": 1 });

export default mongoose.model("Exercise", exerciseSchema);
