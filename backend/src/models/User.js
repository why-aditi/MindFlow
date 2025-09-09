import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: "",
  },
  preferredLanguage: {
    type: String,
    default: "en",
    enum: ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"],
  },
  wellnessGoals: [
    {
      id: String,
      title: String,
      description: String,
      targetDate: Date,
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    accessibility: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("User", userSchema);
