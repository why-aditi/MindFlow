import VRSession from "../models/VRSession.js";

export const vrController = {
  // Create VR session
  async createSession(req, res) {
    try {
      const { uid } = req.user;
      const { sessionType, environment, duration } = req.body;

      const newSession = new VRSession({
        userId: uid,
        sessionType,
        environment: environment || "ocean",
        plannedDuration: duration || 10,
        status: "active",
      });

      const savedSession = await newSession.save();

      res.status(201).json({
        success: true,
        message: "VR session created successfully",
        sessionId: savedSession._id,
      });
    } catch (error) {
      console.error("Create VR session error:", error);
      res.status(500).json({
        error: "Failed to create VR session",
        message: error.message,
      });
    }
  },

  // Complete VR session
  async completeSession(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { actualDuration, feedback, rating } = req.body;

      const session = await VRSession.findOne({ _id: id, userId: uid });

      if (!session) {
        return res.status(404).json({
          error: "VR session not found",
        });
      }

      session.status = "completed";
      session.actualDuration = actualDuration;
      session.completedAt = new Date();
      session.feedback = feedback || "";
      session.rating = rating || null;

      await session.save();

      res.json({
        success: true,
        message: "VR session completed successfully",
      });
    } catch (error) {
      console.error("Complete VR session error:", error);
      res.status(500).json({
        error: "Failed to complete VR session",
        message: error.message,
      });
    }
  },

  // Get VR sessions
  async getSessions(req, res) {
    try {
      const { uid } = req.user;
      const { page = 1, limit = 10, sessionType } = req.query;

      // Build query filter
      const filter = { userId: uid };
      if (sessionType) {
        filter.sessionType = sessionType;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sessions = await VRSession.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await VRSession.countDocuments(filter);

      res.json({
        success: true,
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get VR sessions error:", error);
      res.status(500).json({
        error: "Failed to get VR sessions",
        message: error.message,
      });
    }
  },

  // Get single VR session
  async getSession(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;

      const session = await VRSession.findOne({ _id: id, userId: uid });

      if (!session) {
        return res.status(404).json({
          error: "VR session not found",
        });
      }

      res.json({
        success: true,
        session,
      });
    } catch (error) {
      console.error("Get VR session error:", error);
      res.status(500).json({
        error: "Failed to get VR session",
        message: error.message,
      });
    }
  },

  // Get guided sessions
  async getGuidedSessions(req, res) {
    try {
      const guidedSessions = [
        {
          id: "meditation-ocean",
          title: "Ocean Meditation",
          description: "Relax with calming ocean sounds and gentle waves",
          duration: 10,
          environment: "ocean",
          type: "meditation",
        },
        {
          id: "breathing-forest",
          title: "Forest Breathing",
          description:
            "Practice mindful breathing in a peaceful forest setting",
          duration: 5,
          environment: "forest",
          type: "breathing",
        },
        {
          id: "visualization-mountain",
          title: "Mountain Visualization",
          description: "Visualize yourself on a serene mountain peak",
          duration: 15,
          environment: "mountain",
          type: "visualization",
        },
        {
          id: "mindfulness-garden",
          title: "Garden Mindfulness",
          description: "Practice mindfulness in a beautiful garden",
          duration: 8,
          environment: "garden",
          type: "mindfulness",
        },
      ];

      res.json({
        success: true,
        guidedSessions,
      });
    } catch (error) {
      console.error("Get guided sessions error:", error);
      res.status(500).json({
        error: "Failed to get guided sessions",
        message: error.message,
      });
    }
  },

  // Get VR analytics
  async getAnalytics(req, res) {
    try {
      const { uid } = req.user;

      const sessions = await VRSession.find({ userId: uid });

      // Calculate session type distribution
      const typeCounts = {};
      sessions.forEach((session) => {
        typeCounts[session.sessionType] =
          (typeCounts[session.sessionType] || 0) + 1;
      });

      // Calculate total time spent
      const totalTime = sessions
        .filter((session) => session.status === "completed")
        .reduce((total, session) => total + (session.actualDuration || 0), 0);

      // Calculate average session duration
      const completedSessions = sessions.filter(
        (session) => session.status === "completed"
      );
      const averageDuration =
        completedSessions.length > 0 ? totalTime / completedSessions.length : 0;

      res.json({
        success: true,
        analytics: {
          totalSessions: sessions.length,
          completedSessions: completedSessions.length,
          totalTimeSpent: totalTime,
          averageDuration,
          sessionTypeDistribution: typeCounts,
        },
      });
    } catch (error) {
      console.error("Get VR analytics error:", error);
      res.status(500).json({
        error: "Failed to get VR analytics",
        message: error.message,
      });
    }
  },
};
