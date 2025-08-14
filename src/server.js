const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const os = require('os');

const app = express();
const port = 5000;

// Enable CORS and JSON parsing
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

// Ensure media table exists (created_at as TEXT)
db.run(
  `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      filename TEXT NOT NULL,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL
  )`,
  (err) => {
    if (err) console.error('Failed to create table:', err);
    else console.log('Media table ready.');
  }
);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Function to get current timestamp in AEST as YYYY-MM-DD HH:MM:SS
function getAESTTimestamp() {
  const now = new Date();
  const aestOffset = 10 * 60; // 10 hours in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);

  const pad = (n) => n.toString().padStart(2, '0');
  const year = aestTime.getFullYear();
  const month = pad(aestTime.getMonth() + 1);
  const day = pad(aestTime.getDate());
  const hours = pad(aestTime.getHours());
  const minutes = pad(aestTime.getMinutes());
  const seconds = pad(aestTime.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Upload endpoint
app.post('/upload', upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.log('No files uploaded.');
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
            const filename = file.originalname;
            const data = file.buffer;
            const created_at = getAESTTimestamp();

            if (!data || data.length === 0) {
              console.error('File buffer is empty:', filename);
              return reject(new Error('Empty file buffer'));
            }

            db.run(
              `INSERT INTO media (type, filename, data, created_at) VALUES (?, ?, ?, ?)`,
              [type, filename, data, created_at],
              function (err) {
                if (err) {
                  console.error('DB insert error for', filename, err);
                  reject(err);
                } else {
                  console.log(`Inserted ${filename} with ID ${this.lastID} into DB`);
                  resolve();
                }
              }
            );
          })
      )
    );

    res.json({ message: 'Uploaded successfully!' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Endpoint to check DB contents
app.get('/media', (req, res) => {
  db.all('SELECT id, type, filename, LENGTH(data) AS size, created_at FROM media', [], (err, rows) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Error querying database' });
    }
    res.json({ media: rows });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
