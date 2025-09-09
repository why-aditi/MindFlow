import express from "express";
import { body, query } from "express-validator";
import { journalController } from "../controllers/journalController.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation rules
const createEntryValidation = [
  body("content").notEmpty().withMessage("Content is required"),
  body("mood")
    .optional()
    .isIn([
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "confused",
    ])
    .withMessage("Invalid mood value"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isVoice")
    .optional()
    .isBoolean()
    .withMessage("isVoice must be a boolean"),
];

const updateEntryValidation = [
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("mood")
    .optional()
    .isIn([
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "confused",
    ])
    .withMessage("Invalid mood value"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

const getEntriesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("mood")
    .optional()
    .isIn([
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "confused",
    ])
    .withMessage("Invalid mood filter"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),
];

// Routes
router.post(
  "/entries",
  createEntryValidation,
  validate,
  journalController.createEntry
);
router.get(
  "/entries",
  getEntriesValidation,
  validate,
  journalController.getEntries
);
router.get("/entries/:id", journalController.getEntry);
router.put(
  "/entries/:id",
  updateEntryValidation,
  validate,
  journalController.updateEntry
);
router.delete("/entries/:id", journalController.deleteEntry);
router.get("/analytics", journalController.getAnalytics);

export default router;
