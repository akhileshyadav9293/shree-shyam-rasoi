const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// GET /api/expenses
router.get('/', (req, res) => {
  try {
    const expenses = db.get('expenses').value().sort((a, b) =>
      new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/expenses
router.post('/', (req, res) => {
  try {
    const expense = {
      id: newId(),
      amount: Number(req.body.amount) || 0,
      category: req.body.category || 'other',
      description: req.body.description || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    db.get('expenses').push(expense).write();
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  try {
    const before = db.get('expenses').value().length;
    db.get('expenses').remove({ id: req.params.id }).write();
    if (db.get('expenses').value().length === before) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
