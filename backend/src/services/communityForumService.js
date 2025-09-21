import languageService from "./languageService.js";
import geminiService from "./geminiService.js";
import Forum from "../models/Forum.js";
import ForumPost from "../models/ForumPost.js";
import ForumReply from "../models/ForumReply.js";

class CommunityForumService {
  constructor() {
    // Crisis keywords for detection
    this.crisisKeywords = [
      "suicide",
      "kill myself",
      "end it all",
      "not worth living",
      "hurt myself",
      "self harm",
      "cutting",
      "overdose",
      "crisis",
      "emergency",
      "help me",
      "can't take it anymore",
      "want to die",
      "better off dead",
      "no point living",
    ];

    // Resource suggestions for crisis situations
    this.crisisResources = [
      {
        name: "Suicide & Crisis Lifeline",
        number: "988",
        available: "24/7",
        description: "Free, confidential support for people in distress",
        type: "hotline",
      },
      {
        name: "Crisis Text Line",
        text: "HOME to 741741",
        available: "24/7",
        description: "Text-based crisis support",
        type: "text",
      },
      {
        name: "National Suicide Prevention Lifeline",
        number: "1-800-273-8255",
        available: "24/7",
        description: "Crisis intervention and suicide prevention",
        type: "hotline",
      },
    ];
  }

  /**
   * Create a new forum
   */
  async createForum(forumData, creatorId) {
    try {
      const forum = new Forum({
        ...forumData,
        createdBy: creatorId,
        moderators: [
          {
            userId: creatorId,
            role: "admin",
            addedAt: new Date(),
          },
        ],
      });

      await forum.save();

      return {
        success: true,
        forum,
      };
    } catch (error) {
      console.error("Error creating forum:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get forums with filtering
   */
  async getForums(options = {}) {
    try {
      const {
        category,
        region = "global",
        page = 1,
        limit = 20,
        sortBy = "stats.lastActivity",
        sortOrder = "desc",
      } = options;

      const query = {
        status: "active",
        privacy: "public",
      };

      if (category) query.category = category;
      if (region !== "global") {
        query.region = { $in: [region, "global"] };
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const forums = await Forum.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await Forum.countDocuments(query);

      return {
        success: true,
        forums,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting forums:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new forum post with AI moderation
   */
  async createPost(postData, authorId) {
    try {
      // Perform AI moderation analysis
      const moderationResult = await this.moderateContent(postData.content);

      // Check for crisis indicators
      const crisisCheck = await this.checkCrisisIndicators(postData.content);

      // Generate AI suggestions
      const aiSuggestions = await this.generatePostSuggestions(
        postData.content,
        postData.type
      );

      const post = new ForumPost({
        ...postData,
        authorId,
        moderation: {
          status: moderationResult.approved ? "approved" : "pending",
          aiAnalysis: moderationResult.analysis,
          reason: moderationResult.reason,
        },
        crisisSupport: {
          isCrisis: crisisCheck.isCrisis,
          resources: crisisCheck.isCrisis ? this.crisisResources : [],
        },
        aiSuggestions,
      });

      await post.save();

      // Update forum stats
      await this.updateForumStats(postData.forumId);

      // If crisis detected, escalate immediately
      if (crisisCheck.isCrisis) {
        await this.escalateCrisisPost(post._id, crisisCheck);
      }

      return {
        success: true,
        post,
        moderationResult,
        crisisCheck,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a reply to a forum post
   */
  async createReply(replyData, authorId, postId) {
    try {
      // Perform AI moderation analysis
      const moderationResult = await this.moderateContent(replyData.content);

      // Check for crisis indicators
      const crisisCheck = await this.checkCrisisIndicators(replyData.content);

      // Generate AI suggestions
      const aiSuggestions = await this.generateReplySuggestions(
        replyData.content,
        postId
      );

      const reply = new ForumReply({
        ...replyData,
        postId,
        authorId,
        moderation: {
          status: moderationResult.approved ? "approved" : "pending",
          aiAnalysis: moderationResult.analysis,
          reason: moderationResult.reason,
        },
        crisisSupport: {
          isCrisis: crisisCheck.isCrisis,
        },
        aiSuggestions,
      });

      await reply.save();

      // Update post reply count
      await ForumPost.findByIdAndUpdate(postId, {
        $inc: { "engagement.replies": 1 },
      });

      // If crisis detected, escalate immediately
      if (crisisCheck.isCrisis) {
        await this.escalateCrisisReply(reply._id, crisisCheck);
      }

      return {
        success: true,
        reply,
        moderationResult,
        crisisCheck,
      };
    } catch (error) {
      console.error("Error creating reply:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Moderate content using Google Cloud Natural Language API
   */
  async moderateContent(content) {
    try {
      // Use the new LanguageService for moderation
      const moderationResult = await languageService.moderateContent(content);

      return {
        approved: moderationResult.approved,
        analysis: moderationResult.analysis,
        reason: moderationResult.reason,
        confidence: moderationResult.confidence,
      };
    } catch (error) {
      console.error("Error moderating content:", error);
      return {
        approved: true, // Default to approved if moderation fails
        analysis: {
          toxicityScore: 0,
          sentiment: { score: 0, magnitude: 0 },
          entities: [],
          categories: [],
          confidence: 0,
        },
        reason: "Moderation unavailable, content approved by default",
      };
    }
  }

  /**
   * Check for crisis indicators in content
   */
  async checkCrisisIndicators(content) {
    try {
      const lowerContent = content.toLowerCase();
      const crisisIndicators = this.crisisKeywords.filter((keyword) =>
        lowerContent.includes(keyword.toLowerCase())
      );

      const isCrisis = crisisIndicators.length > 0;

      return {
        isCrisis,
        indicators: crisisIndicators,
        severity: this.calculateCrisisSeverity(crisisIndicators),
        resources: isCrisis ? this.crisisResources : [],
      };
    } catch (error) {
      console.error("Error checking crisis indicators:", error);
      return {
        isCrisis: false,
        indicators: [],
        severity: "low",
        resources: [],
      };
    }
  }

  /**
   * Generate AI suggestions for posts
   */
  async generatePostSuggestions(content, postType) {
    try {
      const prompt = `Based on this forum post, generate helpful suggestions:

Post Type: ${postType}
Content: "${content}"

Please provide:
1. 3-5 reply suggestions for other users
2. Relevant resources or articles
3. Similar users who might relate (peer matching)

Respond in JSON format with keys: replySuggestions, resourceSuggestions, peerMatches`;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch (parseError) {
        return {
          replySuggestions: [
            "I understand how you're feeling",
            "You're not alone in this",
            "Thank you for sharing your experience",
          ],
          resourceSuggestions: [],
          peerMatches: [],
        };
      }
    } catch (error) {
      console.error("Error generating post suggestions:", error);
      return {
        replySuggestions: [],
        resourceSuggestions: [],
        peerMatches: [],
      };
    }
  }

  /**
   * Generate AI suggestions for replies
   */
  async generateReplySuggestions(content, postId) {
    try {
      // Get the original post for context
      const originalPost = await ForumPost.findById(postId);

      const prompt = `Based on this forum reply, generate helpful suggestions:

Original Post: "${originalPost?.content || ""}"
Reply Content: "${content}"

Please provide:
1. 2-3 follow-up reply suggestions
2. Relevant resources or articles

Respond in JSON format with keys: replySuggestions, resourceSuggestions`;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch (parseError) {
        return {
          replySuggestions: [
            "That's a great point",
            "I can relate to that",
            "Thank you for your perspective",
          ],
          resourceSuggestions: [],
        };
      }
    } catch (error) {
      console.error("Error generating reply suggestions:", error);
      return {
        replySuggestions: [],
        resourceSuggestions: [],
      };
    }
  }

  /**
   * Calculate toxicity score based on content analysis
   */
  calculateToxicityScore(content, sentimentResult, entityResult) {
    let score = 0;

    // Negative sentiment contributes to toxicity
    if (sentimentResult.documentSentiment.score < -0.5) {
      score += 0.3;
    }

    // High magnitude negative sentiment
    if (
      sentimentResult.documentSentiment.magnitude > 0.8 &&
      sentimentResult.documentSentiment.score < 0
    ) {
      score += 0.2;
    }

    // Check for potentially harmful entities
    const harmfulEntities = ["PERSON", "ORGANIZATION"];
    const harmfulCount = entityResult.entities.filter(
      (entity) => harmfulEntities.includes(entity.type) && entity.salience > 0.1
    ).length;

    if (harmfulCount > 2) {
      score += 0.2;
    }

    // Check for profanity or harmful words (simplified)
    const harmfulWords = ["hate", "stupid", "idiot", "worthless", "useless"];
    const harmfulWordCount = harmfulWords.filter((word) =>
      content.toLowerCase().includes(word)
    ).length;

    score += harmfulWordCount * 0.1;

    return Math.min(score, 1); // Cap at 1
  }

  /**
   * Calculate crisis severity based on indicators
   */
  calculateCrisisSeverity(indicators) {
    const highSeverityKeywords = [
      "suicide",
      "kill myself",
      "end it all",
      "want to die",
    ];
    const mediumSeverityKeywords = [
      "hurt myself",
      "self harm",
      "can't take it anymore",
    ];

    const hasHighSeverity = indicators.some((indicator) =>
      highSeverityKeywords.includes(indicator.toLowerCase())
    );

    const hasMediumSeverity = indicators.some((indicator) =>
      mediumSeverityKeywords.includes(indicator.toLowerCase())
    );

    if (hasHighSeverity) return "high";
    if (hasMediumSeverity) return "medium";
    return "low";
  }

  /**
   * Escalate crisis post
   */
  async escalateCrisisPost(postId, crisisCheck) {
    try {
      await ForumPost.findByIdAndUpdate(postId, {
        "crisisSupport.escalated": true,
        "crisisSupport.escalatedAt": new Date(),
        "crisisSupport.escalatedTo": "crisis-team",
        "moderation.status": "approved", // Allow crisis posts to be visible for immediate support
      });

      // In a real implementation, you would:
      // 1. Send notification to crisis team
      // 2. Create alert in monitoring system
      // 3. Log the escalation

      console.log(`Crisis post escalated: ${postId}`, crisisCheck);
    } catch (error) {
      console.error("Error escalating crisis post:", error);
    }
  }

  /**
   * Escalate crisis reply
   */
  async escalateCrisisReply(replyId, crisisCheck) {
    try {
      await ForumReply.findByIdAndUpdate(replyId, {
        "crisisSupport.escalated": true,
        "crisisSupport.escalatedAt": new Date(),
        "crisisSupport.escalatedTo": "crisis-team",
        "moderation.status": "approved",
      });

      console.log(`Crisis reply escalated: ${replyId}`, crisisCheck);
    } catch (error) {
      console.error("Error escalating crisis reply:", error);
    }
  }

  /**
   * Update forum statistics
   */
  async updateForumStats(forumId) {
    try {
      const postCount = await ForumPost.countDocuments({
        forumId,
        status: "active",
        "moderation.status": "approved",
      });

      const lastActivity = await ForumPost.findOne({
        forumId,
        status: "active",
        "moderation.status": "approved",
      }).sort({ createdAt: -1 });

      await Forum.findByIdAndUpdate(forumId, {
        "stats.postCount": postCount,
        "stats.lastActivity": lastActivity?.createdAt || new Date(),
      });
    } catch (error) {
      console.error("Error updating forum stats:", error);
    }
  }

  /**
   * Get posts for a forum
   */
  async getForumPosts(forumId, options = {}) {
    try {
      const posts = await ForumPost.getByForum(forumId, options);
      const total = await ForumPost.countDocuments({
        forumId,
        status: "active",
        "moderation.status": "approved",
      });

      return {
        success: true,
        posts,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 20,
          total,
          pages: Math.ceil(total / (options.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting forum posts:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get replies for a post
   */
  async getPostReplies(postId, options = {}) {
    try {
      const replies = await ForumReply.getByPost(postId, options);
      const total = await ForumReply.countDocuments({
        postId,
        status: "active",
        "moderation.status": "approved",
      });

      return {
        success: true,
        replies,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 20,
          total,
          pages: Math.ceil(total / (options.limit || 20)),
        },
      };
    } catch (error) {
      console.error("Error getting post replies:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Like/unlike a post
   */
  async togglePostLike(postId, userId) {
    try {
      const post = await ForumPost.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      const wasLiked = post.interactions.likedBy.includes(userId);

      if (wasLiked) {
        post.removeLike(userId);
      } else {
        post.addLike(userId);
      }

      await post.save();

      return {
        success: true,
        liked: !wasLiked,
        likeCount: post.engagement.likes,
      };
    } catch (error) {
      console.error("Error toggling post like:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Report a post
   */
  async reportPost(postId, userId, reason) {
    try {
      const post = await ForumPost.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      const reported = post.reportPost(userId, reason);
      await post.save();

      return {
        success: true,
        reported,
      };
    } catch (error) {
      console.error("Error reporting post:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get crisis posts for moderation
   */
  async getCrisisPosts() {
    try {
      const posts = await ForumPost.getCrisisPosts();
      return {
        success: true,
        posts,
      };
    } catch (error) {
      console.error("Error getting crisis posts:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit = 10) {
    try {
      const posts = await ForumPost.getTrending(limit);
      return {
        success: true,
        posts,
      };
    } catch (error) {
      console.error("Error getting trending posts:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new CommunityForumService();
