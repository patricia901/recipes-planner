const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Register
    router.post('/register', (req, res) => {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'Please provide full_name, email, and password.' });
        }

        const query = 'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)';
        
        db.query(query, [full_name, email, password], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                if (err.errno === 1062) {
                    return res.status(400).json({ error: 'Email already exists.' });
                }
                return res.status(500).json({ error: 'Database error during registration.' });
            }

            res.status(201).json({ 
                message: 'User registered successfully!',
                userId: result.insertId 
            });
        });
    });

    // Login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        const query = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
        
        db.query(query, [email, password], (err, results) => {
            if (err) {
                console.error('Error during login:', err);
                return res.status(500).json({ error: 'Database error during login.' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            const user = results[0];
            res.status(200).json({
                message: 'Login successful!',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                }
            });
        });
    });

    return router;
};