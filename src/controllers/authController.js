import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const saltRounds = 10

const register = async (req, res) => {
    const { email, password } = req.body; 
    
    // Basic presence check
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, saltRounds);
        const insertUser = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *', [email, hash]);

        // Get the newly created user
        const newUser = insertUser.rows[0];
        
        // Create payload
        const payload = {
            userId: newUser.id,
            email: newUser.email
        };
        
        // Sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ message: "Successfully Registered!", token: token });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const findUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (findUserByEmail.rows.length == 0) {
            return res.status(401).json({ message: "User doesn't exist" });
        }
        
        const user = findUserByEmail.rows[0];
        const hash = user.password_hash;
        const isMatch = await bcrypt.compare(password, hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const payload = {
            userId: user.id,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({ message: "Login Successful", token: token});

        

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

const me = async (req, res) => {
    const {userId} = req.user;
    
    try {
        const findUserById = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]);

        if (findUserById.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = findUserById.rows[0];
        return res.status(200).json({ user: user});

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }

}

const deleteUser = async (req, res) => {
    const { userId } = req.user;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { register, login, me, deleteUser };
