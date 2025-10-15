const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "708003752619-2c5sop4u7m30rg6pngpcumjacsfumobh.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// -------------------------
// Middleware
// -------------------------
app.use(cors({
  origin: ["http://localhost:3000", "https://cozy-mousse-7c2a8f.netlify.app"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// -------------------------
// SQLite Database
// -------------------------
const dbPath = path.resolve(__dirname, '../t365backend/t65sql.db');
console.log('Using database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database.');
});

// Helper Promises
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { if (err) reject(err); else resolve(this.lastID); });
});

// -------------------------
// Utility: AEST timestamp
// -------------------------
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60;
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = n => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth() + 1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// -------------------------
// Authentication
// -------------------------
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login
app.post('/api/login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing Google token" });
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const user_id = payload.sub;
    const user_name = payload.name || payload.email;

    const existing = await dbAll(`SELECT * FROM user_profiles WHERE user_id = ?`, [user_id]);
    if (!existing.length) {
      await dbRun(`INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) VALUES (?, ?, '', '', 0)`, [user_id, user_name]);
    }

    const jwtToken = jwt.sign({ id: user_id, name: user_name }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: 'Logged in successfully', user: { id: user_id, name: user_name } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out' });
});

// Protected example
app.get('/api/me', authenticate, (req, res) => res.json({ user: req.user }));

// -------------------------
// Database Viewer
// -------------------------
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await dbAll(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
    res.json(tables.map(t => t.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/table/:name', async (req, res) => {
  const { name } = req.params;
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return res.status(400).json({ error: 'Invalid table name' });
  try {
    const rows = await dbAll(`SELECT * FROM ${name}`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// -------------------------
// Users
// -------------------------
app.post('/api/saveUser', async (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) return res.status(400).json({ error: 'Missing user_id or user_name' });
  try {
    const existing = await dbAll('SELECT * FROM user_profiles WHERE user_id = ?', [user_id]);
    if (existing.length > 0) return res.json({ message: 'User already exists', user: existing[0] });
    await dbRun(`INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) VALUES (?, ?, '', '', 0)`, [user_id, user_name]);
    res.json({ message: 'User created successfully', user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// -------------------------
// Posts & Media
// -------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create Post
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
    const postId = await dbRun(
      `INSERT INTO posts (post_name, user_id, location, tags, bookmark_itenerary, num_likes, comments) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [post_name, user_id, location || null, tags || null, null, 0, null]
    );

    for (const file of files) {
      const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
      await dbRun(
        `INSERT INTO media (post_id, type, filename, data, created_at) VALUES (?, ?, ?, ?, ?)`,
        [postId, type, file.originalname, file.buffer, created_at]
      );
    }

    res.json({ message: 'Post and media saved', post_id: postId, post_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get Posts (optionally filter by user_id)
app.get('/posts', async (req, res) => {
  const { user_id } = req.query;
  let query = `
    SELECT p.post_id, p.post_name, p.user_id, p.num_likes, p.comments,
           p.location, p.tags,
           m.id AS media_id, m.type, m.filename, m.data, m.created_at
    FROM posts p
    LEFT JOIN media m ON p.post_id = m.post_id
  `;
  const params = [];
  if (user_id) {
    query += " WHERE p.user_id = ?";
    params.push(user_id);
  }
  query += " ORDER BY p.post_id DESC, m.created_at ASC";

  try {
    const rows = await dbAll(query, params);
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
          media: []
        };
      }
      if (row.media_id && row.data) {
        postsMap[row.post_id].media.push({
          id: row.media_id,
          type: row.type,
          filename: row.filename,
          data: Buffer.from(row.data).toString('base64')
        });
      }
    });
    res.json({ posts: Object.values(postsMap) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Media list
app.get('/media', async (req, res) => {
  try {
    const rows = await dbAll('SELECT id, type, filename, data, created_at FROM media ORDER BY created_at DESC');
    res.json({ media: rows.map(r => ({ ...r, data: r.data ? Buffer.from(r.data).toString('base64') : null })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error querying media' });
  }
});

// -------------------------
// Edit Post
// -------------------------
app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { post_name, location, tags } = req.body;

  if (!post_name?.trim()) return res.status(400).json({ message: "Post name required" });

  try {
    await dbRun(
      `UPDATE posts SET post_name = ?, location = ?, tags = ? WHERE post_id = ?`,
      [post_name, location || null, tags || null, id]
    );

    const row = await dbGet("SELECT * FROM posts WHERE post_id = ?", [id]);
    if (!row) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post updated successfully", post: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -------------------------
// Delete Post
// -------------------------
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await dbRun("DELETE FROM media WHERE post_id = ?", [id]);

    const row = await dbGet("SELECT * FROM posts WHERE post_id = ?", [id]);
    if (!row) return res.status(404).json({ message: "Post not found" });

    await dbRun("DELETE FROM posts WHERE post_id = ?", [id]);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -------------------------
// Itineraries Routes
// -------------------------
const itinerariesRoutes = require("../src/api/itineraries");
app.use("/api/itineraries", itinerariesRoutes(db));

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
