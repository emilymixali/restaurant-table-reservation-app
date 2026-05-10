const db = require('../models/db');

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// ------------------- CREATE -------------------
const createReservation = async (req, res) => {
  try {
    const { restaurant_id, date, time, comments, people_count } = req.body;
    const user_id = req.user.userId;

    if (!restaurant_id || !date || !time || !people_count) {
      return res.status(400).json({ error: "Όλα τα πεδία είναι υποχρεωτικά" });
    }

    if (parseInt(people_count) > 20) {
      return res.status(400).json({
        error: "Για περισσότερα από 20 άτομα, παρακαλώ καλέστε τηλεφωνικά το εστιατόριο."
      });
    }

    const restaurantId = parseInt(restaurant_id);
    const restaurants = await db.query(
      "SELECT opening_hours FROM restaurants WHERE restaurant_id = ?",
      [restaurantId]
    );

    if (!restaurants || !restaurants[0] || !restaurants[0].opening_hours) {
      return res.status(404).json({ error: "Το εστιατόριο δε βρέθηκε ή δεν έχει ωράριο." });
    }

    const opening_hours = restaurants[0].opening_hours;
    const [openTime, closeTime] = opening_hours.split(' - ');

    const openMinutes = timeToMinutes(openTime);
    let closingMinutes = timeToMinutes(closeTime);
    let reservationMinutes = timeToMinutes(time);

    if (closingMinutes <= openMinutes) {
      if (closeTime === '00:00') {
        closingMinutes = 24 * 60;
      } else {
        closingMinutes += 24 * 60;
      }
    }

    if (closingMinutes >= 1440 && reservationMinutes < openMinutes) {
      reservationMinutes += 24 * 60;
    }

    if (reservationMinutes > closingMinutes - 120) {
      return res.status(400).json({
        error: "Η τελευταία κράτηση πρέπει να είναι τουλάχιστον 2 ώρες πριν το κλείσιμο.",
      });
    }

    await db.query(
      `INSERT INTO reservations (user_id, restaurant_id, date, time, people_count, comments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, restaurantId, date, time, people_count, comments || '']
    );

    res.json({ message: "✅ Η κράτηση ολοκληρώθηκε με επιτυχία!" });

  } catch (error) {
    console.error("❌ Σφάλμα δημιουργίας κράτησης:", error);
    res.status(500).json({ error: "Σφάλμα κατά την αποθήκευση της κράτησης." });
  }
};

// ------------------- UPDATE -------------------
const updateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.userId;
    let { date, time, people_count, comments } = req.body;

    console.log('✏️ Update για κράτηση:', { reservationId, userId, date, time });

    if (!date || !time || !people_count) {
      return res.status(400).json({ error: "Όλα τα πεδία είναι υποχρεωτικά." });
    }

    if (parseInt(people_count) > 20) {
      return res.status(400).json({
        error: "Για περισσότερα από 20 άτομα, παρακαλώ καλέστε τηλεφωνικά το εστιατόριο.",
      });
    }

    
    if (date.includes('T')) {
      date = date.split('T')[0];
    }

   
    if (date.includes('/')) {
      date = date.split('/').reverse().join('-'); // → YYYY-MM-DD
    }

    // Έλεγχος παρελθόντος
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const reservationDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    console.log('🕓 Τρέχουσα ώρα:', now);
    console.log('📆 Ώρα κράτησης:', reservationDateTime);

    if (reservationDateTime < now) {
      return res.status(400).json({
        error: "Δεν μπορείς να επεξεργαστείς παρελθοντική κράτηση.",
      });
    }

    //  Έλεγχος αν υπάρχει η κράτηση
    const check = await db.query(
      'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [reservationId, userId]
    );

    if (!check || check.length === 0) {
      return res.status(404).json({ error: "Η κράτηση δε βρέθηκε ή δεν ανήκει στον χρήστη." });
    }

    // Ενημέρωση κράτησης
    await db.query(
      `UPDATE reservations
       SET date = ?, time = ?, people_count = ?, comments = ?
       WHERE reservation_id = ? AND user_id = ?`,
      [date, time, people_count, comments || '', reservationId, userId]
    );

    res.status(200).json({ message: "✅ Η κράτηση ενημερώθηκε με επιτυχία!" });

  } catch (error) {
    console.error("❌ Σφάλμα ενημέρωσης κράτησης:", error);
    res.status(500).json({ error: "Σφάλμα κατά την ενημέρωση της κράτησης." });
  }
};



// ------------------- GET/DELETE/AVAILABLE -------------------
const getUserReservations = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const reservations = await db.query(
      `SELECT r.*, res.name AS restaurant_name 
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.restaurant_id
       WHERE r.user_id = ?
       ORDER BY r.date DESC, r.time DESC`,
      [user_id]
    );

  
    const cleaned = reservations.map(r => ({
      ...r,
      date: typeof r.date === 'string' && r.date.includes('T')
        ? r.date.split('T')[0]
        : r.date
    }));
    

    res.json(cleaned);
  } catch (error) {
    console.error("❌ Σφάλμα ανάκτησης κρατήσεων:", error);
    res.status(500).json({ error: "Σφάλμα κατά την ανάκτηση κρατήσεων." });
  }
};
;

const deleteReservation = async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user?.userId;

  try {
    const result = await db.query(
      'DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?',
      [reservationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Η κράτηση δε βρέθηκε ή δεν ανήκει στον χρήστη.' });
    }

    res.status(200).json({ message: '✅ Η κράτηση διαγράφηκε με επιτυχία!' });
  } catch (error) {
    console.error('❌ Σφάλμα διαγραφής:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή της κράτησης.' });
  }
};

const getAvailableHours = async (req, res) => {
  try {
    const { restaurant_id, date } = req.query;

    if (!restaurant_id || !date) {
      return res.status(400).json({ error: "Απαιτούνται restaurant_id και date" });
    }

    const restaurantRows = await db.query(
      'SELECT opening_hours FROM restaurants WHERE restaurant_id = ?',
      [restaurant_id]
    );

    if (!restaurantRows || restaurantRows.length === 0 || !restaurantRows[0].opening_hours) {
      return res.status(404).json({ error: "Δεν βρέθηκε το εστιατόριο ή δεν έχει ωράριο" });
    }

    const [openStr, closeStr] = restaurantRows[0].opening_hours.split(' - ');
    let openHour = parseInt(openStr.split(':')[0]);
    let closeHour = parseInt(closeStr.split(':')[0]);

    if (isNaN(openHour) || isNaN(closeHour)) {
      return res.status(400).json({ error: "Μη έγκυρη μορφή ώρας στο ωράριο" });
    }

    if (closeHour <= openHour) {
      closeHour += 24;
    }

    const allSlots = [];
    for (let h = openHour; h < closeHour - 2; h++) {
      const hour = h % 24;
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const reservations = await db.query(
      'SELECT time FROM reservations WHERE restaurant_id = ? AND date = ?',
      [restaurant_id, date]
    );

    const reservedTimes = reservations.map(r => r.time?.slice(0, 5));
    const availableSlots = allSlots.filter(t => !reservedTimes.includes(t));

    res.json({ availableSlots });
  } catch (err) {
    console.error("❌ Σφάλμα διαθέσιμων ωρών:", err);
    res.status(500).json({ error: "Σφάλμα διακομιστή" });
  }
};

module.exports = {
  createReservation,
  updateReservation,
  deleteReservation,
  getAvailableHours,
  getUserReservations,
};
