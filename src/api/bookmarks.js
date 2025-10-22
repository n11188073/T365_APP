const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // -------------------------
  // Add bookmark
  // -------------------------
  router.post("/add", async (req, res) => {
    const { post_id, itinerary_id } = req.body;
    if (!post_id || !itinerary_id)
      return res.status(400).json({ error: "Missing post_id or itinerary_id" });

    try {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO bookmark_posts_itineraries (post_id, itinerary_id) VALUES (?, ?)`,
          [post_id, itinerary_id],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error adding bookmark:", err);
      res.status(500).json({ error: "Failed to add bookmark" });
    }
  });

  // -------------------------
  // Remove bookmark
  // -------------------------
  router.post("/remove", async (req, res) => {
    const { post_id, itinerary_id } = req.body;
    if (!post_id || !itinerary_id)
      return res.status(400).json({ error: "Missing post_id or itinerary_id" });

    try {
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM bookmark_posts_itineraries WHERE post_id = ? AND itinerary_id = ?`,
          [post_id, itinerary_id],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error removing bookmark:", err);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  return router;
};
