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
    const { title } = req.body;
    try {
      const itinerary_id = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO itineraries (owner_id, title) VALUES (?, ?)`,
          [req.user.id, title || ""],
          function(err) { if(err) reject(err); else resolve(this.lastID); }
        );
      });
      res.json({ message: 'Itinerary created successfully', itinerary_id });
    } catch (err) {
      console.error(err);
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

  return router;
};
