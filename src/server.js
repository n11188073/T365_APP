// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');   // keep path only once
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from local + Netlify
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cozy-mousse-7c2a8f.netlify.app/"
    ],
    credentials: true,
  })
);

app.use(express.json());

// Session middleware
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60, //24 * 60 * 60 * 1000, // 1 day in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);


// Connect to SQLite
const dbPath = path.join(__dirname, '..', 't365backend', 't65sql.db');
console.log('Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database.');
});

// Save or update user
app.post('/saveUser', (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id || !user_name) {
    return res.status(400).json({ error: 'user_id and user_name are required' });
  }

  db.run(
    `INSERT OR IGNORE INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) VALUES (?, ?, '', '', 0)`,
    [user_id, user_name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // store session
      req.session.user = { id: user_id, name: user_name };
      res.json({ message: 'User saved & session started', id: user_id });
    }
  );
});

// Check current session
app.get("/me", (req, res) => {
  console.log("Session:", req.session);
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});


// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// Fetch all users
app.get('/users', (req, res) => {
  db.all(`SELECT * FROM user_profiles`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
