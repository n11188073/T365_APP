const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (db) => {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

  const authenticate = (req, res, next) => {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      res.status(401).json({ error: "Invalid token" });
    }
  };


  router.get("/post/:post_id", authenticate, (req, res) => {
    const { post_id } = req.params;
    const user_id = req.user?.id;

    if (!post_id) {
      return res.status(400).json({ error: "Missing post_id" });
    }

    const sql = `
      SELECT itinerary_id 
      FROM bookmark_posts_itineraries 
      WHERE post_id = ? AND user_id = ?
    `;

    db.all(sql, [post_id, user_id], (err, rows) => {
      if (err) {
        console.error("Error fetching bookmarks:", err);
        return res.status(500).json({ error: "Failed to fetch bookmarks" });
      }
      res.json(rows);
    });
  });

  router.post("/add", authenticate, (req, res) => {
    const { post_id, itinerary_id } = req.body;
    const user_id = req.user?.id;

    if (!post_id || !itinerary_id) {
      return res.status(400).json({ error: "Missing post_id or itinerary_id" });
    }

    const sql = `
      INSERT INTO bookmark_posts_itineraries (post_id, itinerary_id, user_id)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [post_id, itinerary_id, user_id], function (err) {
      if (err) {
        console.error("Error adding bookmark:", err);
        return res.status(500).json({ error: "Failed to add bookmark" });
      }

      console.log(
        `Inserted bookmark: id=${this.lastID}, post_id=${post_id}, itinerary_id=${itinerary_id}, user_id=${user_id}`
      );
      res.json({ success: true, id: this.lastID });
    });
  });

  router.post("/remove", authenticate, (req, res) => {
    const { post_id, itinerary_id } = req.body;
    const user_id = req.user?.id;

    if (!post_id || !itinerary_id) {
      return res.status(400).json({ error: "Missing post_id or itinerary_id" });
    }

    const sql = `
      DELETE FROM bookmark_posts_itineraries
      WHERE post_id = ? AND itinerary_id = ? AND user_id = ?
    `;

    db.run(sql, [post_id, itinerary_id, user_id], function (err) {
      if (err) {
        console.error("Error removing bookmark:", err);
        return res.status(500).json({ error: "Failed to remove bookmark" });
      }

      console.log(
        `Deleted rows: ${this.changes} for user_id=${user_id}, post_id=${post_id}, itinerary_id=${itinerary_id}`
      );
      res.json({ success: true });
    });
  });

  return router;
};
