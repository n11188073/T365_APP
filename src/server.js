// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from your Netlify site
app.use(cors());
app.use(express.json());

// Connect to SQLite

const path = require('path');
const dbPath = path.join(__dirname, '..', 't65sql.db');
console.log('Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database.');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE
  )
`);

// Save or update user
app.post('/saveUser', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    db.run(
        `INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)`,
        [name, email],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User saved successfully', id: this.lastID });
        }
    );
});

// Fetch all users
app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
