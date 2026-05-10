const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reservationController = require('../controllers/reservationController');

router.post('/reservations', authMiddleware, reservationController.createReservation);
router.get('/user/reservations', authMiddleware, reservationController.getUserReservations);
router.put('/reservations/:id', authMiddleware, reservationController.updateReservation);
router.delete('/reservations/:id', authMiddleware, reservationController.deleteReservation);

// 🆕 GET διαθέσιμες ώρες
router.get('/reservations/available', reservationController.getAvailableHours);

module.exports = router;
