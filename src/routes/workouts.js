import express from 'express'
import { getAllWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workoutController.js'
import { getSetsByWorkoutId, createSet, updateSet, deleteSet } from '../controllers/setController.js'
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Workout routes
router.get('/', authMiddleware, getAllWorkouts);
router.get('/:id', authMiddleware, getWorkoutById);
router.post('/', authMiddleware, createWorkout);
router.put('/:id', authMiddleware, updateWorkout);
router.delete('/:id', authMiddleware, deleteWorkout);

// Set routes (nested under workouts)
router.get('/:workoutId/sets', authMiddleware, getSetsByWorkoutId);
router.post('/:workoutId/sets', authMiddleware, createSet);
router.put('/sets/:id', authMiddleware, updateSet);
router.delete('/sets/:id', authMiddleware, deleteSet);

export default router;