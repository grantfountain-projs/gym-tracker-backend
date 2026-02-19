import pool from '../config/db.js'

const getAllWorkouts = async (req, res) => {
    const { userId } = req.user;

    try {
        const result = await pool.query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC', [userId]);
        return res.status(200).json({ message: "All workouts successfully retrieved", workouts: result.rows});
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }

}

const getWorkoutById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const workout = await pool.query('SELECT * FROM workouts WHERE id = $1 AND user_id = $2', [id, userId]);
        if (workout.rows.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        return res.status(200).json({ message: 'Successfully retrieved workout', workout: workout.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const createWorkout = async (req, res) => {
    const { date, notes } = req.body;  // Get date and notes from request
    
    try {
        const insertWorkout = await pool.query(
            'INSERT INTO workouts (user_id, date, notes) VALUES ($1, $2, $3) RETURNING *', 
            [req.user.userId, date, notes]
        );
        
        const workout = insertWorkout.rows[0];
        return res.status(201).json({ message: 'Successfully created workout', workout: workout });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
    
}

const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { date, notes, completed_at } = req.body;

    try {
        const updatedWorkout = await pool.query(
            'UPDATE workouts SET date = $1, notes = $2, completed_at = $3 WHERE id = $4 AND user_id = $5 RETURNING *', 
            [date, notes, completed_at, id, userId]  // Added completed_at
        );
        if (updatedWorkout.rows.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        return res.status(200).json({ message: 'Workout successfully updated.', workout: updatedWorkout.rows[0]});
        
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const deletedWorkout = await pool.query('DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (deletedWorkout.rows.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        return res.status(200).json({ message: "Workout deleted successfully"});
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getWorkoutStats = async (req, res) => {
    const { userId } = req.user;

    try {
        // Total completed workouts
        const totalResult = await pool.query(
            'SELECT COUNT(*) FROM workouts WHERE user_id = $1 AND completed_at IS NOT NULL',
            [userId]
        );

        // This week's completed workouts (week starts Monday)
        const thisWeekResult = await pool.query(
            `SELECT COUNT(*) FROM workouts 
             WHERE user_id = $1 
             AND completed_at IS NOT NULL 
             AND completed_at >= date_trunc('week', NOW())`,
            [userId]
        );

        // Streak - get distinct completed days ordered by most recent
        const streakResult = await pool.query(
            `SELECT DISTINCT DATE(completed_at) as day 
             FROM workouts 
             WHERE user_id = $1 AND completed_at IS NOT NULL 
             ORDER BY day DESC`,
            [userId]
        );

        // Calculate streak by checking for consecutive days
        let streak = 0;
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

        for (let i = 0; i < streakResult.rows.length; i++) {
            const workoutDay = new Date(streakResult.rows[i].day);
            const expectedDay = new Date(todayUTC);
            expectedDay.setUTCDate(todayUTC.getUTCDate() - i);

            if (workoutDay.getTime() === expectedDay.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return res.status(200).json({
            totalWorkouts: parseInt(totalResult.rows[0].count),
            thisWeek: parseInt(thisWeekResult.rows[0].count),
            streak
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};





export { getAllWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout, getWorkoutStats };