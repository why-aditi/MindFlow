import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "general",
        "anxiety",
        "depression",
        "relationships",
        "academic",
        "family",
        "self-care",
        "crisis-support",
      ],
    },
    region: {
      type: String,
      enum: [
        "global",
        "north-america",
        "europe",
        "asia",
        "oceania",
        "africa",
        "south-america",
      ],
      default: "global",
    },
    // Privacy and access settings
    privacy: {
      type: String,
      enum: ["public", "private", "invite-only"],
      default: "public",
    },
    ageRange: {
      min: {
        type: Number,
        min: 13,
        max: 25,
        default: 13,
      },
      max: {
        type: Number,
        min: 13,
        max: 25,
        default: 25,
      },
    },
    // Moderation settings
    moderation: {
      autoModeration: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      crisisDetection: {
        type: Boolean,
        default: true,
      },
    },
    // Statistics
    stats: {
      memberCount: {
        type: Number,
        default: 0,
      },
      postCount: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
    // Tags for better discoverability
    tags: [String],
    // Created by admin/moderator
    createdBy: {
      type: String,
      required: true,
    },
    // Active moderators
    moderators: [
      {
        userId: String,
        role: {
          type: String,
          enum: ["admin", "moderator"],
          default: "moderator",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Forum rules
    rules: [
      {
        title: String,
        description: String,
        order: Number,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ["active", "archived", "suspended"],
      default: "active",
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
forumSchema.index({ category: 1, region: 1 });
forumSchema.index({ privacy: 1, status: 1 });
forumSchema.index({ "stats.lastActivity": -1 });
forumSchema.index({ tags: 1 });

// Virtual for member count
forumSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

// Method to check if user can join
forumSchema.methods.canUserJoin = function (userAge) {
  if (this.status !== "active") return false;
  if (this.privacy === "private") return false;
  return userAge >= this.ageRange.min && userAge <= this.ageRange.max;
};

// Method to check if user is moderator
forumSchema.methods.isModerator = function (userId) {
  return this.moderators.some((mod) => mod.userId === userId);
};

// Static method to get forums by category
forumSchema.statics.getByCategory = function (category, region = "global") {
  return this.find({
    category,
    region: { $in: [region, "global"] },
    status: "active",
    privacy: "public",
  }).sort({ "stats.lastActivity": -1 });
};

// Static method to get trending forums
forumSchema.statics.getTrending = function (limit = 10) {
  return this.find({
    status: "active",
    privacy: "public",
  })
    .sort({ "stats.lastActivity": -1 })
    .limit(limit);
};

export default mongoose.model("Forum", forumSchema);
