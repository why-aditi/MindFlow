import Exercise from '../models/Exercise.js';
import ExerciseSession from '../models/ExerciseSession.js';

// Get all available exercises
export const getExercises = async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;

    const exercises = await Exercise.find(filter)
      .sort({ category: 1, difficulty: 1, name: 1 });

    res.json({
      success: true,
      exercises,
      count: exercises.length
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercises'
    });
  }
};

// Get exercise by ID
export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      exercise
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercise'
    });
  }
};

// Check Python VR dependencies
export const checkVrDependencies = async (req, res) => {
  try {
    const isAvailable = await pythonVRService.checkDependencies();
    
    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable 
        ? 'Python VR dependencies are available' 
        : 'Python VR dependencies not available'
    });
  } catch (error) {
    console.error('Error checking VR dependencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check VR dependencies'
    });
  }
};

// Get available exercises from Python script
export const getVrExercises = async (req, res) => {
  try {
    const exercises = await pythonVRService.getAvailableExercises();
    
    res.json({
      success: true,
      exercises,
      count: exercises.length
    });
  } catch (error) {
    console.error('Error getting VR exercises:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get VR exercises'
    });
  }
};

// Start VR exercise tracking
export const startVrExerciseTracking = async (req, res) => {
  try {
    const { exerciseType, duration } = req.body;
    const userId = req.user.uid;
    
    if (!exerciseType) {
      return res.status(400).json({
        success: false,
        error: 'Exercise type is required'
      });
    }

    // Generate session ID
    const sessionId = `session_${userId}_${Date.now()}`;

    // Find exercise in database
    const exercise = await Exercise.findOne({ name: exerciseType });
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found in database'
      });
    }

    // Create exercise session record
    const exerciseSession = new ExerciseSession({
      userId,
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      sessionType: exercise.type,
      plannedDuration: duration || exercise.duration,
      status: 'active'
    });

    await exerciseSession.save();

    // Browser-based VR tracking (no Python script needed)
    console.log(`VR Exercise session started: ${exerciseType} (Session: ${sessionId})`);
    
    res.json({
      success: true,
      sessionId,
      exerciseSession: exerciseSession._id,
      message: 'VR exercise tracking started successfully'
    });
  } catch (error) {
    console.error('Error starting VR exercise tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start VR exercise tracking'
    });
  }
};

// Stop VR exercise tracking
export const stopVrExerciseTracking = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    // Browser-based VR tracking (no Python script to stop)
    console.log(`VR Exercise session stopped: ${sessionId}`);
    
    // Update exercise session record
    const exerciseSession = await ExerciseSession.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (exerciseSession) {
      exerciseSession.status = 'completed';
      exerciseSession.actualDuration = 0; // Will be updated by frontend timer
      exerciseSession.completedAt = new Date();
      
      await exerciseSession.save();
    }

    res.json({
      success: true,
      message: 'VR exercise tracking stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping VR exercise tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop VR exercise tracking'
    });
  }
};

// Get active VR sessions
export const getActiveVrSessions = async (req, res) => {
  try {
    const activeSessions = pythonVRService.getActiveSessions();
    
    res.json({
      success: true,
      sessions: activeSessions,
      count: activeSessions.length
    });
  } catch (error) {
    console.error('Error getting active VR sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active VR sessions'
    });
  }
};

// Get user's exercise sessions
export const getUserExerciseSessions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const sessions = await ExerciseSession.find({ userId })
      .populate('exerciseId', 'name displayName category type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ExerciseSession.countDocuments({ userId });

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user exercise sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercise sessions'
    });
  }
};

// Get exercise session by ID
export const getExerciseSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const session = await ExerciseSession.findOne({ _id: id, userId })
      .populate('exerciseId', 'name displayName category type instructions');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Exercise session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercise session'
    });
  }
};

// Update exercise session feedback
export const updateExerciseSessionFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { rating, comments, difficulty, enjoyment } = req.body;
    
    const session = await ExerciseSession.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Exercise session not found'
      });
    }

    // Update feedback
    if (rating !== undefined) session.feedback.rating = rating;
    if (comments !== undefined) session.feedback.comments = comments;
    if (difficulty !== undefined) session.feedback.difficulty = difficulty;
    if (enjoyment !== undefined) session.feedback.enjoyment = enjoyment;

    await session.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      session
    });
  } catch (error) {
    console.error('Error updating exercise session feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback'
    });
  }
};

// Get exercise statistics for user
export const getUserExerciseStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get basic stats
    const totalSessions = await ExerciseSession.countDocuments({ userId });
    const completedSessions = await ExerciseSession.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    
    // Get total time spent
    const timeStats = await ExerciseSession.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$actualDuration' },
          avgTime: { $avg: '$actualDuration' }
        }
      }
    ]);

    // Get exercise type distribution
    const typeStats = await ExerciseSession.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
          totalTime: { $sum: '$actualDuration' }
        }
      }
    ]);

    // Get recent activity
    const recentSessions = await ExerciseSession.find({ userId })
      .populate('exerciseId', 'name displayName category')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        totalTime: timeStats[0]?.totalTime || 0,
        avgTime: timeStats[0]?.avgTime || 0,
        typeDistribution: typeStats,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Error fetching user exercise stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercise statistics'
    });
  }
};
