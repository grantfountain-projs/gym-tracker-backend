import pool from '../config/db.js'

// POST /workouts/:workoutId/sets
export const createSet = async (req, res) => {
    const { workoutId } = req.params;
    const { exercise_id, set_number, reps, weight, rpe } = req.body;
    const userId = req.user.userId;
    
    try {
        const workoutCheck = await pool.query(
            'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
            [workoutId, userId]);
          
        if (workoutCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Workout not found or unauthorized' });
        }

        const insertSet = await pool.query('INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight, rpe) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [workoutId, exercise_id, set_number, reps, weight, rpe]);
        
        const newSet = insertSet.rows[0];
        return res.status(201).json({ message: 'Successfully created new set', set: newSet});

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  // GET /workouts/:workoutId/sets
  export const getSetsByWorkoutId = async (req, res) => {
    const { workoutId } = req.params;
    const userId = req.user.userId;
    
    try {
        const workoutCheck = await pool.query(
            'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
            [workoutId, userId]);
          
        if (workoutCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Workout not found or unauthorized' });
        }
        const findSetsById = await pool.query(
            `SELECT ws.*, e.name as exercise_name, e.muscle_group 
             FROM workout_sets ws
             JOIN exercises e ON ws.exercise_id = e.id
             WHERE ws.workout_id = $1
             ORDER BY ws.set_number`,
            [workoutId]
        );

        return res.status(200).json({ message: 'Successfully retrieved all sets', sets: findSetsById.rows});
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }

  }
  
  // PUT /sets/:id
  export const updateSet = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const { exercise_id, set_number, reps, weight, rpe } = req.body;
    
    try {
        const setCheck = await pool.query(
            `SELECT ws.* FROM workout_sets ws
             JOIN workouts w ON ws.workout_id = w.id
             WHERE ws.id = $1 AND w.user_id = $2`,
            [id, userId]
        );
          
        if (setCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Set not found or unauthorized' });
        }

        const updatedSet = await pool.query('UPDATE workout_sets SET exercise_id = $1, set_number = $2, reps = $3, weight = $4, rpe = $5 WHERE id = $6 RETURNING *', 
            [exercise_id, set_number, reps, weight, rpe, id]);
        
        if (updatedSet.rows.length === 0) {
            return res.status(404).json({ message: 'Set not found' });
        }

        return res.status(200).json({ message: "Successfully updated set", set: updatedSet.rows[0] });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }

  }
  
  // DELETE /sets/:id
  export const deleteSet = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    
    try {
        const setCheck = await pool.query(
            `SELECT ws.* FROM workout_sets ws
             JOIN workouts w ON ws.workout_id = w.id
             WHERE ws.id = $1 AND w.user_id = $2`,
            [id, userId]
        );
          
        if (setCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Set not found or unauthorized' });
        }

        const deletedSet = await pool.query('DELETE FROM workout_sets WHERE id = $1 RETURNING *', [id]);
        
        if (deletedSet.rows.length === 0) {
            return res.status(404).json({ message: 'Set not found' });
        }

        return res.status(200).json({ message: "Successfully deleted set" });
        
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
  }