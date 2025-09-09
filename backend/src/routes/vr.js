import express from "express";
import { body, query } from "express-validator";
import { vrController } from "../controllers/vrController.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation rules
const createSessionValidation = [
  body("sessionType")
    .isIn(["meditation", "breathing", "visualization", "mindfulness"])
    .withMessage("Invalid session type"),
  body("environment")
    .optional()
    .isIn(["ocean", "forest", "mountain", "space", "garden"])
    .withMessage("Invalid environment"),
  body("duration")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Duration must be between 1 and 60 minutes"),
];

const completeSessionValidation = [
  body("sessionId").notEmpty().withMessage("Session ID is required"),
  body("actualDuration")
    .isInt({ min: 1 })
    .withMessage("Actual duration must be a positive integer"),
  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback must be a string"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const getSessionsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sessionType")
    .optional()
    .isIn(["meditation", "breathing", "visualization", "mindfulness"])
    .withMessage("Invalid session type filter"),
];

// Routes
router.post(
  "/sessions",
  createSessionValidation,
  validate,
  vrController.createSession
);
router.put(
  "/sessions/:id/complete",
  completeSessionValidation,
  validate,
  vrController.completeSession
);
router.get(
  "/sessions",
  getSessionsValidation,
  validate,
  vrController.getSessions
);
router.get("/sessions/:id", vrController.getSession);
router.get("/guided-sessions", vrController.getGuidedSessions);
router.get("/analytics", vrController.getAnalytics);

export default router;
