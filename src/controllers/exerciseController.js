import pool from '../config/db.js'


export const getAllExercises = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM exercises ORDER BY name');
        return res.status(200).json({ message: 'Successfully retrieved all exercises', exercises: result.rows });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getExerciseById = async (req, res) => {
    const { id } = req.params;
    try {
        const findExerciseById = await pool.query('SELECT * FROM exercises WHERE id = $1', [id]);
        if (findExerciseById.rows.length === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        return res.status(200).json({ message: 'Successfully retrieved exercise', exercise: findExerciseById.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const createExercise = async (req, res) => {
    const { name, muscle_group } = req.body;
    try {
        const insertExercise = await pool.query('INSERT INTO exercises (name, muscle_group) VALUES ($1, $2) RETURNING *', [name, muscle_group]);
        const newExercise = insertExercise.rows[0];
        return res.status(201).json({ message: 'Successfully created new exercise', exercise: newExercise});
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Exercise with this name already exists' });
        }
        // Invalid muscle group 
        if (error.code === '23514') {
            return res.status(400).json({ message: 'Invalid muscle group' });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateExercise = async (req, res) => {
    const { id } =  req.params;
    const { name, muscle_group } = req.body;
    try {
        const updatedExercise = await pool.query('UPDATE exercises SET name = $1, muscle_group = $2 WHERE id = $3 RETURNING *', [name, muscle_group, id]);
        if (updatedExercise.rows.length === 0) {
            return res.status(404).json({ message: 'Exercise not found'});
        }
        return res.status(200).json({ message: 'Successfully updated exercise', exercise: updatedExercise.rows[0]});
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Exercise with this name already exists' });
        }
        // Invalid muscle group 
        if (error.code === '23514') {
            return res.status(400).json({ message: 'Invalid muscle group' });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteExercise = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExercise = await pool.query('DELETE FROM exercises WHERE id = $1 RETURNING *', [id]);
        if (deletedExercise.rows.length === 0) {
            return res.status(404).json({ message: 'Exercise not found'});
        }
        return res.status(200).json({ message: 'Exercise successfully deleted'});
    } catch (error) {
        // Exercise is being used in workouts 
        if (error.code === '23503') {
            return res.status(409).json({ message: 'Cannot delete exercise - it is used in existing workouts' });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


