import VRSession from "../models/VRSession.js";
import ExercisePlan from "../models/ExercisePlan.js";
import ExerciseSession from "../models/ExerciseSession.js";
import computerVisionService from "../services/computerVisionService.js";

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

  // Get user stats for VR
  async getUserStats(req, res) {
    try {
      const { uid } = req.user;

      const sessions = await VRSession.find({ userId: uid });
      const exerciseSessions = await ExerciseSession.find({ userId: uid });

      // Calculate VR session stats
      const completedVRSessions = sessions.filter(
        (session) => session.status === "completed"
      );
      const totalVRTime = completedVRSessions.reduce(
        (total, session) => total + (session.actualDuration || 0),
        0
      );
      const averageVRDuration =
        completedVRSessions.length > 0
          ? totalVRTime / completedVRSessions.length
          : 0;

      // Calculate exercise session stats
      const completedExerciseSessions = exerciseSessions.filter(
        (session) => session.status === "completed"
      );
      const totalExerciseTime = completedExerciseSessions.reduce(
        (total, session) => total + (session.actualDuration || 0),
        0
      );
      const averageExerciseAccuracy =
        completedExerciseSessions.length > 0
          ? completedExerciseSessions.reduce(
              (sum, session) => sum + (session.progress.overallAccuracy || 0),
              0
            ) / completedExerciseSessions.length
          : 0;

      // Calculate streak (consecutive days with at least one session)
      const today = new Date();
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const recentSessions = [...sessions, ...exerciseSessions].filter(
        (session) => new Date(session.createdAt) >= thirtyDaysAgo
      );

      // Calculate current streak
      let currentStreak = 0;
      const sessionDates = [
        ...new Set(
          recentSessions.map((session) =>
            new Date(session.createdAt).toDateString()
          )
        ),
      ].sort((a, b) => new Date(b) - new Date(a));

      for (let i = 0; i < sessionDates.length; i++) {
        const sessionDate = new Date(sessionDates[i]);
        const expectedDate = new Date(
          today.getTime() - i * 24 * 60 * 60 * 1000
        );

        if (sessionDate.toDateString() === expectedDate.toDateString()) {
          currentStreak++;
        } else {
          break;
        }
      }

      res.json({
        success: true,
        stats: {
          vrSessions: {
            total: sessions.length,
            completed: completedVRSessions.length,
            totalTime: totalVRTime,
            averageDuration: Math.round(averageVRDuration * 10) / 10,
          },
          exerciseSessions: {
            total: exerciseSessions.length,
            completed: completedExerciseSessions.length,
            totalTime: totalExerciseTime,
            averageAccuracy: Math.round(averageExerciseAccuracy),
          },
          streaks: {
            current: currentStreak,
            longest: Math.max(currentStreak, 0), // Simplified for now
          },
          wellness: {
            totalSessions: sessions.length + exerciseSessions.length,
            totalTime: totalVRTime + totalExerciseTime,
            lastActivity:
              recentSessions.length > 0 ? recentSessions[0].createdAt : null,
          },
        },
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        error: "Failed to get user stats",
        message: error.message,
      });
    }
  },

  // Get user preferences for VR
  async getUserPreferences(req, res) {
    try {
      const { uid } = req.user;

      // Get user's recent sessions to determine preferences
      const recentSessions = await VRSession.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(20);

      // Analyze preferences based on recent activity
      const sessionTypes = {};
      const environments = {};
      const durations = [];

      recentSessions.forEach((session) => {
        sessionTypes[session.sessionType] =
          (sessionTypes[session.sessionType] || 0) + 1;
        environments[session.environment] =
          (environments[session.environment] || 0) + 1;
        durations.push(session.plannedDuration);
      });

      // Calculate most preferred options
      const preferredSessionType = Object.keys(sessionTypes).reduce(
        (a, b) => (sessionTypes[a] > sessionTypes[b] ? a : b),
        "meditation"
      );

      const preferredEnvironment = Object.keys(environments).reduce(
        (a, b) => (environments[a] > environments[b] ? a : b),
        "ocean"
      );

      const averageDuration =
        durations.length > 0
          ? Math.round(
              durations.reduce((sum, dur) => sum + dur, 0) / durations.length
            )
          : 10;

      res.json({
        success: true,
        preferences: {
          sessionType: preferredSessionType,
          environment: preferredEnvironment,
          duration: averageDuration,
          notifications: {
            reminders: true,
            achievements: true,
            weeklyReports: true,
          },
          accessibility: {
            audioGuidance: true,
            visualCues: true,
            difficultyLevel: "beginner",
          },
          privacy: {
            dataSharing: false,
            analytics: true,
          },
        },
      });
    } catch (error) {
      console.error("Get user preferences error:", error);
      res.status(500).json({
        error: "Failed to get user preferences",
        message: error.message,
      });
    }
  },

  // Get biometric data for VR sessions
  async getBiometricData(req, res) {
    try {
      const { uid } = req.user;

      // For now, return simulated biometric data
      // In a real implementation, this would integrate with actual biometric sensors
      const biometricData = {
        heartRate: Math.floor(Math.random() * 20) + 60, // 60-80 BPM
        stressLevel: Math.floor(Math.random() * 30) + 20, // 20-50%
        focusScore: Math.floor(Math.random() * 25) + 75, // 75-100%
        breathingRate: Math.floor(Math.random() * 8) + 12, // 12-20 breaths/min
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        biometricData,
      });
    } catch (error) {
      console.error("Get biometric data error:", error);
      res.status(500).json({
        error: "Failed to get biometric data",
        message: error.message,
      });
    }
  },

  // Get exercise plans
  async getExercisePlans(req, res) {
    try {
      const { type, difficulty } = req.query;

      const filter = { isActive: true };
      if (type) filter.type = type;
      if (difficulty) filter.difficulty = difficulty;

      const exercisePlans = await ExercisePlan.find(filter).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        exercisePlans,
      });
    } catch (error) {
      console.error("Get exercise plans error:", error);
      res.status(500).json({
        error: "Failed to get exercise plans",
        message: error.message,
      });
    }
  },

  // Get single exercise plan
  async getExercisePlan(req, res) {
    try {
      const { id } = req.params;

      const exercisePlan = await ExercisePlan.findById(id);

      if (!exercisePlan) {
        return res.status(404).json({
          error: "Exercise plan not found",
        });
      }

      res.json({
        success: true,
        exercisePlan,
      });
    } catch (error) {
      console.error("Get exercise plan error:", error);
      res.status(500).json({
        error: "Failed to get exercise plan",
        message: error.message,
      });
    }
  },

  // Start exercise session
  async startExerciseSession(req, res) {
    try {
      const { uid } = req.user;
      const { exercisePlanId } = req.body;

      const exercisePlan = await ExercisePlan.findById(exercisePlanId);
      if (!exercisePlan) {
        return res.status(404).json({
          error: "Exercise plan not found",
        });
      }

      const newSession = new ExerciseSession({
        userId: uid,
        exercisePlanId,
        sessionType: exercisePlan.type,
        plannedDuration: exercisePlan.duration,
        status: "active",
      });

      const savedSession = await newSession.save();

      // Initialize computer vision monitoring
      const cvResult = await computerVisionService.initializeSession(
        savedSession._id.toString(),
        exercisePlan,
        (poseAnalysis) => {
          // Handle pose detection results
          this.handlePoseDetection(savedSession._id, poseAnalysis);
        },
        (breathingAnalysis) => {
          // Handle breathing detection results
          this.handleBreathingDetection(savedSession._id, breathingAnalysis);
        }
      );

      res.status(201).json({
        success: true,
        message: "Exercise session started successfully",
        sessionId: savedSession._id,
        computerVision: cvResult,
      });
    } catch (error) {
      console.error("Start exercise session error:", error);
      res.status(500).json({
        error: "Failed to start exercise session",
        message: error.message,
      });
    }
  },

  // Update exercise session progress
  async updateExerciseProgress(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { currentExercise, completedExercise } = req.body;

      const session = await ExerciseSession.findOne({ _id: id, userId: uid });

      if (!session) {
        return res.status(404).json({
          error: "Exercise session not found",
        });
      }

      if (currentExercise !== undefined) {
        session.progress.currentExercise = currentExercise;
      }

      if (completedExercise) {
        session.progress.completedExercises.push({
          exerciseIndex: completedExercise.exerciseIndex,
          completedAt: new Date(),
          duration: completedExercise.duration,
          accuracy: completedExercise.accuracy,
          breathingAccuracy: completedExercise.breathingAccuracy,
        });
      }

      await session.save();

      res.json({
        success: true,
        message: "Exercise progress updated successfully",
        session,
      });
    } catch (error) {
      console.error("Update exercise progress error:", error);
      res.status(500).json({
        error: "Failed to update exercise progress",
        message: error.message,
      });
    }
  },

  // Complete exercise session
  async completeExerciseSession(req, res) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { actualDuration, feedback, rating } = req.body;

      const session = await ExerciseSession.findOne({ _id: id, userId: uid });

      if (!session) {
        return res.status(404).json({
          error: "Exercise session not found",
        });
      }

      session.status = "completed";
      session.actualDuration = actualDuration;
      session.completedAt = new Date();

      if (feedback) {
        session.feedback = feedback;
      }
      if (rating) {
        session.feedback.rating = rating;
      }

      // Calculate overall accuracy
      const completedExercises = session.progress.completedExercises;
      if (completedExercises.length > 0) {
        const totalAccuracy = completedExercises.reduce(
          (sum, exercise) => sum + (exercise.accuracy || 0),
          0
        );
        session.progress.overallAccuracy =
          totalAccuracy / completedExercises.length;
      }

      await session.save();

      // Stop computer vision monitoring
      computerVisionService.stopSession(id);

      res.json({
        success: true,
        message: "Exercise session completed successfully",
        session,
      });
    } catch (error) {
      console.error("Complete exercise session error:", error);
      res.status(500).json({
        error: "Failed to complete exercise session",
        message: error.message,
      });
    }
  },

  // Get exercise sessions
  async getExerciseSessions(req, res) {
    try {
      const { uid } = req.user;
      const { page = 1, limit = 10, sessionType } = req.query;

      const filter = { userId: uid };
      if (sessionType) {
        filter.sessionType = sessionType;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sessions = await ExerciseSession.find(filter)
        .populate("exercisePlanId", "name type difficulty")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ExerciseSession.countDocuments(filter);

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
      console.error("Get exercise sessions error:", error);
      res.status(500).json({
        error: "Failed to get exercise sessions",
        message: error.message,
      });
    }
  },

  // Handle pose detection results
  async handlePoseDetection(sessionId, poseAnalysis) {
    try {
      const session = await ExerciseSession.findById(sessionId);
      if (!session) return;

      session.monitoringData.poseTracking.push({
        timestamp: poseAnalysis.timestamp,
        exerciseIndex: session.progress.currentExercise,
        keyPoints: poseAnalysis.keyPoints,
        accuracy: poseAnalysis.accuracy,
        feedback: poseAnalysis.feedback,
      });

      await session.save();
    } catch (error) {
      console.error("Handle pose detection error:", error);
    }
  },

  // Handle breathing detection results
  async handleBreathingDetection(sessionId, breathingAnalysis) {
    try {
      const session = await ExerciseSession.findById(sessionId);
      if (!session) return;

      session.monitoringData.breathingTracking.push({
        timestamp: breathingAnalysis.timestamp,
        exerciseIndex: session.progress.currentExercise,
        inhaleDuration: breathingAnalysis.breathingData.inhaleDuration,
        exhaleDuration: breathingAnalysis.breathingData.exhaleDuration,
        holdDuration: breathingAnalysis.breathingData.holdDuration,
        accuracy: breathingAnalysis.accuracy,
        feedback: breathingAnalysis.feedback,
      });

      await session.save();
    } catch (error) {
      console.error("Handle breathing detection error:", error);
    }
  },
};
