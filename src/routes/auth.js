import express from 'express'
import rateLimit from 'express-rate-limit';
import { register, login, me, deleteUser} from '../controllers/authController.js'
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                    // 5 registrations per hour
    message: { message: 'Too many registration attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 login attempts per 15 min
    message: { message: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerLimiter, register);

router.post('/login', loginLimiter, login);

router.get('/me', authMiddleware, me);

router.delete('/me', authMiddleware, deleteUser);


export default router;