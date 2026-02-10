import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import pool from './config/db.js'
import authRouter from './routes/auth.js'
import workoutRouter from './routes/workouts.js'
import exerciseRouter from './routes/exercises.js'

dotenv.config()


const app = express()
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/workouts', workoutRouter);
app.use('/exercises', exerciseRouter);

const port = process.env.PORT || 3000;

// Health Check
app.get('/health', (req, res) => {
    res.send('Backend is up and running');
});

// Test database connection
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()')
        console.log('Database connected:', result.rows[0]);
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    testConnection();
});
