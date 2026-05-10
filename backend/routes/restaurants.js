const express = require('express');
const router = express.Router();
const pool = require('../models/db');

router.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await pool.query('SELECT * FROM restaurants');
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
