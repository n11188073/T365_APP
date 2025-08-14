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

// Ensure media table exists
db.run(
  `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      type TEXT NOT NULL,
      filename TEXT NOT NULL,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(post_id) REFERENCES posts(post_id)
  )`,
  (err) => {
    if (err) console.error('Failed to create media table:', err);
    else console.log('Media table ready.');
  }
);

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

app.post('/create-post', upload.array('files'), async (req, res) => {
  const post_name = req.body.post_name; // multer parses this correctly
  const files = req.files;               // multer saves uploaded files in req.files

  if (!post_name) {
    return res.status(400).json({ message: 'Post name is required' });
  }

  try {
    const created_at = getAESTTimestamp();

    // Insert post
    const postId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO posts (post_name) VALUES (?)`,
        [post_name],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Insert media linked to post
    if (files && files.length > 0) {
      for (const file of files) {
        const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO media (post_id, type, filename, data, created_at) VALUES (?, ?, ?, ?, ?)`,
            [postId, type, file.originalname, file.buffer, created_at],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    res.json({ message: 'Post and media saved successfully', post_id: postId });
  } catch (err) {
    console.error('Error saving post:', err);
    res.status(500).json({ message: 'Server error while saving post' });
  }
});

// Get posts + media
app.get('/posts', (req, res) => {
  const query = `
    SELECT p.post_id, p.post_name, p.user_id, p.num_likes, p.comments,
           p.location, p.tags, p.bookmark_folder, p.bookmark_itenerary,
           m.id AS media_id, m.type, m.filename, LENGTH(m.data) AS size, m.created_at
    FROM posts p
    LEFT JOIN media m ON p.post_id = m.post_id
    ORDER BY m.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ message: 'Error fetching posts' });
    }
    res.json({ posts: rows });
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
  console.log(`Server running on http://localhost:${port}`);
});
