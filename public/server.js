const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const os = require('os');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Dynamic database path
const homeDir = os.homedir();
const dbPath = path.join(homeDir, 'Downloads', 'T365_APP', 'T365_APP', 'my', 'db', 'database.db');
console.log('Database path:', dbPath);

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Failed to open database:', err);
  else console.log('Database opened at:', dbPath);
});

// Ensure posts table exists
db.run(
  `CREATE TABLE IF NOT EXISTS posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_name TEXT CHECK(length(post_name) <= 100),
    user_id INTEGER,
    num_likes INTEGER,
    comments TEXT,
    location TEXT CHECK(length(location) <= 100),
    tags TEXT CHECK(length(tags) <= 255),
    bookmark_folder TEXT CHECK(length(bookmark_folder) <= 50),
    bookmark_itenerary TEXT CHECK(length(bookmark_itenerary) <= 50)
  )`,
  (err) => {
    if (err) console.error('Failed to create posts table:', err);
    else console.log('Posts table ready.');
  }
);

// Ensure media table exists
db.run(
  `CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL
  )`,
  (err) => {
    if (err) console.error('Failed to create media table:', err);
    else console.log('Media table ready.');
  }
);

// Add post_id column if it doesn't exist
db.all(`PRAGMA table_info(media)`, [], (err, columns) => {
  if (err) return console.error('Error checking media table columns:', err);
  const hasPostId = columns.some(col => col.name === 'post_id');
  if (!hasPostId) {
    db.run(`ALTER TABLE media ADD COLUMN post_id INTEGER`, (err) => {
      if (err) console.error('Failed to add post_id column to media table:', err);
      else console.log('Added post_id column to media table.');
    });
  }
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Timestamp in AEST
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60; // 10 hours in minutes
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${aestTime.getFullYear()}-${pad(aestTime.getMonth() + 1)}-${pad(aestTime.getDate())} ${pad(aestTime.getHours())}:${pad(aestTime.getMinutes())}:${pad(aestTime.getSeconds())}`;
}

// Create post endpoint
app.post('/create-post', upload.array('files'), async (req, res) => {
  const { post_name } = req.body;
  const files = req.files || [];

  if (!post_name || post_name.trim() === '') {
    return res.status(400).json({ message: 'Post name is required' });
  }

  const location = req.body.location || null;
  const tags = req.body.tags || null;
  const tagPeople = req.body.tagPeople || null;
  const user_id = req.body.user_id || null;
  const created_at = getAESTTimestamp();

  console.log('Creating post:', { post_name, location, tags, tagPeople, user_id });
  console.log('Files:', files.map(f => f.originalname));

  try {
    // Insert post
    const postId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO posts (post_name, user_id, location, tags, bookmark_itenerary, num_likes, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_name, user_id, location, tags, null, null, null],
        function(err) {
          if (err) {
            console.error('SQLite error inserting post:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });

    // Insert media linked to post
    for (const file of files) {
      const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO media (post_id, type, filename, data, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [postId, type, file.originalname, file.buffer, created_at],
          function(err) {
            if (err) {
              console.error('SQLite error inserting media:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    res.json({ message: 'Post and media saved successfully', post_id: postId, post_name });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error while saving post', error: err.message });
  }
});

// Get posts + media
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
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ message: 'Error fetching posts' });
    }

    // Convert media BLOBs to base64
    const postsWithBase64 = rows.map(row => {
      if (row.data) {
        row.data = Buffer.from(row.data).toString('base64');
      }
      return row;
    });

    res.json({ posts: postsWithBase64 });
  });
});


// Old media check endpoint
app.get('/media', (req, res) => {
  db.all('SELECT id, type, filename, LENGTH(data) AS size, created_at FROM media', [], (err, rows) => {
    if (err) {
      console.error('Error querying media:', err);
      return res.status(500).json({ message: 'Error querying media' });
    }
    res.json({ media: rows });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
