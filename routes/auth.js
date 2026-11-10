const express = require('express');
const router = express.Router();

// Aici vom defini ruta de Register
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Verificăm dacă datele au fost trimise
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    // Momentan doar trimitem un răspuns de succes ca să testăm legătura
    res.status(201).json({ message: `User ${username} registered successfully!` });
});

module.exports = router;