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
const dbPath = path.join(__dirname, '..', 't365backend', 't65sql.db');
console.log('Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database.');
});

// Save or update user
app.post('/saveUser', (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) {
    return res.status(400).json({ error: 'user_id and user_name are required' });
  }

  db.run(
    `INSERT OR IGNORE INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) VALUES (?, ?, '', '', 0)`,
    [user_id, user_name],
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
