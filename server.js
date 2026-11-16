const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ti28122005',
    database: 'recipe_app_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database (recipe_app_db)!');
});

const authRoutes = require('./routes/auth')(db);
app.use('/api/auth', authRoutes);

const fridgeRoutes = require('./routes/fridge')(db);
app.use('/api/fridge', fridgeRoutes);

const recipeRoutes = require('./routes/recipes')(db);
app.use('/api/recipes', recipeRoutes);

const plannerRoutes = require('./routes/planner')(db);
app.use('/api/planner', plannerRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
