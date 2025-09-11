// src/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // keep secret in production //--------------------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "708003752619-2c5sop4u7m30rg6pngpcumjacsfumobh.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Enable CORS for frontend with credentials (cookies)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://cozy-mousse-7c2a8f.netlify.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

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

// -------------------------
// Authentication Routes
// -------------------------

// Login using Google token
app.post('/api/login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing Google token" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user_id = payload.sub;
    const user_name = payload.name || payload.email;

    // Save user to DB if not exists
    const existing = await dbAll(`SELECT * FROM user_profiles WHERE user_id = '${user_id}'`);
    if (!existing.length) {
      db.run(
        `INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points)
         VALUES (?, ?, '', '', 0)`,
        [user_id, user_name]
      );
    }

    // Create signed JWT
    const jwtToken = jwt.sign({ id: user_id, name: user_name }, JWT_SECRET, { expiresIn: '7d' });

    // Set HttpOnly cookie
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Example protected route
app.get('/api/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// -------------------------
// Existing APIs
// -------------------------

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

// List all users
app.get('/users', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM user_profiles');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save user
app.post('/api/saveUser', async (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) return res.status(400).json({ error: 'Missing user_id or user_name' });

  try {
    const existing = await dbAll(`SELECT * FROM user_profiles WHERE user_id = '${user_id}'`);
    if (existing.length > 0) return res.json({ message: 'User already exists', user: existing[0] });

    db.run(
      `INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points)
       VALUES (?, ?, '', '', 0)`,
      [user_id, user_name],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'User created successfully', user_id });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Multer setup for media
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AEST timestamp helper
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60;
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = n => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth() + 1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API running', dbPath });
});

// Create post + upload media
app.post('/create-post', upload.array('files'), async (req, res) => {
  const { post_name, location, tags, user_id } = req.body;
  const files = req.files || [];

  if (!post_name || post_name.trim() === '') return res.status(400).json({ message: 'Post name is required' });

  const created_at = getAESTTimestamp();

  try {
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

// Save itinerary (protected route)
app.post('/api/saveItinerary', authenticate, (req, res) => {
  const { title } = req.body;
  const owner_id = req.user.id;

  db.run(
    `INSERT INTO itineraries (owner_id, title) VALUES (?, ?)`,
    [owner_id, title || ""],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Itinerary created successfully', itinerary_id: this.lastID });
    }
  );
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
