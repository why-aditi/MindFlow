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

const startExerciseSessionValidation = [
  body("exercisePlanId")
    .isMongoId()
    .withMessage("Valid exercise plan ID is required"),
];

const updateExerciseProgressValidation = [
  body("currentExercise")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Current exercise must be a non-negative integer"),
  body("completedExercise")
    .optional()
    .isObject()
    .withMessage("Completed exercise must be an object"),
];

const completeExerciseSessionValidation = [
  body("actualDuration")
    .isInt({ min: 0 })
    .withMessage("Actual duration must be a non-negative integer"),
  body("feedback")
    .optional()
    .isObject()
    .withMessage("Feedback must be an object"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
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
router.get("/user-stats", vrController.getUserStats);
router.get("/user-preferences", vrController.getUserPreferences);
router.get("/biometric-data", vrController.getBiometricData);

// Exercise Plan Routes
router.get("/exercise-plans", vrController.getExercisePlans);
router.get("/exercise-plans/:id", vrController.getExercisePlan);

// Exercise Session Routes
router.post(
  "/exercise-sessions",
  startExerciseSessionValidation,
  validate,
  vrController.startExerciseSession
);
router.put(
  "/exercise-sessions/:id/progress",
  updateExerciseProgressValidation,
  validate,
  vrController.updateExerciseProgress
);
router.put(
  "/exercise-sessions/:id/complete",
  completeExerciseSessionValidation,
  validate,
  vrController.completeExerciseSession
);
router.get("/exercise-sessions", vrController.getExerciseSessions);

export default router;
