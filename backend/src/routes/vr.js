import express from 'express';
import {
  getExercises,
  getExerciseById,
  checkVrDependencies,
  getVrExercises,
  startVrExerciseTracking,
  stopVrExerciseTracking,
  getActiveVrSessions,
  getUserExerciseSessions,
  getExerciseSessionById,
  updateExerciseSessionFeedback,
  getUserExerciseStats
} from '../controllers/vrController.js';

const router = express.Router();

// Exercise management routes
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExerciseById);

// VR system routes
router.get('/vr-dependencies', checkVrDependencies);
router.get('/vr-exercises', getVrExercises);

// VR exercise tracking routes
router.post('/vr-exercise-tracking', startVrExerciseTracking);
router.delete('/vr-exercise-tracking/:sessionId', stopVrExerciseTracking);
router.get('/vr-active-sessions', getActiveVrSessions);

// Exercise session routes
router.get('/sessions', getUserExerciseSessions);
router.get('/sessions/:id', getExerciseSessionById);
router.put('/sessions/:id/feedback', updateExerciseSessionFeedback);

// Statistics routes
router.get('/stats', getUserExerciseStats);

export default router;
