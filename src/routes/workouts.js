import express from 'express'
import { getAllWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workoutController.js'
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllWorkouts);

router.get('/:id', authMiddleware, getWorkoutById);

router.post('/', authMiddleware, createWorkout);

router.put('/:id', authMiddleware, updateWorkout);

router.delete('/:id', authMiddleware, deleteWorkout);

export default router;