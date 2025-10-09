// src/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: ["http://localhost:3000", "https://cozy-mousse-7c2a8f.netlify.app"],
  credentials: true,
}));
app.use(express.json());

// --- SQLite Database ---
const dbPath = path.resolve(__dirname, '../t365backend/t65sql.db');
console.log('Using database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB connection error:', err);
  else console.log('Connected to SQLite database:', dbPath);
});

// --- Helper Promises ---
const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });

// --- Multer (memory storage) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Utility: AEST timestamp ---
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60; // +10 hours
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = n => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth()+1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// --- Health check ---
app.get('/', (req, res) => res.json({ message: 'API running', dbPath }));

// --- Database Viewer APIs ---
// Get all table names
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

// Get all rows from a specific table
app.get('/api/table/:name', async (req, res) => {
  const { name } = req.params;

  // Sanitize table name
  if (!/^[a-zA-Z0-9_]+$/.test(name))
    return res.status(400).json({ error: 'Invalid table name' });

  try {
    const rows = await dbAll(`SELECT * FROM ${name}`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching table data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Users ---
app.post('/api/saveUser', async (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) return res.status(400).json({ error: 'Missing user_id or user_name' });

  try {
    const existing = await dbAll('SELECT * FROM user_profiles WHERE user_id = ?', [user_id]);
    if (existing.length > 0)
      return res.json({ message: 'User already exists', user: existing[0] });

    db.run(
      `INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points)
       VALUES (?, ?, '', '', 0)`,
      [user_id, user_name],
      function (err) {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ message: 'User created successfully', user_id });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// --- Posts ---
// Create post
app.post('/create-post', upload.array('files'), async (req, res) => {
  const { post_name, location, tags, user_id } = req.body;
  const files = req.files || [];

  if (!post_name?.trim()) return res.status(400).json({ message: 'Post name required' });
  if (!user_id?.trim()) return res.status(400).json({ message: 'user_id required' });

  try {
    const user = await dbGet('SELECT user_id FROM user_profiles WHERE user_id = ?', [user_id]);
    if (!user) return res.status(400).json({ message: 'Invalid user_id' });
  } catch {
    return res.status(500).json({ message: 'DB error' });
  }

  const created_at = getAESTTimestamp();

  try {
    const postId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO posts (post_name, user_id, location, tags, bookmark_itenerary, num_likes, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_name, user_id, location || null, tags || null, null, 0, null],
        function (err) { if (err) reject(err); else resolve(this.lastID); }
      );
    });

    for (const file of files) {
      const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO media (post_id, type, filename, data, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [postId, type, file.originalname, file.buffer, created_at],
          function (err) { if (err) reject(err); else resolve(); }
        );
      });
    }

    res.json({ message: 'Post and media saved', post_id: postId, post_name });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all posts with media (always returns media array)
app.get('/posts', async (req, res) => {
  const query = `
    SELECT p.post_id, p.post_name, p.user_id, p.num_likes, p.comments,
           p.location, p.tags,
           m.id AS media_id, m.type, m.filename, m.data, m.created_at
    FROM posts p
    LEFT JOIN media m ON p.post_id = m.post_id
    ORDER BY p.post_id DESC, m.created_at ASC
  `;

  try {
    const rows = await dbAll(query);
    const postsMap = {};

    rows.forEach(row => {
      if (!postsMap[row.post_id]) {
        postsMap[row.post_id] = {
          post_id: row.post_id,
          post_name: row.post_name,
          user_id: row.user_id,
          num_likes: row.num_likes,
          comments: row.comments,
          location: row.location,
          tags: row.tags,
          media: [],
        };
      }
      if (row.media_id && row.data) {
        postsMap[row.post_id].media.push({
          id: row.media_id,
          type: row.type,
          filename: row.filename,
          data: Buffer.from(row.data).toString('base64'),
        });
      }
    });

    res.json({ posts: Object.values(postsMap) });
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// --- Media list ---
app.get('/media', async (req, res) => {
  try {
    const rows = await dbAll('SELECT id, type, filename, data, created_at FROM media ORDER BY created_at DESC');
    const media = rows.map(row => ({
      id: row.id,
      type: row.type,
      filename: row.filename,
      created_at: row.created_at,
      data: row.data ? Buffer.from(row.data).toString('base64') : null,
    }));
    res.json({ media });
  } catch (err) {
    console.error('Media list error:', err);
    res.status(500).json({ message: 'Error querying media' });
  }
});

// --- Start Server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
