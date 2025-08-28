// saveUser.js
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // for JSON body parsing

// Open database connection to t365backend/t65sql.db
let db;
(async () => {
  const dbPath = path.resolve("t365backend", "t65sql.db"); // <- updated path
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  console.log(`Connected to database at ${dbPath}`);
})();

// Save user API
app.post("/api/saveUser", async (req, res) => {
  const { user_id, user_name } = req.body;

  if (!user_id || !user_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user exists
    const existing = await db.get(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [user_id]
    );

    if (existing) {
      // User exists, return success without inserting
      return res.json({ message: "User already exists", user: existing });
    }

    // Insert new user
    await db.run(
      `INSERT INTO user_profiles (user_id, user_name, user_country, user_bio, user_points) 
       VALUES (?, ?, '', '', 0)`,
      [user_id, user_name]
    );

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
