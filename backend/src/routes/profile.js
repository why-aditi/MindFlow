import express from "express";
import { body, query } from "express-validator";
import { userController } from "../controllers/userController.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation rules
const updateWellnessGoalsValidation = [
  body("goals").isArray().withMessage("Goals must be an array"),
  body("goals.*.title").notEmpty().withMessage("Goal title is required"),
  body("goals.*.description")
    .optional()
    .isString()
    .withMessage("Goal description must be a string"),
  body("goals.*.targetDate")
    .optional()
    .isISO8601()
    .withMessage("Target date must be a valid ISO date"),
  body("goals.*.priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

const updatePreferencesValidation = [
  body("preferredLanguage")
    .optional()
    .isIn(["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"])
    .withMessage("Invalid language code"),
  body("notifications")
    .optional()
    .isObject()
    .withMessage("Notifications must be an object"),
  body("theme")
    .optional()
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be light, dark, or auto"),
  body("accessibility")
    .optional()
    .isObject()
    .withMessage("Accessibility settings must be an object"),
];

const submitFeedbackValidation = [
  body("type")
    .isIn(["bug", "feature", "general", "ui", "performance"])
    .withMessage("Invalid feedback type"),
  body("message").notEmpty().withMessage("Feedback message is required"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const getStatsValidation = [
  query("period")
    .optional()
    .isIn(["week", "month", "year", "all"])
    .withMessage("Invalid period filter"),
];

// Profile routes - mapped to user controller
router.get("/profile", userController.getProfile);
router.get("/wellness-goals", userController.getWellnessGoals);
router.put(
  "/wellness-goals",
  updateWellnessGoalsValidation,
  validate,
  userController.updateWellnessGoals
);
router.get("/achievements", userController.getAchievements);
router.get("/stats", getStatsValidation, validate, userController.getStats);
router.get("/preferences", userController.getPreferences);
router.put(
  "/preferences",
  updatePreferencesValidation,
  validate,
  userController.updatePreferences
);
router.post(
  "/feedback",
  submitFeedbackValidation,
  validate,
  userController.submitFeedback
);
router.get("/recent-activity", userController.getRecentActivity);
router.get("/mood-trend", userController.getMoodTrend);
router.get("/activity-distribution", userController.getActivityDistribution);
router.get("/exercise-sessions", userController.getExerciseSessions);
router.post("/exercise-sessions", userController.createExerciseSession);

export default router;
