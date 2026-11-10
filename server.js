const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

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

app.get('/', (req, res) => {
    res.send('Server is running and ready for recipes!');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});