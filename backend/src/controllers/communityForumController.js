import communityForumService from "../services/communityForumService.js";
import Forum from "../models/Forum.js";
import ForumPost from "../models/ForumPost.js";
import ForumReply from "../models/ForumReply.js";

export const communityForumController = {
  /**
   * Create a new forum
   */
  async createForum(req, res) {
    try {
      const { uid } = req.user;
      const forumData = req.body;

      // Validate required fields
      if (!forumData.name || !forumData.description || !forumData.category) {
        return res.status(400).json({
          error: "name, description, and category are required",
        });
      }

      const result = await communityForumService.createForum(forumData, uid);

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        forum: result.forum,
        message: "Forum created successfully",
      });
    } catch (error) {
      console.error("Create forum error:", error);
      res.status(500).json({
        error: "Failed to create forum",
        message: error.message,
      });
    }
  },

  /**
   * Get forums with filtering
   */
  async getForums(req, res) {
    try {
      const {
        category,
        region = "global",
        page = 1,
        limit = 20,
        sortBy = "stats.lastActivity",
        sortOrder = "desc",
      } = req.query;

      const result = await communityForumService.getForums({
        category,
        region,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        forums: result.forums,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get forums error:", error);
      res.status(500).json({
        error: "Failed to get forums",
        message: error.message,
      });
    }
  },

  /**
   * Get single forum
   */
  async getForum(req, res) {
    try {
      const { id } = req.params;

      const forum = await Forum.findById(id);

      if (!forum) {
        return res.status(404).json({
          error: "Forum not found",
        });
      }

      res.json({
        success: true,
        forum,
      });
    } catch (error) {
      console.error("Get forum error:", error);
      res.status(500).json({
        error: "Failed to get forum",
        message: error.message,
      });
    }
  },

  /**
   * Create a new forum post
   */
  async createPost(req, res) {
    try {
      const { uid } = req.user;
      const postData = req.body;

      // Validate required fields
      if (!postData.forumId || !postData.title || !postData.content) {
        return res.status(400).json({
          error: "forumId, title, and content are required",
        });
      }

      const result = await communityForumService.createPost(postData, uid);

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        post: result.post,
        moderationResult: result.moderationResult,
        crisisCheck: result.crisisCheck,
        message: "Post created successfully",
      });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({
        error: "Failed to create post",
        message: error.message,
      });
    }
  },

  /**
   * Get posts for a forum
   */
  async getForumPosts(req, res) {
    try {
      const { forumId } = req.params;
      const {
        page = 1,
        limit = 20,
        type,
        tags,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const result = await communityForumService.getForumPosts(forumId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        tags: tags ? tags.split(",") : undefined,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        posts: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get forum posts error:", error);
      res.status(500).json({
        error: "Failed to get forum posts",
        message: error.message,
      });
    }
  },

  /**
   * Get single post
   */
  async getPost(req, res) {
    try {
      const { id } = req.params;

      const post = await ForumPost.findById(id)
        .populate("forumId", "name category")
        .populate("authorId", "displayName email");

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      // Increment view count
      post.engagement.views += 1;
      await post.save();

      res.json({
        success: true,
        post,
      });
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({
        error: "Failed to get post",
        message: error.message,
      });
    }
  },

  /**
   * Create a reply to a post
   */
  async createReply(req, res) {
    try {
      const { uid } = req.user;
      const { postId } = req.params;
      const replyData = req.body;

      // Validate required fields
      if (!replyData.content) {
        return res.status(400).json({
          error: "content is required",
        });
      }

      const result = await communityForumService.createReply(
        replyData,
        uid,
        postId
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        reply: result.reply,
        moderationResult: result.moderationResult,
        crisisCheck: result.crisisCheck,
        message: "Reply created successfully",
      });
    } catch (error) {
      console.error("Create reply error:", error);
      res.status(500).json({
        error: "Failed to create reply",
        message: error.message,
      });
    }
  },

  /**
   * Get replies for a post
   */
  async getPostReplies(req, res) {
    try {
      const { postId } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "asc",
      } = req.query;

      const result = await communityForumService.getPostReplies(postId, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        replies: result.replies,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get post replies error:", error);
      res.status(500).json({
        error: "Failed to get post replies",
        message: error.message,
      });
    }
  },

  /**
   * Like/unlike a post
   */
  async togglePostLike(req, res) {
    try {
      const { uid } = req.user;
      const { postId } = req.params;

      const result = await communityForumService.togglePostLike(postId, uid);

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        liked: result.liked,
        likeCount: result.likeCount,
      });
    } catch (error) {
      console.error("Toggle post like error:", error);
      res.status(500).json({
        error: "Failed to toggle post like",
        message: error.message,
      });
    }
  },

  /**
   * Report a post
   */
  async reportPost(req, res) {
    try {
      const { uid } = req.user;
      const { postId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          error: "reason is required",
        });
      }

      const result = await communityForumService.reportPost(
        postId,
        uid,
        reason
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        reported: result.reported,
        message: "Post reported successfully",
      });
    } catch (error) {
      console.error("Report post error:", error);
      res.status(500).json({
        error: "Failed to report post",
        message: error.message,
      });
    }
  },

  /**
   * Get trending posts
   */
  async getTrendingPosts(req, res) {
    try {
      const { limit = 10 } = req.query;

      const result = await communityForumService.getTrendingPosts(
        parseInt(limit)
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        posts: result.posts,
      });
    } catch (error) {
      console.error("Get trending posts error:", error);
      res.status(500).json({
        error: "Failed to get trending posts",
        message: error.message,
      });
    }
  },

  /**
   * Get crisis posts (for moderators)
   */
  async getCrisisPosts(req, res) {
    try {
      const { uid } = req.user;

      // Check if user is a moderator (simplified check)
      // In production, you'd have proper role-based access control
      const isModerator = true; // Placeholder

      if (!isModerator) {
        return res.status(403).json({
          error: "Access denied. Moderator privileges required.",
        });
      }

      const result = await communityForumService.getCrisisPosts();

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        success: true,
        posts: result.posts,
      });
    } catch (error) {
      console.error("Get crisis posts error:", error);
      res.status(500).json({
        error: "Failed to get crisis posts",
        message: error.message,
      });
    }
  },

  /**
   * Get user's posts
   */
  async getUserPosts(req, res) {
    try {
      const { uid } = req.user;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const posts = await ForumPost.find({
        authorId: uid,
        status: "active",
      })
        .populate("forumId", "name category")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ForumPost.countDocuments({
        authorId: uid,
        status: "active",
      });

      res.json({
        success: true,
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({
        error: "Failed to get user posts",
        message: error.message,
      });
    }
  },

  /**
   * Update post
   */
  async updatePost(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const updateData = req.body;

      const post = await ForumPost.findById(id);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      if (!post.canUserEdit(uid)) {
        return res.status(403).json({
          error: "You can only edit your own posts",
        });
      }

      // Re-moderate content if it was changed
      if (updateData.content && updateData.content !== post.content) {
        const moderationResult = await communityForumService.moderateContent(
          updateData.content
        );
        updateData.moderation = {
          status: moderationResult.approved ? "approved" : "pending",
          aiAnalysis: moderationResult.analysis,
          reason: moderationResult.reason,
        };
      }

      const updatedPost = await ForumPost.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      res.json({
        success: true,
        post: updatedPost,
        message: "Post updated successfully",
      });
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({
        error: "Failed to update post",
        message: error.message,
      });
    }
  },

  /**
   * Delete post
   */
  async deletePost(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const post = await ForumPost.findById(id);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      if (!post.canUserDelete(uid)) {
        return res.status(403).json({
          error: "You can only delete your own posts",
        });
      }

      await ForumPost.findByIdAndUpdate(id, {
        status: "deleted",
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({
        error: "Failed to delete post",
        message: error.message,
      });
    }
  },

  /**
   * Get forum categories
   */
  async getForumCategories(req, res) {
    try {
      const categories = [
        {
          id: "general",
          name: "General Discussion",
          description: "General topics and conversations",
        },
        {
          id: "anxiety",
          name: "Anxiety Support",
          description: "Support for anxiety-related concerns",
        },
        {
          id: "depression",
          name: "Depression Support",
          description: "Support for depression-related concerns",
        },
        {
          id: "relationships",
          name: "Relationships",
          description: "Friendship, family, and romantic relationships",
        },
        {
          id: "academic",
          name: "Academic Stress",
          description: "School, college, and academic pressures",
        },
        {
          id: "family",
          name: "Family Issues",
          description: "Family dynamics and challenges",
        },
        {
          id: "self-care",
          name: "Self-Care",
          description: "Wellness, self-care, and personal growth",
        },
        {
          id: "crisis-support",
          name: "Crisis Support",
          description: "Immediate support for crisis situations",
        },
      ];

      res.json({
        success: true,
        categories,
      });
    } catch (error) {
      console.error("Get forum categories error:", error);
      res.status(500).json({
        error: "Failed to get forum categories",
        message: error.message,
      });
    }
  },

  /**
   * Get forum statistics
   */
  async getForumStats(req, res) {
    try {
      const [totalForums, totalPosts, totalReplies, activeUsers] =
        await Promise.all([
          Forum.countDocuments({ status: "active" }),
          ForumPost.countDocuments({
            status: "active",
            "moderation.status": "approved",
          }),
          ForumReply.countDocuments({
            status: "active",
            "moderation.status": "approved",
          }),
          ForumPost.distinct("authorId", { status: "active" }),
        ]);

      res.json({
        success: true,
        stats: {
          totalForums,
          totalPosts,
          totalReplies,
          activeUsers: activeUsers.length,
        },
      });
    } catch (error) {
      console.error("Get forum stats error:", error);
      res.status(500).json({
        error: "Failed to get forum stats",
        message: error.message,
      });
    }
  },
};
