import User from "../models/User.js";
import JournalEntry from "../models/JournalEntry.js";
import ExerciseSession from "../models/ExerciseSession.js";
import { AISession } from "../models/Conversation.js";

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

// Helper function to convert mood string to number
const moodToNumber = (mood) => {
  const moodMap = {
    sad: 2,
    anxious: 3,
    tired: 4,
    neutral: 5,
    confused: 5,
    calm: 7,
    happy: 8,
    excited: 9,
    angry: 3,
  };
  return moodMap[mood] || 5; // Default to neutral (5) if mood not found
};

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

  // Get wellness goals
  async getWellnessGoals(req, res) {
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
        goals: user.wellnessGoals || [],
      });
    } catch (error) {
      console.error("Get wellness goals error:", error);
      res.status(500).json({
        error: "Failed to get wellness goals",
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

  // Get user preferences
  async getPreferences(req, res) {
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
        preferences: user.preferences || {
          theme: "light",
          notifications: {
            email: true,
            push: true,
            reminders: true,
          },
          accessibility: {
            fontSize: "medium",
            highContrast: false,
            screenReader: false,
          },
        },
      });
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({
        error: "Failed to get preferences",
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

      // Get user's exercise sessions count
      const vrCount = await ExerciseSession.countDocuments({ userId: uid });

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
          id: "first_exercise",
          name: "Exercise Explorer",
          description: "Complete your first exercise session",
        });
      if (vrCount >= 10)
        achievements.push({
          id: "exercise_master",
          name: "Exercise Master",
          description: "Complete 10 exercise sessions",
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
          exerciseSessions: vrCount,
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
      const vrCount = await ExerciseSession.countDocuments(dateFilter);
      const aiCount = await AISession.countDocuments(dateFilter);

      // Get journal entries for mood analysis
      const journalEntries = await JournalEntry.find(dateFilter);
      const moodCounts = {};
      journalEntries.forEach((entry) => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      // Get exercise sessions for type analysis
      const exerciseSessions = await ExerciseSession.find(dateFilter);
      const exerciseTypeCounts = {};
      exerciseSessions.forEach((session) => {
        exerciseTypeCounts[session.sessionType] =
          (exerciseTypeCounts[session.sessionType] || 0) + 1;
      });

      res.json({
        success: true,
        stats: {
          period,
          journalEntries: journalCount,
          exerciseSessions: vrCount,
          aiConversations: aiCount,
          moodDistribution: moodCounts,
          exerciseSessionTypes: exerciseTypeCounts,
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

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const { uid } = req.user;
      const { limit = 10 } = req.query;

      // Get recent journal entries
      const recentJournals = await JournalEntry.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("mood createdAt");

      console.log("Recent journals found:", recentJournals.length);

      // Get recent exercise sessions
      const recentExerciseSessions = await ExerciseSession.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("sessionType plannedDuration createdAt");

      console.log(
        "Recent exercise sessions found:",
        recentExerciseSessions.length
      );

      // Get recent AI conversations
      const recentAIConversations = await AISession.find({ userId: uid })
        .sort({ lastActivity: -1 })
        .limit(parseInt(limit))
        .select("lastActivity");

      console.log(
        "Recent AI conversations found:",
        recentAIConversations.length
      );

      // Combine and format activities
      const activities = [];

      recentJournals.forEach((journal) => {
        activities.push({
          id: `journal_${journal._id}`,
          type: "journal",
          activity: "Wrote journal entry",
          description: `Mood: ${journal.mood}`,
          timestamp: journal.createdAt,
          points: 30,
        });
      });

      recentExerciseSessions.forEach((session) => {
        activities.push({
          id: `exercise_${session._id}`,
          type: "exercise",
          activity: "Completed exercise session",
          description: `${session.sessionType} - ${session.plannedDuration} seconds`,
          timestamp: session.createdAt,
          points: 100,
        });
      });

      recentAIConversations.forEach((conversation) => {
        activities.push({
          id: `ai_${conversation._id}`,
          type: "ai",
          activity: "AI conversation",
          description: "Chat with AI companion",
          timestamp: conversation.lastActivity,
          points: 20,
        });
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedActivities = activities.slice(0, parseInt(limit));

      // Format for frontend
      const formattedActivities = limitedActivities.map((activity) => ({
        id: activity.id,
        activity: activity.activity,
        description: activity.description,
        time: getTimeAgo(activity.timestamp),
        points: `+${activity.points}`,
        type: activity.type,
      }));

      res.json({
        success: true,
        activities: formattedActivities,
      });
    } catch (error) {
      console.error("Get recent activity error:", error);
      res.status(500).json({
        error: "Failed to get recent activity",
        message: error.message,
      });
    }
  },

  // Get mood trend for the past week
  async getMoodTrend(req, res) {
    try {
      const { uid } = req.user;

      // Get last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      // Get journal entries for the past week
      const journalEntries = await JournalEntry.find({
        userId: uid,
        createdAt: { $gte: startDate, $lte: endDate },
      }).select("mood createdAt");

      console.log("Mood trend query:", {
        userId: uid,
        startDate,
        endDate,
        journalEntriesCount: journalEntries.length,
        journalEntries: journalEntries.map((entry) => ({
          mood: entry.mood,
          createdAt: entry.createdAt,
        })),
      });

      // Group by day and calculate average mood
      const moodByDay = {};
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Match frontend order
      const dayMap = {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
      };

      // Initialize with default values for the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayKey = dayMap[date.getDay()];
        moodByDay[dayKey] = { count: 0, total: 0, avg: 5 }; // Default mood of 5
      }

      // Process journal entries
      journalEntries.forEach((entry) => {
        const dayKey = dayMap[entry.createdAt.getDay()];
        if (moodByDay[dayKey]) {
          moodByDay[dayKey].count++;
          moodByDay[dayKey].total += moodToNumber(entry.mood);
          moodByDay[dayKey].avg = Math.round(
            moodByDay[dayKey].total / moodByDay[dayKey].count
          );
        }
      });

      // Convert to array for frontend in the correct order (Mon-Sun)
      const moodTrend = days.map((day) => moodByDay[day].avg);

      console.log("Mood trend calculation:", {
        journalEntriesCount: journalEntries.length,
        moodByDay,
        moodTrend,
        days,
      });

      res.json({
        success: true,
        moodTrend,
        days,
      });
    } catch (error) {
      console.error("Get mood trend error:", error);
      res.status(500).json({
        error: "Failed to get mood trend",
        message: error.message,
      });
    }
  },

  // Get activity distribution
  async getActivityDistribution(req, res) {
    try {
      const { uid } = req.user;
      const { period = "week" } = req.query;

      const now = new Date();
      let startDate;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get counts for different activities
      const journalCount = await JournalEntry.countDocuments({
        userId: uid,
        createdAt: { $gte: startDate },
      });

      console.log("Journal count for period:", journalCount);

      const vrCount = await ExerciseSession.countDocuments({
        userId: uid,
        createdAt: { $gte: startDate },
      });

      console.log("Exercise count for period:", vrCount);

      const aiCount = await AISession.countDocuments({
        userId: uid,
        lastActivity: { $gte: startDate },
      });

      console.log("AI count for period:", aiCount);

      const total = journalCount + vrCount + aiCount;

      // Calculate percentages
      const distribution = {
        meditation: total > 0 ? Math.round((vrCount / total) * 100) : 0,
        journaling: total > 0 ? Math.round((journalCount / total) * 100) : 0,
        exerciseSessions: total > 0 ? Math.round((vrCount / total) * 100) : 0,
        aiConversations: total > 0 ? Math.round((aiCount / total) * 100) : 0,
      };

      res.json({
        success: true,
        distribution,
        counts: {
          journal: journalCount,
          exercise: vrCount,
          ai: aiCount,
          total,
        },
      });
    } catch (error) {
      console.error("Get activity distribution error:", error);
      res.status(500).json({
        error: "Failed to get activity distribution",
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

  // Get exercise sessions
  async getExerciseSessions(req, res) {
    try {
      const { uid } = req.user;
      const { limit = 50, page = 1 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sessions = await ExerciseSession.find({ userId: uid })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          "exerciseName sessionType plannedDuration actualDuration status createdAt completedAt results"
        );

      const totalSessions = await ExerciseSession.countDocuments({
        userId: uid,
      });

      res.json({
        success: true,
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSessions,
          pages: Math.ceil(totalSessions / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get exercise sessions error:", error);
      res.status(500).json({
        error: "Failed to get exercise sessions",
        message: error.message,
      });
    }
  },

  // Create exercise session
  async createExerciseSession(req, res) {
    try {
      const { uid } = req.user;
      const {
        exerciseId,
        exerciseName,
        sessionType,
        plannedDuration,
        actualDuration,
        status = "completed",
        results = {},
        completedAt,
      } = req.body;

      // Validate required fields
      if (!exerciseId || !exerciseName || !sessionType || !plannedDuration) {
        return res.status(400).json({
          error:
            "Missing required fields: exerciseId, exerciseName, sessionType, plannedDuration",
        });
      }

      // Import Exercise model
      const Exercise = (await import("../models/Exercise.js")).default;

      // Find the exercise by name to get the ObjectId
      let exerciseObjectId = exerciseId;

      // If exerciseId is a string (not a valid ObjectId), look up by name
      if (
        typeof exerciseId === "string" &&
        !exerciseId.match(/^[0-9a-fA-F]{24}$/)
      ) {
        const exercise = await Exercise.findOne({ name: exerciseId });
        if (!exercise) {
          return res.status(400).json({
            error: `Exercise not found: ${exerciseId}`,
          });
        }
        exerciseObjectId = exercise._id;
      }

      const session = new ExerciseSession({
        userId: uid,
        exerciseId: exerciseObjectId,
        exerciseName,
        sessionType,
        plannedDuration,
        actualDuration: actualDuration || plannedDuration,
        status,
        results,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        createdAt: new Date(),
        startedAt: new Date(),
        updatedAt: new Date(),
      });

      await session.save();

      res.json({
        success: true,
        sessionId: session._id,
        message: "Exercise session created successfully",
      });
    } catch (error) {
      console.error("Create exercise session error:", error);
      res.status(500).json({
        error: "Failed to create exercise session",
        message: error.message,
      });
    }
  },
};
