import express from "express";
import { body } from "express-validator";
import { authController } from "../controllers/authController.js";
import { validate } from "../middleware/validation.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Validation rules
const verifyUserValidation = [
  body("uid").notEmpty().withMessage("User ID is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("name").notEmpty().withMessage("Name is required"),
];

const updateProfileValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("preferredLanguage")
    .optional()
    .isIn(["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"])
    .withMessage("Invalid language code"),
  body("wellnessGoals")
    .optional()
    .isArray()
    .withMessage("Wellness goals must be an array"),
];

// Routes
router.post(
  "/verify",
  verifyUserValidation,
  validate,
  authController.verifyUser
);
router.get("/profile", authMiddleware, authController.getProfile);
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidation,
  validate,
  authController.updateProfile
);
router.delete("/account", authMiddleware, authController.deleteAccount);

export default router;
