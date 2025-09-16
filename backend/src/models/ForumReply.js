import mongoose from "mongoose";

const forumReplySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    // Anonymous reply option
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Reply content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Reply type
    type: {
      type: String,
      enum: ["reply", "support", "advice", "question", "celebration"],
      default: "reply",
    },
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
    },
    // User interactions
    interactions: {
      likedBy: [String],
      reportedBy: [String],
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
    },
    // AI-generated suggestions for further replies
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
forumReplySchema.index({ postId: 1, createdAt: -1 });
forumReplySchema.index({ authorId: 1, createdAt: -1 });
forumReplySchema.index({ "moderation.status": 1 });
forumReplySchema.index({ "crisisSupport.isCrisis": 1 });

// Virtual for author display name
forumReplySchema.virtual("authorDisplayName").get(function () {
  return this.isAnonymous
    ? "Anonymous User"
    : `User ${this.authorId.slice(-4)}`;
});

// Method to check if user can edit
forumReplySchema.methods.canUserEdit = function (userId) {
  return this.authorId === userId && this.status === "active";
};

// Method to add like
forumReplySchema.methods.addLike = function (userId) {
  if (!this.interactions.likedBy.includes(userId)) {
    this.interactions.likedBy.push(userId);
    this.engagement.likes += 1;
    return true;
  }
  return false;
};

// Method to remove like
forumReplySchema.methods.removeLike = function (userId) {
  const index = this.interactions.likedBy.indexOf(userId);
  if (index > -1) {
    this.interactions.likedBy.splice(index, 1);
    this.engagement.likes -= 1;
    return true;
  }
  return false;
};

// Static method to get replies by post
forumReplySchema.statics.getByPost = function (postId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "asc",
  } = options;

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find({
    postId,
    status: "active",
    "moderation.status": "approved",
  })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

export default mongoose.model("ForumReply", forumReplySchema);
