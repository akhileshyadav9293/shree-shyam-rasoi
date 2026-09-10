const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// GET /api/payments
router.get('/', (req, res) => {
  try {
    const payments = db.get('payments').value().sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/payments/customer/:customerId
router.get('/customer/:customerId', (req, res) => {
  try {
    const payments = db.get('payments')
      .filter({ customerId: req.params.customerId })
      .value()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
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
    db.get('payments').push(payment).write();
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
