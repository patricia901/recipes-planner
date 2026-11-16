const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Afișează conținutul frigiderului pentru un utilizator
    router.get('/:userId', (req, res) => {
        const { userId } = req.params;

        const query = `
            SELECT 
                uf.id,
                uf.ingredient_id,
                i.name AS ingredient_name,
                i.category,
                uf.quantity,
                uf.unit
            FROM user_fridge uf
            JOIN ingredients i ON uf.ingredient_id = i.id
            WHERE uf.user_id = ?
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching fridge items:', err);
                return res.status(500).json({ error: 'Database error fetching fridge items.' });
            }
            res.status(200).json(results);
        });
    });

    // 2. Adaugă un ingredient în frigider (sau actualizează cantitatea dacă există deja)
    router.post('/', (req, res) => {
        const { user_id, ingredient_id, quantity, unit } = req.body;

        if (!user_id || !ingredient_id || !quantity || !unit) {
            return res.status(400).json({ error: 'Please provide user_id, ingredient_id, quantity, and unit.' });
        }

        const query = `
            INSERT INTO user_fridge (user_id, ingredient_id, quantity, unit)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), unit = VALUES(unit)
        `;

        db.query(query, [user_id, ingredient_id, quantity, unit], (err, result) => {
            if (err) {
                console.error('Error adding item to fridge:', err);
                return res.status(500).json({ error: 'Database error adding item to fridge.' });
            }

            res.status(201).json({
                message: 'Item added/updated in fridge successfully!',
                id: result.insertId
            });
        });
    });

    // 3. Șterge un ingredient din frigider
    router.delete('/:userId/:ingredientId', (req, res) => {
        const { userId, ingredientId } = req.params;

        const query = 'DELETE FROM user_fridge WHERE user_id = ? AND ingredient_id = ?';

        db.query(query, [userId, ingredientId], (err, result) => {
            if (err) {
                console.error('Error deleting item from fridge:', err);
                return res.status(500).json({ error: 'Database error deleting item from fridge.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found in fridge.' });
            }

            res.status(200).json({ message: 'Item removed from fridge successfully!' });
        });
    });

    return router;
};