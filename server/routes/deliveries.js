const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// ─── GET /api/deliveries/month/:prefix ───────────────────────────────────────
router.get('/month/:prefix', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM deliveries WHERE date LIKE ?`).all(req.params.prefix + '%');
    // Convert flat array → { date: { customerId: { lunch, dinner } } }
    const result = {};
    for (const row of rows) {
      if (!result[row.date]) result[row.date] = {};
      result[row.date][row.customerId] = { lunch: !!row.lunch, dinner: !!row.dinner };
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/deliveries/:date ────────────────────────────────────────────────
router.get('/:date', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM deliveries WHERE date = ?').all(req.params.date);
    const map = {};
    for (const row of rows) {
      map[row.customerId] = { lunch: !!row.lunch, dinner: !!row.dinner };
    }
    res.json(map);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PUT /api/deliveries/:date ────────────────────────────────────────────────
router.put('/:date', (req, res) => {
  try {
    const { date } = req.params;
    const deliveriesMap = req.body; // { customerId: { lunch, dinner } }

    const upsert = db.prepare(`
      INSERT INTO deliveries (date, customerId, lunch, dinner)
      VALUES (@date, @customerId, @lunch, @dinner)
      ON CONFLICT(date, customerId) DO UPDATE SET
        lunch = excluded.lunch,
        dinner = excluded.dinner
    `);

    const insertMany = db.transaction((entries) => {
      for (const [customerId, val] of entries) {
        upsert.run({
          date,
          customerId,
          lunch: val.lunch ? 1 : 0,
          dinner: val.dinner ? 1 : 0,
        });
      }
    });

    insertMany(Object.entries(deliveriesMap));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
