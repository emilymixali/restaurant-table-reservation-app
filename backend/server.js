const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Σωστά routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/restaurantRoutes'));
app.use('/api', require('./routes/reservations'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
