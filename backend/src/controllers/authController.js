import { getAuthInstance } from "../config/firebase.js";
import User from "../models/User.js";

export const authController = {
  // Verify user and create/update profile
  async verifyUser(req, res) {
    try {
      const { uid, email, name, picture } = req.body;
      const idToken = req.headers.authorization?.split(" ")[1];

      // Check if user exists
      let user = await User.findOne({ uid });

      if (user) {
        // Update existing user
        user.lastLogin = new Date();
        user.email = email;
        user.name = name;
        user.picture = picture;
        await user.save();

        // Set secure HTTP-only cookie for authentication persistence
        if (idToken) {
          res.cookie("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
          });
        }

        res.json({
          success: true,
          message: "User profile updated",
          user: user,
        });
      } else {
        // Create new user
        const newUser = new User({
          uid: uid,
          email: email,
          name: name,
          picture: picture,
          preferredLanguage: "en",
          wellnessGoals: [],
          preferences: {
            notifications: true,
            theme: "light",
            accessibility: {},
          },
          createdAt: new Date(),
          lastLogin: new Date(),
        });

        await newUser.save();

        // Set secure HTTP-only cookie for authentication persistence
        if (idToken) {
          res.cookie("authToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
          });
        }

        res.status(201).json({
          success: true,
          message: "User profile created",
          user: newUser,
        });
      }
    } catch (error) {
      console.error("Verify user error:", error);
      res.status(500).json({
        error: "Failed to verify user",
        message: error.message,
      });
    }
  },

  // Logout user and clear cookie
  async logout(req, res) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        error: "Failed to logout",
        message: error.message,
      });
    }
  },

  // Get user profile
  async getProfile(req, res) {
    try {
      const { uid } = req.user;

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      res.json({
        success: true,
        user: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Failed to get profile",
        message: error.message,
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { uid } = req.user;
      const { name, preferredLanguage, wellnessGoals } = req.body;

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      if (name) user.name = name;
      if (preferredLanguage) user.preferredLanguage = preferredLanguage;
      if (wellnessGoals) user.wellnessGoals = wellnessGoals;

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Failed to update profile",
        message: error.message,
      });
    }
  },

  // Refresh user token
  async refreshToken(req, res) {
    try {
      const { uid } = req.user;
      const auth = getAuthInstance();

      // Get the current user from Firebase
      const firebaseUser = await auth.getUser(uid);

      if (!firebaseUser) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist in Firebase",
        });
      }

      // Generate a new custom token (this would typically be done by the client)
      // For now, we'll just verify the current token is still valid
      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User profile not found",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Token refreshed successfully",
        user: user,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        error: "Failed to refresh token",
        message: error.message,
      });
    }
  },

  // Delete user account
  async deleteAccount(req, res) {
    try {
      const { uid } = req.user;
      const auth = getAuthInstance();

      // Delete user data from MongoDB
      await User.deleteOne({ uid });

      // Note: In a production app, you'd also delete related data:
      // - Journal entries
      // - AI conversations
      // - VR sessions
      // - Transcriptions
      // This can be done with cascading deletes or background jobs

      // Delete user from Firebase Auth
      await auth.deleteUser(uid);

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
        error: "Failed to delete account",
        message: error.message,
      });
    }
  },
};
