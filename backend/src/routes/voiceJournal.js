import express from "express";
import { voiceJournalController } from "../controllers/voiceJournalController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/voice-journal/upload-url:
 *   post:
 *     summary: Generate signed URL for audio upload
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - mimeType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Name of the audio file
 *               mimeType:
 *                 type: string
 *                 description: MIME type of the audio file
 *                 enum: [audio/wav, audio/mp3, audio/mpeg, audio/webm, audio/ogg, audio/flac]
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 uploadUrl:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 bucketName:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/upload-url",
  [
    body("fileName").notEmpty().withMessage("fileName is required"),
    body("mimeType")
      .isIn([
        "audio/wav",
        "audio/mp3",
        "audio/mpeg",
        "audio/webm",
        "audio/ogg",
        "audio/flac",
      ])
      .withMessage("Invalid mimeType"),
  ],
  validateRequest,
  voiceJournalController.generateUploadUrl
);

/**
 * @swagger
 * /api/voice-journal/process:
 *   post:
 *     summary: Process uploaded audio file and create voice journal entry
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - mimeType
 *               - fileSize
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Name of the uploaded audio file
 *               mimeType:
 *                 type: string
 *                 description: MIME type of the audio file
 *               fileSize:
 *                 type: number
 *                 description: Size of the audio file in bytes
 *               sessionId:
 *                 type: string
 *                 description: Optional AI session ID
 *     responses:
 *       200:
 *         description: Audio file processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entry:
 *                   $ref: '#/components/schemas/VoiceJournalEntry'
 *                 sessionId:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/process",
  [
    body("fileName").notEmpty().withMessage("fileName is required"),
    body("mimeType").notEmpty().withMessage("mimeType is required"),
    body("fileSize").isNumeric().withMessage("fileSize must be a number"),
    body("sessionId").optional().isMongoId().withMessage("Invalid sessionId"),
  ],
  validateRequest,
  voiceJournalController.processAudioFile
);

/**
 * @swagger
 * /api/voice-journal/entries:
 *   get:
 *     summary: Get user's voice journal entries
 *     tags: [Voice Journaling]
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
 *           default: 10
 *         description: Number of entries per page
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
 *       - in: query
 *         name: moodMin
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Minimum mood score filter
 *       - in: query
 *         name: moodMax
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Maximum mood score filter
 *       - in: query
 *         name: themes
 *         schema:
 *           type: string
 *         description: Comma-separated list of themes to filter by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (ISO 8601)
 *     responses:
 *       200:
 *         description: Voice journal entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoiceJournalEntry'
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
  "/entries",
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
      .isIn(["createdAt", "aiAnalysis.moodScore", "audioFile.duration"])
      .withMessage("Invalid sortBy field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sortOrder"),
    query("moodMin")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("MoodMin must be between 1 and 10"),
    query("moodMax")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("MoodMax must be between 1 and 10"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid startDate format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid endDate format"),
  ],
  validateRequest,
  voiceJournalController.getVoiceEntries
);

/**
 * @swagger
 * /api/voice-journal/entries/{id}:
 *   get:
 *     summary: Get single voice journal entry
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voice journal entry ID
 *     responses:
 *       200:
 *         description: Voice journal entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entry:
 *                   $ref: '#/components/schemas/VoiceJournalEntry'
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.get(
  "/entries/:id",
  [param("id").isMongoId().withMessage("Invalid entry ID")],
  validateRequest,
  voiceJournalController.getVoiceEntry
);

/**
 * @swagger
 * /api/voice-journal/analytics:
 *   get:
 *     summary: Get voice journal analytics
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     totalEntries:
 *                       type: integer
 *                     totalDuration:
 *                       type: number
 *                     averageDuration:
 *                       type: number
 *                     moodTrends:
 *                       type: array
 *                     emotionDistribution:
 *                       type: object
 *                     themeFrequency:
 *                       type: object
 *                     speakingPatterns:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get(
  "/analytics",
  [
    query("timeRange")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Invalid timeRange"),
  ],
  validateRequest,
  voiceJournalController.getVoiceAnalytics
);

/**
 * @swagger
 * /api/voice-journal/entries/{id}:
 *   put:
 *     summary: Update voice journal entry
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voice journal entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               privacy:
 *                 type: string
 *                 enum: [private, anonymous-research]
 *               memoryTags:
 *                 type: object
 *                 properties:
 *                   episodic:
 *                     type: array
 *                     items:
 *                       type: string
 *                   semantic:
 *                     type: array
 *                     items:
 *                       type: string
 *                   contextual:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entry:
 *                   $ref: '#/components/schemas/VoiceJournalEntry'
 *                 message:
 *                   type: string
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.put(
  "/entries/:id",
  [
    param("id").isMongoId().withMessage("Invalid entry ID"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("privacy")
      .optional()
      .isIn(["private", "anonymous-research"])
      .withMessage("Invalid privacy setting"),
    body("memoryTags")
      .optional()
      .isObject()
      .withMessage("MemoryTags must be an object"),
  ],
  validateRequest,
  voiceJournalController.updateVoiceEntry
);

/**
 * @swagger
 * /api/voice-journal/entries/{id}:
 *   delete:
 *     summary: Delete voice journal entry
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voice journal entry ID
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/entries/:id",
  [param("id").isMongoId().withMessage("Invalid entry ID")],
  validateRequest,
  voiceJournalController.deleteVoiceEntry
);

/**
 * @swagger
 * /api/voice-journal/mood/{minMood}/{maxMood}:
 *   get:
 *     summary: Get voice journal entries by mood range
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: minMood
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Minimum mood score
 *       - in: path
 *         name: maxMood
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Maximum mood score
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoiceJournalEntry'
 *       500:
 *         description: Server error
 */
router.get(
  "/mood/:minMood/:maxMood",
  [
    param("minMood")
      .isInt({ min: 1, max: 10 })
      .withMessage("MinMood must be between 1 and 10"),
    param("maxMood")
      .isInt({ min: 1, max: 10 })
      .withMessage("MaxMood must be between 1 and 10"),
  ],
  validateRequest,
  voiceJournalController.getEntriesByMood
);

/**
 * @swagger
 * /api/voice-journal/themes:
 *   get:
 *     summary: Get voice journal entries by themes
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: themes
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of themes
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoiceJournalEntry'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get(
  "/themes",
  [query("themes").notEmpty().withMessage("Themes parameter is required")],
  validateRequest,
  voiceJournalController.getEntriesByThemes
);

/**
 * @swagger
 * /api/voice-journal/recent:
 *   get:
 *     summary: Get recent voice journal entries
 *     tags: [Voice Journaling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           maximum: 20
 *         description: Number of recent entries to retrieve
 *     responses:
 *       200:
 *         description: Recent entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VoiceJournalEntry'
 *       500:
 *         description: Server error
 */
router.get(
  "/recent",
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Limit must be between 1 and 20"),
  ],
  validateRequest,
  voiceJournalController.getRecentEntries
);

/**
 * @swagger
 * /api/voice-journal/stats:
 *   get:
 *     summary: Get voice journal statistics
 *     tags: [Voice Journaling]
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
 *                     totalEntries:
 *                       type: integer
 *                     totalDuration:
 *                       type: number
 *                     averageMood:
 *                       type: number
 *                     recentEntriesCount:
 *                       type: integer
 *                     lastEntryDate:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get("/stats", voiceJournalController.getVoiceStats);

export default router;
