const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// GET /api/expenses
router.get('/', (req, res) => {
  try {
    const expenses = db.prepare(`
      SELECT * FROM expenses ORDER BY date DESC, createdAt DESC
    `).all();
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
    db.prepare(`
      INSERT INTO expenses (id, amount, category, description, date, createdAt)
      VALUES (@id, @amount, @category, @description, @date, @createdAt)
    `).run(expense);
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
