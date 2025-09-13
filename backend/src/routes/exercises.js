import express from "express";
import Exercise from "../models/Exercise.js";
import ExerciseSession from "../models/ExerciseSession.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all exercises
router.get("/exercises", authMiddleware, async (req, res) => {
  try {
    const { category, difficulty, muscleGroup } = req.query;

    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (muscleGroup) {
      filter["metrics.muscleGroups"] = muscleGroup;
    }

    const exercises = await Exercise.find(filter)
      .select("-poseLandmarks.transitions") // Exclude transitions for list view
      .sort({ name: 1 });

    res.json({
      success: true,
      exercises,
      count: exercises.length,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exercises",
      error: error.message,
    });
  }
});

// Get single exercise with full details
router.get("/exercises/:id", authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.json({
      success: true,
      exercise,
    });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exercise",
      error: error.message,
    });
  }
});

// Start exercise session
router.post("/exercises/:id/start", authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    // Create new exercise session
    const session = new ExerciseSession({
      userId: req.user.uid,
      exercisePlanId: null, // Individual exercise, not part of a plan
      sessionType: exercise.category,
      plannedDuration: exercise.duration,
      actualDuration: 0,
      status: "active",
      progress: {
        currentExercise: 0,
        completedExercises: [],
        overallAccuracy: 0,
      },
      monitoringData: {
        poseTracking: [],
        breathingTracking: [],
        heartRate: [],
      },
      achievements: [],
    });

    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        exercise: {
          id: exercise._id,
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          instructions: exercise.instructions,
          poseLandmarks: exercise.poseLandmarks,
          mediapipeConfig: exercise.mediapipeConfig,
        },
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error("Error starting exercise session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start exercise session",
      error: error.message,
    });
  }
});

// Update exercise session with pose data
router.post("/sessions/:sessionId/pose", authMiddleware, async (req, res) => {
  try {
    const { landmarks, accuracy, feedback, timestamp } = req.body;

    const session = await ExerciseSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Exercise session not found",
      });
    }

    if (session.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to session",
      });
    }

    // Add pose tracking data
    session.monitoringData.poseTracking.push({
      timestamp: timestamp || new Date(),
      exerciseIndex: session.progress.currentExercise,
      keyPoints: landmarks,
      accuracy: accuracy || 0,
      feedback: feedback || "",
    });

    // Update overall accuracy
    const recentPoses = session.monitoringData.poseTracking.slice(-10);
    const avgAccuracy =
      recentPoses.reduce((sum, pose) => sum + pose.accuracy, 0) /
      recentPoses.length;
    session.progress.overallAccuracy = Math.round(avgAccuracy);

    await session.save();

    res.json({
      success: true,
      message: "Pose data recorded",
      overallAccuracy: session.progress.overallAccuracy,
    });
  } catch (error) {
    console.error("Error recording pose data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record pose data",
      error: error.message,
    });
  }
});

// Complete exercise session
router.post(
  "/sessions/:sessionId/complete",
  authMiddleware,
  async (req, res) => {
    try {
      const { rating, comments, difficulty, enjoyment } = req.body;

      const session = await ExerciseSession.findById(req.params.sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Exercise session not found",
        });
      }

      if (session.userId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to session",
        });
      }

      // Update session completion
      session.status = "completed";
      session.completedAt = new Date();
      session.actualDuration = Math.floor(
        (session.completedAt - session.startedAt) / 1000 / 60
      ); // in minutes

      // Add feedback if provided
      if (rating || comments || difficulty || enjoyment) {
        session.feedback = {
          rating: rating || null,
          comments: comments || "",
          difficulty: difficulty || null,
          enjoyment: enjoyment || null,
        };
      }

      // Add completion achievement
      session.achievements.push({
        type: "completed_session",
        earnedAt: new Date(),
        exerciseIndex: session.progress.currentExercise,
      });

      await session.save();

      res.json({
        success: true,
        message: "Exercise session completed",
        session: {
          id: session._id,
          actualDuration: session.actualDuration,
          overallAccuracy: session.progress.overallAccuracy,
          achievements: session.achievements,
        },
      });
    } catch (error) {
      console.error("Error completing exercise session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete exercise session",
        error: error.message,
      });
    }
  }
);

// Get user's exercise sessions
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    let filter = { userId: req.user.uid };
    if (status) {
      filter.status = status;
    }

    const sessions = await ExerciseSession.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select(
        "-monitoringData.poseTracking -monitoringData.breathingTracking -monitoringData.heartRate"
      );

    const totalCount = await ExerciseSession.countDocuments(filter);

    res.json({
      success: true,
      sessions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + sessions.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching exercise sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exercise sessions",
      error: error.message,
    });
  }
});

// Get exercise categories and filters
router.get("/exercises/filters", authMiddleware, async (req, res) => {
  try {
    const categories = await Exercise.distinct("category", { isActive: true });
    const difficulties = await Exercise.distinct("difficulty", {
      isActive: true,
    });
    const muscleGroups = await Exercise.distinct("metrics.muscleGroups", {
      isActive: true,
    });
    const equipment = await Exercise.distinct("metrics.equipment", {
      isActive: true,
    });

    res.json({
      success: true,
      filters: {
        categories: categories.sort(),
        difficulties: difficulties.sort(),
        muscleGroups: muscleGroups.sort(),
        equipment: equipment.sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching exercise filters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exercise filters",
      error: error.message,
    });
  }
});

export default router;
