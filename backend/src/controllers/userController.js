import User from "../models/User.js";
import JournalEntry from "../models/JournalEntry.js";
import VRSession from "../models/VRSession.js";
import { AISession } from "../models/Conversation.js";

export const userController = {
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
        user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Failed to get profile",
        message: error.message,
      });
    }
  },

  // Update wellness goals
  async updateWellnessGoals(req, res) {
    try {
      const { uid } = req.user;
      const { goals } = req.body;

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      user.wellnessGoals = goals;
      await user.save();

      res.json({
        success: true,
        message: "Wellness goals updated successfully",
      });
    } catch (error) {
      console.error("Update wellness goals error:", error);
      res.status(500).json({
        error: "Failed to update wellness goals",
        message: error.message,
      });
    }
  },

  // Update user preferences
  async updatePreferences(req, res) {
    try {
      const { uid } = req.user;
      const { preferredLanguage, notifications, theme, accessibility } =
        req.body;

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      if (preferredLanguage) user.preferredLanguage = preferredLanguage;
      if (notifications !== undefined)
        user.preferences.notifications = notifications;
      if (theme) user.preferences.theme = theme;
      if (accessibility) user.preferences.accessibility = accessibility;

      await user.save();

      res.json({
        success: true,
        message: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        error: "Failed to update preferences",
        message: error.message,
      });
    }
  },

  // Get user achievements
  async getAchievements(req, res) {
    try {
      const { uid } = req.user;

      // Get user's journal entries count
      const journalCount = await JournalEntry.countDocuments({ userId: uid });

      // Get user's VR sessions count
      const vrCount = await VRSession.countDocuments({ userId: uid });

      // Get user's AI conversations count
      const aiCount = await AISession.countDocuments({ userId: uid });

      // Calculate achievements based on activity
      const achievements = [];

      if (journalCount >= 1)
        achievements.push({
          id: "first_journal",
          name: "First Entry",
          description: "Write your first journal entry",
        });
      if (journalCount >= 7)
        achievements.push({
          id: "week_streak",
          name: "Weekly Writer",
          description: "Write 7 journal entries",
        });
      if (journalCount >= 30)
        achievements.push({
          id: "month_streak",
          name: "Monthly Writer",
          description: "Write 30 journal entries",
        });

      if (vrCount >= 1)
        achievements.push({
          id: "first_vr",
          name: "VR Explorer",
          description: "Complete your first VR session",
        });
      if (vrCount >= 10)
        achievements.push({
          id: "vr_master",
          name: "VR Master",
          description: "Complete 10 VR sessions",
        });

      if (aiCount >= 1)
        achievements.push({
          id: "first_chat",
          name: "AI Companion",
          description: "Start your first AI conversation",
        });
      if (aiCount >= 5)
        achievements.push({
          id: "chat_master",
          name: "Chat Master",
          description: "Have 5 AI conversations",
        });

      res.json({
        success: true,
        achievements,
        stats: {
          journalEntries: journalCount,
          vrSessions: vrCount,
          aiConversations: aiCount,
        },
      });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({
        error: "Failed to get achievements",
        message: error.message,
      });
    }
  },

  // Get user stats
  async getStats(req, res) {
    try {
      const { uid } = req.user;
      const { period = "month" } = req.query;

      const now = new Date();
      let startDate;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Build date filter
      const dateFilter = { userId: uid, createdAt: { $gte: startDate } };

      // Get counts
      const journalCount = await JournalEntry.countDocuments(dateFilter);
      const vrCount = await VRSession.countDocuments(dateFilter);
      const aiCount = await AISession.countDocuments(dateFilter);

      // Get journal entries for mood analysis
      const journalEntries = await JournalEntry.find(dateFilter);
      const moodCounts = {};
      journalEntries.forEach((entry) => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      // Get VR sessions for type analysis
      const vrSessions = await VRSession.find(dateFilter);
      const vrTypeCounts = {};
      vrSessions.forEach((session) => {
        vrTypeCounts[session.sessionType] =
          (vrTypeCounts[session.sessionType] || 0) + 1;
      });

      res.json({
        success: true,
        stats: {
          period,
          journalEntries: journalCount,
          vrSessions: vrCount,
          aiConversations: aiCount,
          moodDistribution: moodCounts,
          vrSessionTypes: vrTypeCounts,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        error: "Failed to get stats",
        message: error.message,
      });
    }
  },

  // Submit general feedback
  async submitFeedback(req, res) {
    try {
      const { uid } = req.user;
      const { type, message, rating } = req.body;

      // For now, we'll store feedback in a simple way
      // In a production app, you might want a separate Feedback model
      console.log(`Feedback from ${uid}: ${type} - ${message} (${rating})`);

      res.json({
        success: true,
        message: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      res.status(500).json({
        error: "Failed to submit feedback",
        message: error.message,
      });
    }
  },
};
