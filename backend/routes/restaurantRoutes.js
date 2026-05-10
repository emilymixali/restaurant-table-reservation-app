const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Φέρνει όλα τα εστιατόρια
router.get('/restaurants', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM restaurants');
    res.json(rows);
  } catch (error) {
    console.error('❌ Σφάλμα ανάκτησης εστιατορίων:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση των εστιατορίων.' });
  }
});

module.exports = router;
