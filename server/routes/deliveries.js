const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// ─── GET /api/deliveries/month/:prefix ───────────────────────────────────────
router.get('/month/:prefix', (req, res) => {
  try {
    const rows = db.get('deliveries').filter(r => r.date.startsWith(req.params.prefix)).value();
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
    const rows = db.get('deliveries').filter({ date: req.params.date }).value();
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

    for (const [customerId, val] of Object.entries(deliveriesMap)) {
      const existing = db.get('deliveries').find({ date, customerId }).value();
      if (existing) {
        db.get('deliveries').find({ date, customerId }).assign({ lunch: !!val.lunch, dinner: !!val.dinner }).write();
      } else {
        db.get('deliveries').push({ date, customerId, lunch: !!val.lunch, dinner: !!val.dinner }).write();
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
