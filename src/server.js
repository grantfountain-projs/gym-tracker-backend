import express from 'express'
import dotenv from 'dotenv'
import pool from './config/db.js'
import authRouter from './routes/auth.js'

dotenv.config()


const app = express()
app.use(express.json());

app.use('/auth', authRouter);

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
