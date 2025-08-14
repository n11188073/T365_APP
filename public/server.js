// server.js (Node/Express)
import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const db = await open({ filename: './database.db', driver: sqlite3.Database });

// Make tables if not exist
await db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  post_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_name TEXT,
  num_likes INTEGER DEFAULT 0,
  comments TEXT,
  location TEXT,
  tags TEXT,
  bookmark_folder TEXT,
  bookmark_itinerary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

app.post('/api/posts', upload.array('files'), async (req, res) => {
  const { user_id, post_name, location, tags } = req.body;
  const files = req.files || [];

  // For simplicity, store file names as comma-separated string
  const fileNames = files.map(f => f.originalname).join(',');

  const result = await db.run(
    `INSERT INTO posts (user_id, post_name, location, tags, comments) VALUES (?, ?, ?, ?, ?)`,
    [user_id, post_name, location, tags, fileNames]
  );

  res.json({ post_id: result.lastID });
});

app.get('/api/posts', async (req, res) => {
  const posts = await db.all(`SELECT * FROM posts ORDER BY created_at DESC`);
  res.json(posts);
});

app.listen(5000, () => console.log('Server running on port 5000'));
