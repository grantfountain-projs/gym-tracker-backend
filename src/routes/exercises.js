import express from 'express'
import { getAllExercises, getExerciseById, createExercise, updateExercise, deleteExercise } from '../controllers/exerciseController.js'
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllExercises);

router.get('/:id', getExerciseById);

router.post('/', authMiddleware, createExercise);

router.put('/:id', authMiddleware, updateExercise);

router.delete('/:id', authMiddleware, deleteExercise);

export default router;