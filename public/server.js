// server.js
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------------
// Database Setup
// ---------------------
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.db');

// Ensure DB file exists locally (only for dev)
if (!fs.existsSync(dbPath)) {
  console.log(`No database at ${dbPath}, creating new file...`);
  fs.closeSync(fs.openSync(dbPath, 'w'));
}

console.log('Using database at:', dbPath);

// Open DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open database:', err);
  else console.log('Database opened at:', dbPath);
});

// Create tables if not exist
db.serialize(() => {
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
});

// ---------------------
// File Upload
// ---------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------
// Helpers
// ---------------------
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60; // 10 hours in minutes
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth() + 1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// ---------------------
// Routes
// ---------------------

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API running', dbPath });
});

// Create post
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
        [post_name, user_id, location, tags, null, null, null],
        function (err) {
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
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({ message: 'Post and media saved', post_id: postId, post_name });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get posts
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

    const postsWithBase64 = rows.map((row) => {
      if (row.data) row.data = Buffer.from(row.data).toString('base64');
      return row;
    });

    res.json({ posts: postsWithBase64 });
  });
});

// ---------------------
// Start server
// ---------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
