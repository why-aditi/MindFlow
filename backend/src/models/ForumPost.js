import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    // Anonymous posting option
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Post content
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    // Post type
    type: {
      type: String,
      enum: [
        "discussion",
        "question",
        "support",
        "celebration",
        "advice",
        "crisis",
      ],
      default: "discussion",
    },
    // Tags for categorization
    tags: [String],
    // Media attachments
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "audio", "document"],
        },
        url: String,
        filename: String,
        size: Number,
        mimeType: String,
      },
    ],
    // Moderation status
    moderation: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "flagged"],
        default: "pending",
      },
      reviewedBy: String,
      reviewedAt: Date,
      reason: String,
      // AI moderation results
      aiAnalysis: {
        toxicityScore: Number,
        crisisIndicators: [String],
        sentiment: {
          score: Number,
          magnitude: Number,
        },
        categories: [String],
        confidence: Number,
      },
    },
    // Engagement metrics
    engagement: {
      likes: {
        type: Number,
        default: 0,
      },
      replies: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
    // User interactions
    interactions: {
      likedBy: [String],
      reportedBy: [String],
      bookmarkedBy: [String],
    },
    // Crisis support flags
    crisisSupport: {
      isCrisis: {
        type: Boolean,
        default: false,
      },
      escalated: {
        type: Boolean,
        default: false,
      },
      escalatedAt: Date,
      escalatedTo: String,
      resources: [
        {
          name: String,
          url: String,
          type: String,
        },
      ],
    },
    // AI-generated suggestions
    aiSuggestions: {
      replySuggestions: [String],
      resourceSuggestions: [
        {
          title: String,
          description: String,
          url: String,
          type: String,
        },
      ],
      peerMatches: [String], // User IDs of people with similar experiences
    },
    // Status
    status: {
      type: String,
      enum: ["active", "archived", "deleted", "hidden"],
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
forumPostSchema.index({ forumId: 1, createdAt: -1 });
forumPostSchema.index({ authorId: 1, createdAt: -1 });
forumPostSchema.index({ "moderation.status": 1 });
forumPostSchema.index({ "crisisSupport.isCrisis": 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ type: 1 });

// Virtual for author display name
forumPostSchema.virtual("authorDisplayName").get(function () {
  return this.isAnonymous
    ? "Anonymous User"
    : `User ${this.authorId.slice(-4)}`;
});

// Method to check if user can edit
forumPostSchema.methods.canUserEdit = function (userId) {
  return this.authorId === userId && this.status === "active";
};

// Method to check if user can delete
forumPostSchema.methods.canUserDelete = function (userId) {
  return this.authorId === userId || this.status === "active";
};

// Method to add like
forumPostSchema.methods.addLike = function (userId) {
  if (!this.interactions.likedBy.includes(userId)) {
    this.interactions.likedBy.push(userId);
    this.engagement.likes += 1;
    return true;
  }
  return false;
};

// Method to remove like
forumPostSchema.methods.removeLike = function (userId) {
  const index = this.interactions.likedBy.indexOf(userId);
  if (index > -1) {
    this.interactions.likedBy.splice(index, 1);
    this.engagement.likes -= 1;
    return true;
  }
  return false;
};

// Method to report post
forumPostSchema.methods.reportPost = function (userId, reason) {
  if (!this.interactions.reportedBy.includes(userId)) {
    this.interactions.reportedBy.push(userId);
    this.moderation.status = "flagged";
    return true;
  }
  return false;
};

// Static method to get posts by forum
forumPostSchema.statics.getByForum = function (forumId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    tags,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const query = {
    forumId,
    status: "active",
    "moderation.status": "approved",
  };

  if (type) query.type = type;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query).sort(sortOptions).skip(skip).limit(limit);
};

// Static method to get crisis posts
forumPostSchema.statics.getCrisisPosts = function () {
  return this.find({
    "crisisSupport.isCrisis": true,
    "crisisSupport.escalated": false,
    status: "active",
  }).sort({ createdAt: -1 });
};

// Static method to get trending posts
forumPostSchema.statics.getTrending = function (limit = 10) {
  return this.find({
    status: "active",
    "moderation.status": "approved",
  })
    .sort({ "engagement.likes": -1, createdAt: -1 })
    .limit(limit);
};

export default mongoose.model("ForumPost", forumPostSchema);
