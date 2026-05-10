const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');

// ------------------ ΣΥΝΔΕΣΗ ------------------
router.post('/login', async (req, res) => {
  try {
    console.log("🔐 Αίτημα σύνδεσης:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Συμπλήρωσε email και κωδικό." });
    }

    console.log("🧪 Εκτέλεση query για email:", email);
    const users = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log("📦 Αποτέλεσμα query:", users);

    if (!users || users.length === 0) {
      console.log("⚠️ Χρήστης ΔΕΝ βρέθηκε!");
      return res.status(401).json({ error: "Μη έγκυρα στοιχεία σύνδεσης." });
    }

    const user = users[0];
    console.log("✅ Χρήστης βρέθηκε:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Έλεγχος κωδικού:", isMatch);

    if (!isMatch) {
      console.log("❌ Ο κωδικός ΔΕΝ ταιριάζει");
      return res.status(401).json({ error: "Μη έγκυρα στοιχεία σύνδεσης." });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error("❌ Σφάλμα σύνδεσης:", error);
    res.status(500).json({ error: "Κάτι πήγε στραβά κατά τη σύνδεση." });
  }
});

// ------------------ ΕΓΓΡΑΦΗ ------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, birth_date, password } = req.body;

    if (!name || !email || !phone || !birth_date || !password) {
      return res.status(400).json({ error: "Συμπλήρωσε όλα τα πεδία." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Ο κωδικός πρέπει να περιέχει τουλάχιστον 1 κεφαλαίο γράμμα και 1 αριθμό." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, phone, birth_date, password)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, birth_date, hashedPassword]
    );

    res.json({ message: "✅ Εγγραφή ολοκληρώθηκε με επιτυχία!" });
  } catch (error) {
    console.error("❌ Σφάλμα εγγραφής:", error);
    res.status(500).json({ error: "Παρουσιάστηκε σφάλμα κατά την εγγραφή." });
  }
});

// ------------------ ΠΡΟΦΙΛ ΧΡΗΣΤΗ ------------------
router.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await db.query(
      'SELECT user_id, name, email, phone FROM users WHERE user_id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Χρήστης δεν βρέθηκε' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('❌ Σφάλμα στο /users/me:', error);
    res.status(500).json({ error: 'Σφάλμα διακομιστή' });
  }
});


module.exports = router;
