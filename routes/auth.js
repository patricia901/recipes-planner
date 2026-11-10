const express = require('express');
const router = express.Router();

// Aici presupunem că poți exporta sau trimite conexiunea bazei de date. 
// Ca să fie simplu, putem trimite conexiunea direct sau o exportăm din server.js.
// O variantă foarte curată este să preluăm conexiunea pe care o ai deja în proiect.

module.exports = (db) => {
    // Ruta de Register
    router.post('/register', (req, res) => {
        const { username, email, password } = req.body;

        // Verificăm dacă toate câmpurile sunt completate
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Please provide username, email, and password.' });
        }

        // Interogare pentru a insera utilizatorul în baza de date
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        
        db.query(query, [username, email, password], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                // Codul 1062 în MySQL înseamnă duplicat (de exemplu, email sau username deja existent)
                if (err.errno === 1062) {
                    return res.status(400).json({ error: 'Username or email already exists.' });
                }
                return res.status(500).json({ error: 'Database error during registration.' });
            }

            res.status(201).json({ 
                message: 'User registered successfully!',
                userId: result.insertId 
            });
        });
    });

    return router;
};