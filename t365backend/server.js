// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------------
// Database setup
// ---------------------
const dbPath = path.join(__dirname, '..', 't365backend', 't65sql.db');
console.log('Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open database:', err);
  else console.log('Database opened at:', dbPath);
});

// Ensure tables exist
db.serialize(() => {
  // Posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      post_id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_name TEXT CHECK(length(post_name) <= 100),
      user_id INTEGER,
      num_likes INTEGER,
      comments TEXT,
      location TEXT CHECK(length(location) <= 100),
      tags TEXT CHECK(length(tags) <= 255),
      bookmark_folder TEXT CHECK(length(bookmark_folder) <= 50),
      bookmark_itenerary TEXT CHECK(length(bookmark_itenerary) <= 50)
    )
  `);

  // Media table
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      filename TEXT NOT NULL,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL,
      post_id INTEGER
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      user_name TEXT
    )
  `);

  // User profiles table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      user_name TEXT,
      user_country TEXT,
      user_bio TEXT,
      user_points INTEGER
    )
  `);
});

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

// Save or update user
app.post('/saveUser', (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) return res.status(400).json({ error: 'user_id and user_name are required' });

  db.run(
    `INSERT OR IGNORE INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) VALUES (?, ?, '', '', 0)`,
    [user_id, user_name],
    function(err) {
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

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
