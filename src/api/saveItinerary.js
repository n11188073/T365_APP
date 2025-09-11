// saveItinerary.js
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // for JSON body parsing

// Open database connection
let db;
(async () => {
  const dbPath = path.resolve("t365backend", "t65sql.db");
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  console.log(`Connected to database at ${dbPath}`);
})();

// Save itinerary API
app.post("/api/saveItinerary", async (req, res) => {
  let { owner_id, title } = req.body;

  // Default owner_id to 1 if not provided
  if (!owner_id) owner_id = 1;
  if (!title) title = "";

  try {
    const result = await db.run(
      `INSERT INTO itineraries (owner_id, title) VALUES (?, ?)`,
      [owner_id, title]
    );

    res.json({
      message: "Itinerary created successfully",
      itinerary_id: result.lastID, // auto-incremented ID
    });
  } catch (err) {
    console.error("Error saving itinerary:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// Start server
const PORT = 5001; // ⚠️ change if 5000 is already used
app.listen(PORT, () => {
  console.log(`✅ SaveItinerary server running on http://localhost:${PORT}`);
});
