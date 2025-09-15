import express from "express";
import { body, query } from "express-validator";
import { aiController } from "../controllers/aiController.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body("message").notEmpty().withMessage("Message is required"),
  body("sessionId")
    .optional()
    .isString()
    .withMessage("Session ID must be a string"),
  body("language")
    .optional()
    .isIn(["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"])
    .withMessage("Invalid language code"),
];

const getConversationsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const feedbackValidation = [
  body("conversationId").notEmpty().withMessage("Conversation ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback must be a string"),
];

const wellnessSuggestionsValidation = [
  body("userProfile")
    .optional()
    .isObject()
    .withMessage("User profile must be an object"),
];

const updateContextValidation = [
  body("context")
    .isObject()
    .withMessage("Context must be an object"),
];

// Routes
router.post("/chat", sendMessageValidation, validate, aiController.sendMessage);
router.get(
  "/conversations",
  getConversationsValidation,
  validate,
  aiController.getConversations
);
router.get("/conversations/:id", aiController.getConversation);
router.post(
  "/feedback",
  feedbackValidation,
  validate,
  aiController.submitFeedback
);
router.get("/sessions", aiController.getSessions);
router.get("/messages", aiController.getMessages);

// New Gemini-powered AI routes
router.get("/model-info", aiController.getModelInfo);
router.get("/conversations/:sessionId/mood-analysis", aiController.analyzeMood);
router.post(
  "/conversations/:sessionId/wellness-suggestions",
  wellnessSuggestionsValidation,
  validate,
  aiController.getWellnessSuggestions
);
router.get("/conversations/:sessionId/summary", aiController.getConversationSummary);
router.put(
  "/conversations/:sessionId/context",
  updateContextValidation,
  validate,
  aiController.updateSessionContext
);

export default router;
