// src/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

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

/// - - - Upload and Display Posts

// ---------------------
// Helpers
// ---------------------

// Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AEST timestamp
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60; // 10 hours
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = n => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth() + 1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// ---------------------
// Routes
// ---------------------

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API running', dbPath });
});

// Create post + upload media
app.post('/create-post', upload.array('files'), async (req, res) => {
  const { post_name, location, tags, user_id } = req.body;
  const files = req.files || [];

  if (!post_name || post_name.trim() === '') {
    return res.status(400).json({ message: 'Post name is required' });
  }

  const created_at = getAESTTimestamp();

  try {
    // Insert post
    const postId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO posts (post_name, user_id, location, tags, bookmark_itenerary, num_likes, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_name, user_id || null, location || null, tags || null, null, null, null],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Insert media
    for (const file of files) {
      const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO media (post_id, type, filename, data, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [postId, type, file.originalname, file.buffer, created_at],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({ message: 'Post and media saved successfully', post_id: postId, post_name });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all posts with media
app.get('/posts', (req, res) => {
  const query = `
    SELECT p.post_id, p.post_name, p.user_id, p.num_likes, p.comments,
           p.location, p.tags, p.bookmark_folder, p.bookmark_itenerary,
           m.id AS media_id, m.type, m.filename, m.data, m.created_at
    FROM posts p
    LEFT JOIN media m ON p.post_id = m.post_id
    ORDER BY m.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching posts' });

    // Convert BLOBs to base64
    const postsWithBase64 = rows.map(row => {
      if (row.data) row.data = Buffer.from(row.data).toString('base64');
      return row;
    });

    res.json({ posts: postsWithBase64 });
  });
});

// List media only
app.get('/media', (req, res) => {
  db.all('SELECT id, type, filename, LENGTH(data) AS size, created_at FROM media', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error querying media' });
    res.json({ media: rows });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
