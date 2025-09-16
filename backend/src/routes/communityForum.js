import express from "express";
import { communityForumController } from "../controllers/communityForumController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/community-forums:
 *   post:
 *     summary: Create a new forum
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Forum name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Forum description
 *               category:
 *                 type: string
 *                 enum: [general, anxiety, depression, relationships, academic, family, self-care, crisis-support]
 *                 description: Forum category
 *               region:
 *                 type: string
 *                 enum: [global, north-america, europe, asia, oceania, africa, south-america]
 *                 default: global
 *                 description: Forum region
 *               privacy:
 *                 type: string
 *                 enum: [public, private, invite-only]
 *                 default: public
 *                 description: Forum privacy setting
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Forum tags
 *     responses:
 *       201:
 *         description: Forum created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Name is required and must be less than 100 characters"),
    body("description")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage(
        "Description is required and must be less than 500 characters"
      ),
    body("category")
      .isIn([
        "general",
        "anxiety",
        "depression",
        "relationships",
        "academic",
        "family",
        "self-care",
        "crisis-support",
      ])
      .withMessage("Invalid category"),
    body("region")
      .optional()
      .isIn([
        "global",
        "north-america",
        "europe",
        "asia",
        "oceania",
        "africa",
        "south-america",
      ])
      .withMessage("Invalid region"),
    body("privacy")
      .optional()
      .isIn(["public", "private", "invite-only"])
      .withMessage("Invalid privacy setting"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  validateRequest,
  communityForumController.createForum
);

/**
 * @swagger
 * /api/community-forums:
 *   get:
 *     summary: Get forums with filtering
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, anxiety, depression, relationships, academic, family, self-care, crisis-support]
 *         description: Filter by category
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [global, north-america, europe, asia, oceania, africa, south-america]
 *           default: global
 *         description: Filter by region
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of forums per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: stats.lastActivity
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Forums retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 forums:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Forum'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  [
    query("category")
      .optional()
      .isIn([
        "general",
        "anxiety",
        "depression",
        "relationships",
        "academic",
        "family",
        "self-care",
        "crisis-support",
      ])
      .withMessage("Invalid category"),
    query("region")
      .optional()
      .isIn([
        "global",
        "north-america",
        "europe",
        "asia",
        "oceania",
        "africa",
        "south-america",
      ])
      .withMessage("Invalid region"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn([
        "stats.lastActivity",
        "stats.memberCount",
        "stats.postCount",
        "createdAt",
      ])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
  ],
  validateRequest,
  communityForumController.getForums
);

// Alias route for frontend compatibility
router.get(
  "/forums",
  [
    query("category")
      .optional()
      .isIn([
        "general",
        "anxiety",
        "depression",
        "relationships",
        "academic",
        "family",
        "self-care",
        "crisis-support",
      ])
      .withMessage("Invalid category"),
    query("region")
      .optional()
      .isIn([
        "global",
        "north-america",
        "europe",
        "asia",
        "oceania",
        "africa",
        "south-america",
      ])
      .withMessage("Invalid region"),
    query("privacy")
      .optional()
      .isIn(["public", "private", "invite-only"])
      .withMessage("Invalid privacy setting"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn([
        "stats.lastActivity",
        "stats.memberCount",
        "stats.postCount",
        "createdAt",
      ])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
  ],
  validateRequest,
  communityForumController.getForums
);

/**
 * @swagger
 * /api/community-forums/categories:
 *   get:
 *     summary: Get forum categories
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/categories", communityForumController.getForumCategories);

/**
 * @swagger
 * /api/community-forums/stats:
 *   get:
 *     summary: Get forum statistics
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalForums:
 *                       type: integer
 *                     totalPosts:
 *                       type: integer
 *                     totalReplies:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/stats", communityForumController.getForumStats);

/**
 * @swagger
 * /api/community-forums/{id}:
 *   get:
 *     summary: Get single forum
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Forum ID
 *     responses:
 *       200:
 *         description: Forum retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
 *       404:
 *         description: Forum not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid forum ID")],
  validateRequest,
  communityForumController.getForum
);

/**
 * @swagger
 * /api/community-forums/{forumId}/posts:
 *   post:
 *     summary: Create a new forum post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: Forum ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Post title
 *               content:
 *                 type: string
 *                 maxLength: 8000
 *                 description: Post content
 *               type:
 *                 type: string
 *                 enum: [discussion, question, support, celebration, advice, crisis]
 *                 default: discussion
 *                 description: Post type
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Post tags
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to post anonymously
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/ForumPost'
 *                 moderationResult:
 *                   type: object
 *                 crisisCheck:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/:forumId/posts",
  [
    param("forumId").isMongoId().withMessage("Invalid forum ID"),
    body("title")
      .notEmpty()
      .isLength({ max: 200 })
      .withMessage("Title is required and must be less than 200 characters"),
    body("content")
      .notEmpty()
      .isLength({ max: 8000 })
      .withMessage("Content is required and must be less than 8000 characters"),
    body("type")
      .optional()
      .isIn([
        "discussion",
        "question",
        "support",
        "celebration",
        "advice",
        "crisis",
      ])
      .withMessage("Invalid post type"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isAnonymous")
      .optional()
      .isBoolean()
      .withMessage("isAnonymous must be a boolean"),
  ],
  validateRequest,
  communityForumController.createPost
);

/**
 * @swagger
 * /api/community-forums/{forumId}/posts:
 *   get:
 *     summary: Get posts for a forum
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: Forum ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [discussion, question, support, celebration, advice, crisis]
 *         description: Filter by post type
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumPost'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get(
  "/:forumId/posts",
  [
    param("forumId").isMongoId().withMessage("Invalid forum ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("type")
      .optional()
      .isIn([
        "discussion",
        "question",
        "support",
        "celebration",
        "advice",
        "crisis",
      ])
      .withMessage("Invalid post type"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "engagement.likes", "engagement.views"])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
  ],
  validateRequest,
  communityForumController.getForumPosts
);

/**
 * @swagger
 * /api/community-forums/posts/{id}:
 *   get:
 *     summary: Get single post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/ForumPost'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get(
  "/posts/:id",
  [param("id").isMongoId().withMessage("Invalid post ID")],
  validateRequest,
  communityForumController.getPost
);

/**
 * @swagger
 * /api/community-forums/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 maxLength: 8000
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isAnonymous:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/ForumPost'
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - can only edit own posts
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put(
  "/posts/:id",
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    body("title")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("content")
      .optional()
      .isLength({ max: 8000 })
      .withMessage("Content must be less than 8000 characters"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isAnonymous")
      .optional()
      .isBoolean()
      .withMessage("isAnonymous must be a boolean"),
  ],
  validateRequest,
  communityForumController.updatePost
);

/**
 * @swagger
 * /api/community-forums/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - can only delete own posts
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/posts/:id",
  [param("id").isMongoId().withMessage("Invalid post ID")],
  validateRequest,
  communityForumController.deletePost
);

/**
 * @swagger
 * /api/community-forums/posts/{postId}/replies:
 *   post:
 *     summary: Create a reply to a post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Reply content
 *               type:
 *                 type: string
 *                 enum: [reply, support, advice, question, celebration]
 *                 default: reply
 *                 description: Reply type
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reply anonymously
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reply:
 *                   $ref: '#/components/schemas/ForumReply'
 *                 moderationResult:
 *                   type: object
 *                 crisisCheck:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/posts/:postId/replies",
  [
    param("postId").isMongoId().withMessage("Invalid post ID"),
    body("content")
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage("Content is required and must be less than 2000 characters"),
    body("type")
      .optional()
      .isIn(["reply", "support", "advice", "question", "celebration"])
      .withMessage("Invalid reply type"),
    body("isAnonymous")
      .optional()
      .isBoolean()
      .withMessage("isAnonymous must be a boolean"),
  ],
  validateRequest,
  communityForumController.createReply
);

/**
 * @swagger
 * /api/community-forums/posts/{postId}/replies:
 *   get:
 *     summary: Get replies for a post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of replies per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 replies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumReply'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get(
  "/posts/:postId/replies",
  [
    param("postId").isMongoId().withMessage("Invalid post ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "engagement.likes"])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
  ],
  validateRequest,
  communityForumController.getPostReplies
);

/**
 * @swagger
 * /api/community-forums/posts/{postId}/like:
 *   post:
 *     summary: Like/unlike a post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 liked:
 *                   type: boolean
 *                 likeCount:
 *                   type: integer
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post(
  "/posts/:postId/like",
  [param("postId").isMongoId().withMessage("Invalid post ID")],
  validateRequest,
  communityForumController.togglePostLike
);

/**
 * @swagger
 * /api/community-forums/posts/{postId}/report:
 *   post:
 *     summary: Report a post
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for reporting
 *     responses:
 *       200:
 *         description: Post reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reported:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post(
  "/posts/:postId/report",
  [
    param("postId").isMongoId().withMessage("Invalid post ID"),
    body("reason").notEmpty().withMessage("Reason is required"),
  ],
  validateRequest,
  communityForumController.reportPost
);

/**
 * @swagger
 * /api/community-forums/posts/trending:
 *   get:
 *     summary: Get trending posts
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of trending posts to retrieve
 *     responses:
 *       200:
 *         description: Trending posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumPost'
 *       500:
 *         description: Server error
 */
router.get(
  "/posts/trending",
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  validateRequest,
  communityForumController.getTrendingPosts
);

/**
 * @swagger
 * /api/community-forums/posts/crisis:
 *   get:
 *     summary: Get crisis posts (moderators only)
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Crisis posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumPost'
 *       403:
 *         description: Forbidden - moderator privileges required
 *       500:
 *         description: Server error
 */
router.get("/posts/crisis", communityForumController.getCrisisPosts);

/**
 * @swagger
 * /api/community-forums/user/posts:
 *   get:
 *     summary: Get user's posts
 *     tags: [Community Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ForumPost'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get(
  "/user/posts",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "engagement.likes", "engagement.views"])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
  ],
  validateRequest,
  communityForumController.getUserPosts
);

export default router;
