const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

  const dbAll = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

  const dbRun = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

  const authenticate = (req, res, next) => {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  router.post('/saveItinerary', authenticate, async (req, res) => {
    try {
      const { title, collaborative, date_start, date_end } = req.body;
      // Check authentication
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      // Normalize title and collaborative flag
      const safeTitle = title || "New Itinerary";
      const safeCollaborative = collaborative ? 1 : 0;
      // Date normalization logic
      let start = date_start || null;
      let end = date_end || null;
      if (start && end) {
        // Convert both to Date objects and sort
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (startDate > endDate) {
          // Swap if out of order
          [start, end] = [end, start];
        }
      } else if (start || end) {
        // If only one date exists, use it for both
        const single = start || end;
        start = single;
        end = single;
      } else {
        // No dates at all — leave empty
        start = "";
        end = "";
      }
      // Insert into database
      const result = await dbRun(
        `
        INSERT INTO itineraries (owner_id, title, collaborative, date_start, date_end)
        VALUES (?, ?, ?, ?, ?)
        `,
        [req.user.id, safeTitle, safeCollaborative, start, end]
      );
      const itinerary_id = result;
      res.json({ message: "Itinerary created successfully", itinerary_id });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  router.post('/saveItineraryCard', authenticate, async (req, res) => {
    const {
      itinerary_id,
      location_name,
      location_address,
      notes,
      order_index,
      card_time,
      card_date, // <-- added
    } = req.body;

    if (!itinerary_id) {
      return res.status(400).json({ error: 'itinerary_id is required' });
    }

    try {
      const card_id = await dbRun(
        `INSERT INTO itinerary_cards 
          (itinerary_id, location_name, location_address, notes, order_index, created_at, card_time, card_date) 
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
        [
          itinerary_id,
          location_name || "",
          location_address || "",
          notes || "",
          order_index || 0,
          card_time || "",
          card_date || null, 
        ]
      );

      res.json({ message: 'Card saved successfully', card_id });
    } catch (err) {
      console.error("Save card error:", err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.get('/myItineraries', authenticate, async (req, res) => {
    try {
      const rows = await dbAll(
        `SELECT * FROM itineraries WHERE owner_id = ? ORDER BY itinerary_id DESC`,
        [req.user.id]
      );
      res.json({ itineraries: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.get('/itineraryCards/:itinerary_id', authenticate, async (req, res) => {
    try {
      const rows = await dbAll(
        `SELECT * FROM itinerary_cards WHERE itinerary_id = ? ORDER BY order_index ASC`,
        [req.params.itinerary_id]
      );
      res.json({ cards: rows });
    } catch (err) {
      console.error("Get cards error:", err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.delete('/deleteItineraryCard/:card_id', authenticate, async (req, res) => {
    const { card_id } = req.params;
    if (!card_id) return res.status(400).json({ error: 'card_id is required' });
    try {
      const sql = `DELETE FROM itinerary_cards WHERE card_id = ?`;
      await dbRun(sql, [card_id]);
      res.json({ message: 'Card deleted successfully', card_id });
    } catch (err) {
      console.error("Delete card error:", err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  router.post('/updateItineraryTitle', authenticate, async (req, res) => {
    const { itinerary_id, title } = req.body;
    if (!itinerary_id || !title) {
      return res.status(400).json({ error: 'Missing itinerary_id or title' });
    }
    try {
      await dbRun(
        `UPDATE itineraries SET title = ? WHERE itinerary_id = ? AND owner_id = ?`,
        [title, itinerary_id, req.user.id]
      );
      res.json({ success: true, message: 'Title updated successfully' });
    } catch (err) {
      console.error("Update title error:", err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.delete('/deleteItinerary/:itinerary_id', authenticate, async (req, res) => {
    const { itinerary_id } = req.params;
    if (!itinerary_id) {
      return res.status(400).json({ error: 'Missing itinerary_id' });
    }
    try {
      await dbRun(`DELETE FROM itinerary_cards WHERE itinerary_id = ?`, [itinerary_id]);
      await dbRun(
        `DELETE FROM itineraries WHERE itinerary_id = ? AND owner_id = ?`,
        [itinerary_id, req.user.id]
      );
      res.json({ success: true, message: 'Itinerary deleted successfully' });
    } catch (err) {
      console.error("Delete itinerary error:", err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.post('/updateDestination', authenticate, async (req, res) => {
    const { itinerary_id, destination } = req.body;
    if (!itinerary_id || !destination) return res.status(400).json({ error: 'Missing itinerary_id or destination' });
    try {
      await dbRun(
        `UPDATE itineraries SET destination = ? WHERE itinerary_id = ? AND owner_id = ?`,
        [destination, itinerary_id, req.user.id]
      );
      res.json({ success: true, message: 'Destination updated successfully' });
    } catch (err) {
      console.error("Update destination error:", err);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  router.get('/:id', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const itinerary = await dbAll(
        'SELECT * FROM itineraries WHERE itinerary_id = ? AND owner_id = ?',
        [id, req.user.id]
      );

      if (!itinerary || itinerary.length === 0) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }

      res.json({ itinerary: itinerary[0] });
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/updateItineraryCard', authenticate, async (req, res) => {
    const {
      card_id,
      location_name,
      location_address,
      notes,
      card_time,
      card_date
    } = req.body;

    if (!card_id) {
      return res.status(400).json({ error: 'card_id is required' });
    }

    try {
      await dbRun(
        `UPDATE itinerary_cards 
         SET location_name = ?, location_address = ?, notes = ?, card_time = ?, card_date = ?
         WHERE card_id = ?`,
        [location_name, location_address, notes, card_time, card_date, card_id]
      );

      res.json({ success: true, message: 'Card updated successfully' });
    } catch (err) {
      console.error("Update card error:", err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};