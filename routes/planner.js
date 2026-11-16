const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Adaugă o rețetă în planul de masă
    router.post('/', (req, res) => {
        const { user_id, recipe_id, date, meal_type, servings } = req.body;

        if (!user_id || !recipe_id || !date || !meal_type) {
            return res.status(400).json({ error: 'Please provide user_id, recipe_id, date, and meal_type.' });
        }

        const query = `
            INSERT INTO meal_plans (user_id, recipe_id, date, meal_type, servings)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE servings = VALUES(servings)
        `;

        db.query(query, [user_id, recipe_id, date, meal_type, servings || 1], (err, result) => {
            if (err) {
                console.error('Error adding meal plan:', err);
                return res.status(500).json({ error: 'Database error adding meal plan.' });
            }
            res.status(201).json({ message: 'Meal added to plan successfully!', id: result.insertId });
        });
    });

    // 2. Afișează meniul planificat pentru un utilizator
    router.get('/:userId', (req, res) => {
        const { userId } = req.params;

        const query = `
            SELECT 
                mp.id,
                mp.date,
                mp.meal_type,
                mp.servings,
                r.id AS recipe_id,
                r.title AS recipe_title,
                r.prep_time_minutes
            FROM meal_plans mp
            JOIN recipes r ON mp.recipe_id = r.id
            WHERE mp.user_id = ?
            ORDER BY mp.date ASC, FIELD(mp.meal_type, 'breakfast', 'lunch', 'snack', 'dinner')
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching meal plans:', err);
                return res.status(500).json({ error: 'Database error fetching meal plans.' });
            }
            res.status(200).json(results);
        });
    });

    // 3. Generează automat lista de cumpărături din meniul planificat minus ce e în frigider
    router.post('/generate-shopping-list/:userId', (req, res) => {
        const { userId } = req.params;

        const calcQuery = `
            SELECT 
                ri.ingredient_id,
                ri.unit,
                GREATEST(0, SUM(ri.quantity * (mp.servings / r.servings)) - COALESCE(uf.quantity, 0)) AS needed_quantity
            FROM meal_plans mp
            JOIN recipes r ON mp.recipe_id = r.id
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            LEFT JOIN user_fridge uf ON ri.ingredient_id = uf.ingredient_id AND uf.user_id = mp.user_id
            WHERE mp.user_id = ?
            GROUP BY ri.ingredient_id, ri.unit, uf.quantity
            HAVING needed_quantity > 0
        `;

        db.query(calcQuery, [userId], (err, neededItems) => {
            if (err) {
                console.error('Error calculating shopping list:', err);
                return res.status(500).json({ error: 'Database error calculating shopping list.' });
            }

            if (neededItems.length === 0) {
                return res.status(200).json({ message: 'You already have all ingredients in your fridge!' });
            }

            const values = neededItems.map(item => [userId, item.ingredient_id, item.needed_quantity, item.unit]);
            const insertQuery = `
                INSERT INTO shopping_list_items (user_id, ingredient_id, quantity, unit)
                VALUES ?
                ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), is_bought = FALSE
            `;

            db.query(insertQuery, [values], (err) => {
                if (err) {
                    console.error('Error saving shopping list:', err);
                    return res.status(500).json({ error: 'Database error saving shopping list.' });
                }
                res.status(201).json({
                    message: 'Shopping list generated successfully!',
                    itemsCount: neededItems.length
                });
            });
        });
    });

    // 4. Afișează lista de cumpărături a utilizatorului
    router.get('/shopping-list/:userId', (req, res) => {
        const { userId } = req.params;

        const query = `
            SELECT 
                sli.id,
                sli.ingredient_id,
                i.name AS ingredient_name,
                i.category,
                sli.quantity,
                sli.unit,
                sli.is_bought
            FROM shopping_list_items sli
            JOIN ingredients i ON sli.ingredient_id = i.id
            WHERE sli.user_id = ?
            ORDER BY sli.is_bought ASC, i.category ASC, i.name ASC
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching shopping list:', err);
                return res.status(500).json({ error: 'Database error fetching shopping list.' });
            }
            res.status(200).json(results);
        });
    });

    // 5. Bifează / debifează un produs de pe lista de cumpărături
    router.patch('/shopping-list/:itemId', (req, res) => {
        const { itemId } = req.params;
        const { is_bought } = req.body;

        const query = 'UPDATE shopping_list_items SET is_bought = ? WHERE id = ?';

        db.query(query, [is_bought ? 1 : 0, itemId], (err, result) => {
            if (err) {
                console.error('Error updating shopping list item:', err);
                return res.status(500).json({ error: 'Database error updating item.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Shopping list item not found.' });
            }
            res.status(200).json({ message: 'Shopping list item updated!' });
        });
    });

    return router;
};