// api/itineraries.js
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

  // Save itinerary
  router.post('/saveItinerary', authenticate, async (req, res) => {
    const { title } = req.body;
    try {
      const itinerary_id = await dbRun(
        `INSERT INTO itineraries (owner_id, title) VALUES (?, ?)`,
        [req.user.id, title || ""]
      );
      res.json({ message: 'Itinerary created successfully', itinerary_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Save itinerary card (✅ only one version)
  router.post('/saveItineraryCard', authenticate, async (req, res) => {
    const { itinerary_id, location_name, location_address, notes, order_index, card_time } = req.body;

    if (!itinerary_id) {
      return res.status(400).json({ error: 'itinerary_id is required' });
    }

    try {
      const card_id = await dbRun(
        `INSERT INTO itinerary_cards 
          (itinerary_id, location_name, location_address, notes, order_index, created_at, card_time) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
        [
          itinerary_id,
          location_name || "",
          location_address || "",
          notes || "",
          order_index || 0,
          card_time || ""
        ]
      );

      res.json({ message: 'Card saved successfully', card_id });
    } catch (err) {
      console.error("Save card error:", err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get itineraries
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

  // Get cards (✅ only one version)
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

  return router;
};
