const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  // -------------------------
  // Get bookmarks for a specific post
  // -------------------------
  router.get("/post/:post_id", async (req, res) => {
    const { post_id } = req.params;
    const user_id = req.user?.id || "unknown";

    if (!post_id)
      return res.status(400).json({ error: "Missing post_id" });

    try {
      db.all(
        `SELECT itinerary_id FROM bookmark_posts_itineraries WHERE post_id = ? AND user_id = ?`,
        [post_id, user_id],
        (err, rows) => {
          if (err) {
            console.error("Error fetching bookmarks:", err);
            return res.status(500).json({ error: "Failed to fetch bookmarks" });
          }
          res.json(rows); // [{ itinerary_id: 4 }, ...]
        }
      );
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });


  // -------------------------
  // Add bookmark
  // -------------------------
router.post("/add", (req, res) => {
  const { post_id, itinerary_id } = req.body;
  const user_id = req.user?.id || "unknown";

  if (!post_id || !itinerary_id) {
    return res.status(400).json({ error: "Missing post_id or itinerary_id" });
  }

  db.serialize(() => {
    db.run(
      `INSERT INTO bookmark_posts_itineraries (post_id, itinerary_id, user_id) VALUES (?, ?, ?)`,
      [post_id, itinerary_id, user_id],
      function (err) {
        if (err) {
          console.error("Error adding bookmark:", err);
          return res.status(500).json({ error: "Failed to add bookmark" });
        }
        console.log(
          `Inserted bookmark: id=${this.lastID}, post_id=${post_id}, itinerary_id=${itinerary_id}, user_id=${user_id}`
        );
        res.json({ success: true });
      }
    );
  });
});

  // -------------------------
  // Remove bookmark
  // -------------------------
  router.post("/remove", async (req, res) => {
    const { post_id, itinerary_id } = req.body;

    console.log("/remove called with:", { post_id, itinerary_id });

    if (!post_id || !itinerary_id)
      return res.status(400).json({ error: "Missing post_id or itinerary_id" });

    try {
      await new Promise((resolve, reject) => {
        const sql = `DELETE FROM bookmark_posts_itineraries WHERE post_id = ? AND itinerary_id = ?`;
        console.log("Running SQL:", sql, "with", [post_id, itinerary_id]);
        db.run(sql, [post_id, itinerary_id], function (err) {
          if (err) reject(err);
          else {
            console.log(`Deleted rows: ${this.changes}`);
            resolve(this.changes);
          }
        });
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error removing bookmark:", err);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });
  return router;
};
