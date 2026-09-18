const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// GET /api/payments
router.get('/', (req, res) => {
  try {
    const payments = db.prepare('SELECT * FROM payments ORDER BY date DESC').all();
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/payments/customer/:customerId
router.get('/customer/:customerId', (req, res) => {
  try {
    const payments = db.prepare(
      'SELECT * FROM payments WHERE customerId = ? ORDER BY date DESC'
    ).all(req.params.customerId);
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/payments
router.post('/', (req, res) => {
  try {
    const payment = {
      id: newId(),
      customerId: req.body.customerId || '',
      amount: Number(req.body.amount) || 0,
      date: req.body.date || new Date().toISOString(),
      description: req.body.description || '',
      createdAt: new Date().toISOString(),
    };
    db.prepare(`
      INSERT INTO payments (id, customerId, amount, date, description, createdAt)
      VALUES (@id, @customerId, @amount, @date, @description, @createdAt)
    `).run(payment);
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
