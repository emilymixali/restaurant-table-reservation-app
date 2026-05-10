const pool = require('../models/db');

exports.getRestaurants = async (req, res) => {
    try {
        const rows = await pool.query('SELECT * FROM restaurants');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
