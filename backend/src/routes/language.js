import express from "express";
import {
  languageController,
  addTiming,
} from "../controllers/languageController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply timing middleware to all routes
router.use(addTiming);

/**
 * @route POST /api/language/sentiment
 * @desc Analyze sentiment of text
 * @access Private
 */
router.post("/sentiment", languageController.analyzeSentiment);

/**
 * @route POST /api/language/entities
 * @desc Analyze entities in text
 * @access Private
 */
router.post("/entities", languageController.analyzeEntities);

/**
 * @route POST /api/language/classify
 * @desc Classify text content
 * @access Private
 */
router.post("/classify", languageController.classifyText);

/**
 * @route POST /api/language/analyze
 * @desc Comprehensive text analysis
 * @access Private
 */
router.post("/analyze", languageController.analyzeText);

/**
 * @route POST /api/language/moderate
 * @desc Moderate content for inappropriate content
 * @access Private
 */
router.post("/moderate", languageController.moderateContent);

/**
 * @route POST /api/language/key-phrases
 * @desc Extract key phrases from text
 * @access Private
 */
router.post("/key-phrases", languageController.extractKeyPhrases);

/**
 * @route POST /api/language/detect
 * @desc Detect language of text
 * @access Private
 */
router.post("/detect", languageController.detectLanguage);

export default router;
