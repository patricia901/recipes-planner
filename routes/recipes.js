const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Listează toate rețetele publice
    router.get('/', (req, res) => {
        const query = `
            SELECT r.*, u.full_name AS author_name 
            FROM recipes r
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.is_public = TRUE
            ORDER BY r.created_at DESC
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching recipes:', err);
                return res.status(500).json({ error: 'Database error fetching recipes.' });
            }
            res.status(200).json(results);
        });
    });

    // 2. Sugestii de rețete în funcție de ce are utilizatorul în frigider
    router.get('/match/:userId', (req, res) => {
        const { userId } = req.params;

        const query = `
            SELECT 
                r.id,
                r.title,
                r.description,
                r.prep_time_minutes,
                r.servings,
                COUNT(ri.ingredient_id) AS total_ingredients,
                COUNT(uf.ingredient_id) AS available_ingredients,
                ROUND((COUNT(uf.ingredient_id) / COUNT(ri.ingredient_id)) * 100) AS match_percentage
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            LEFT JOIN user_fridge uf ON ri.ingredient_id = uf.ingredient_id AND uf.user_id = ?
            WHERE r.is_public = TRUE
            GROUP BY r.id
            ORDER BY match_percentage DESC, r.prep_time_minutes ASC
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error matching recipes with fridge:', err);
                return res.status(500).json({ error: 'Database error matching recipes.' });
            }
            res.status(200).json(results);
        });
    });

    // 3. Detaliile complete ale unei rețete + ingredientele necesare
    router.get('/:id', (req, res) => {
        const { id } = req.params;

        const recipeQuery = 'SELECT * FROM recipes WHERE id = ?';
        const ingredientsQuery = `
            SELECT 
                ri.ingredient_id,
                i.name AS ingredient_name,
                i.category,
                ri.quantity,
                ri.unit
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = ?
        `;

        db.query(recipeQuery, [id], (err, recipeResults) => {
            if (err) {
                console.error('Error fetching recipe:', err);
                return res.status(500).json({ error: 'Database error fetching recipe.' });
            }
            if (recipeResults.length === 0) {
                return res.status(404).json({ error: 'Recipe not found.' });
            }

            db.query(ingredientsQuery, [id], (err, ingResults) => {
                if (err) {
                    console.error('Error fetching recipe ingredients:', err);
                    return res.status(500).json({ error: 'Database error fetching ingredients.' });
                }

                res.status(200).json({
                    ...recipeResults[0],
                    ingredients: ingResults
                });
            });
        });
    });

    // 4. Adaugă o rețetă nouă + ingredientele ei
    router.post('/', (req, res) => {
        const { author_id, title, description, instructions, prep_time_minutes, servings, image_url, ingredients } = req.body;

        if (!title || !instructions || !prep_time_minutes) {
            return res.status(400).json({ error: 'Please provide title, instructions, and prep_time_minutes.' });
        }

        const insertRecipeQuery = `
            INSERT INTO recipes (author_id, title, description, instructions, prep_time_minutes, servings, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertRecipeQuery,
            [author_id || null, title, description || '', JSON.stringify(instructions), prep_time_minutes, servings || 1, image_url || null],
            (err, result) => {
                if (err) {
                    console.error('Error creating recipe:', err);
                    return res.status(500).json({ error: 'Database error creating recipe.' });
                }

                const newRecipeId = result.insertId;

                if (!ingredients || ingredients.length === 0) {
                    return res.status(201).json({ message: 'Recipe created successfully!', recipeId: newRecipeId });
                }

                const values = ingredients.map(item => [newRecipeId, item.ingredient_id, item.quantity, item.unit]);
                const insertIngQuery = 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES ?';

                db.query(insertIngQuery, [values], (err) => {
                    if (err) {
                        console.error('Error adding recipe ingredients:', err);
                        return res.status(500).json({ error: 'Recipe created, but failed to add ingredients.' });
                    }

                    res.status(201).json({
                        message: 'Recipe and ingredients created successfully!',
                        recipeId: newRecipeId
                    });
                });
            }
        );
    });

    return router;
};