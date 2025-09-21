import express from "express";
import {
  speechController,
  upload,
  addTiming,
} from "../controllers/speechController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply timing middleware to all routes
router.use(addTiming);

/**
 * @route POST /api/speech/transcribe
 * @desc Transcribe uploaded audio file to text
 * @access Private
 */
router.post(
  "/transcribe",
  upload.single("audio"),
  speechController.transcribeAudio
);

/**
 * @route POST /api/speech/detect-language
 * @desc Detect language from audio file
 * @access Private
 */
router.post(
  "/detect-language",
  upload.single("audio"),
  speechController.detectLanguage
);

/**
 * @route GET /api/speech/languages
 * @desc Get list of supported languages
 * @access Private
 */
router.get("/languages", speechController.getSupportedLanguages);

/**
 * @route POST /api/speech/validate-format
 * @desc Validate audio format
 * @access Private
 */
router.post("/validate-format", speechController.validateFormat);

export default router;
