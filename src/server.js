// src/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' }); // folder to store uploaded files

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

// SQLite DB path
const dbPath = path.resolve(__dirname, '../t365backend/t65sql.db');
console.log('Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database.');
});

// Helper: run query as promise
const dbAll = (sql) =>
  new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// --- API Routes ---

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await dbAll(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    res.json(tables.map(t => t.name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all rows of a table
app.get('/api/table/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const rows = await dbAll(`SELECT * FROM ${name}`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching table data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Example: list all users
app.get('/users', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM user_profiles');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Save user API ---
app.post('/api/saveUser', async (req, res) => {
  const { user_id, user_name } = req.body;

  if (!user_id || !user_name) {
    return res.status(400).json({ error: 'Missing user_id or user_name' });
  }

  try {
    // Check if user already exists
    const existing = await dbAll(
      `SELECT * FROM user_profiles WHERE user_id = '${user_id}'`
    );

    if (existing.length > 0) {
      // User exists
      return res.json({ message: 'User already exists', user: existing[0] });
    }

    // Insert new user
    db.run(
      `INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points)
       VALUES (?, ?, '', '', 0)`,
      [user_id, user_name],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User created successfully', user_id });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});



// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
