require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true   // datele (DATE) vin ca text "2026-11-19", fără decalaj de fus orar
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
    console.log(`Successfully connected to the MySQL database (${process.env.DB_NAME})!`);
});

app.use('/api/auth', require('./routes/auth')(db));
app.use('/api/fridge', require('./routes/fridge')(db));
app.use('/api/recipes', require('./routes/recipes')(db));
app.use('/api/planner', require('./routes/planner')(db));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});