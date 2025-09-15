import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
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
      "meditation",
      "breathing",
      "stretching"
    ],
    required: true,
  },
  type: {
    type: String,
    enum: ["rep", "hold", "meditation", "breathing", "stretch"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  duration: {
    type: Number, // in seconds
    default: 300, // 5 minutes default
  },
  instructions: [{
    step: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    imageUrl: String,
  }],
  
  // For rep-based exercises
  repConfig: {
    joints: [String], // ["shoulder", "elbow", "wrist"]
    upAngle: Number,
    downAngle: Number,
  },
  
  // For hold-based exercises
  holdConfig: {
    joints: [String],
    targetAngle: Number,
    tolerance: Number,
  },
  
  // For meditation/breathing exercises
  meditationConfig: {
    pattern: String, // "4-4-4" for inhale-hold-exhale
    backgroundMusic: String,
    environment: String,
  },
  
  // Exercise metadata
  muscleGroups: [{
    type: String,
    enum: [
      "chest", "back", "shoulders", "arms", "core", 
      "legs", "glutes", "calves", "full_body"
    ],
  }],
  equipment: [{
    type: String,
    enum: ["none", "dumbbells", "resistance_bands", "yoga_mat", "chair", "wall"],
  }],
  spaceRequired: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "medium",
  },
  
  // MediaPipe configuration
  mediapipeConfig: {
    modelComplexity: {
      type: Number,
      default: 1,
      min: 0,
      max: 2,
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
exerciseSchema.index({ type: 1 });
exerciseSchema.index({ isActive: 1 });
exerciseSchema.index({ tags: 1 });
exerciseSchema.index({ muscleGroups: 1 });

export default mongoose.model("Exercise", exerciseSchema);
