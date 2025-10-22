const express = require('express');
const router = express.Router();
const { dbRun, dbAll } = require('../db'); // your sqlite helpers
const authenticate = require('../middleware/authenticate'); // your auth middleware

// Add a bookmark
router.post('/add', authenticate, async (req, res) => {
  const { post_id, itinerary_id } = req.body;
  const user_id = req.user?.id;

  if (!post_id || !itinerary_id || !user_id) {
    return res.status(400).json({ error: 'Missing post_id, itinerary_id, or user_id' });
  }

  try {
    console.log('Adding bookmark:', { post_id, itinerary_id, user_id });

    await dbRun(
      `INSERT OR IGNORE INTO bookmark_posts_itineraries (post_id, itinerary_id, user_id)
       VALUES (?, ?, ?)`,
      [post_id, itinerary_id, user_id]
    );

    // Return updated list of bookmarked itineraries for this post
    const bookmarks = await dbAll(
      `SELECT itinerary_id FROM bookmark_posts_itineraries
       WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );

    res.json({ success: true, bookmarks: bookmarks.map(b => b.itinerary_id) });
  } catch (err) {
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove a bookmark
router.post('/remove', authenticate, async (req, res) => {
  const { post_id, itinerary_id } = req.body;
  const user_id = req.user?.id;

  if (!post_id || !itinerary_id || !user_id) {
    return res.status(400).json({ error: 'Missing post_id, itinerary_id, or user_id' });
  }

  try {
    console.log('Removing bookmark:', { post_id, itinerary_id, user_id });

    await dbRun(
      `DELETE FROM bookmark_posts_itineraries
       WHERE post_id = ? AND itinerary_id = ? AND user_id = ?`,
      [post_id, itinerary_id, user_id]
    );

    // Return updated list of bookmarked itineraries for this post
    const bookmarks = await dbAll(
      `SELECT itinerary_id FROM bookmark_posts_itineraries
       WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );

    res.json({ success: true, bookmarks: bookmarks.map(b => b.itinerary_id) });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Fetch bookmarks for a post
router.get('/post/:post_id', authenticate, async (req, res) => {
  const { post_id } = req.params;
  const user_id = req.user?.id;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'Missing post_id or user_id' });
  }

  try {
    const bookmarks = await dbAll(
      `SELECT itinerary_id FROM bookmark_posts_itineraries
       WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );

    res.json({ bookmarks: bookmarks.map(b => b.itinerary_id) });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

module.exports = router;
