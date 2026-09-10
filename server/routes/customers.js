const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// ─── GET /api/customers/stats ─────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const all    = db.get('customers').value();
    const active = all.filter(c => c.status === 'active');
    const paused = all.filter(c => c.status === 'paused');
    const totalRevenue = active.reduce((s, c) => s + (Number(c.monthlyPrice) || 0), 0);
    const totalAdvance = active.reduce((s, c) => s + (Number(c.advance) || 0), 0);
    const totalPending = active.reduce((s, c) =>
      s + Math.max(0, (Number(c.monthlyPrice) || 0) - (Number(c.advance) || 0)), 0);
    res.json({ total: all.length, active: active.length, paused: paused.length, totalRevenue, totalAdvance, totalPending });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/customers ───────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const {
      search = '', status = 'all', plan = 'all', serviceType = 'all',
      sortBy = 'createdAt', sortDir = 'desc',
      page = '1', pageSize = '20',
    } = req.query;

    let data = db.get('customers').value();

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address?.toLowerCase().includes(q)
      );
    }
    if (status !== 'all')      data = data.filter(c => c.status === status);
    if (plan !== 'all')        data = data.filter(c => c.plan === plan);
    if (serviceType !== 'all') data = data.filter(c => (c.serviceType || 'monthly') === serviceType);

    // Sort
    const allowedSorts = ['name', 'phone', 'plan', 'monthlyPrice', 'advance', 'status', 'createdAt', 'updatedAt'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    data = [...data].sort((a, b) => {
      let av = a[safeSortBy] ?? ''; let bv = b[safeSortBy] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total      = data.length;
    const ps         = Math.min(100, Math.max(1, parseInt(pageSize)));
    const totalPages = Math.max(1, Math.ceil(total / ps));
    const safePage   = Math.min(Math.max(1, parseInt(page)), totalPages);
    const start      = (safePage - 1) * ps;

    res.json({ data: data.slice(start, start + ps), total, totalPages, page: safePage, pageSize: ps });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /api/customers/:id ───────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const c = db.get('customers').find({ id: req.params.id }).value();
    if (!c) return res.status(404).json({ error: 'Customer not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/customers ──────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const now = new Date().toISOString();
    const customer = {
      id: newId(),
      name: req.body.name || '',
      phone: req.body.phone || '',
      address: req.body.address || '',
      plan: req.body.plan || 'both',
      serviceType: req.body.serviceType || 'monthly',
      tiffinRate: Number(req.body.tiffinRate) || 0,
      monthlyAmount: Number(req.body.monthlyAmount) || 0,
      monthlyPrice: Number(req.body.monthlyPrice) || 0,
      discount: Number(req.body.discount) || 0,
      advance: Number(req.body.advance) || 0,
      skippedDays: Number(req.body.skippedDays) || 0,
      adjustmentAmount: Number(req.body.adjustmentAmount) || 0,
      status: req.body.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    db.get('customers').push(customer).write();
    res.status(201).json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PUT /api/customers/:id ───────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const existing = db.get('customers').find({ id: req.params.id }).value();
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    const updated = { ...existing, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    db.get('customers').find({ id: req.params.id }).assign(updated).write();
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PATCH /api/customers/:id/toggle-status ───────────────────────────────────
router.patch('/:id/toggle-status', (req, res) => {
  try {
    const c = db.get('customers').find({ id: req.params.id }).value();
    if (!c) return res.status(404).json({ error: 'Customer not found' });
    const newStatus = c.status === 'paused' ? 'active' : 'paused';
    db.get('customers').find({ id: req.params.id }).assign({ status: newStatus, updatedAt: new Date().toISOString() }).write();
    res.json({ ...c, status: newStatus });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DELETE /api/customers/:id ────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const before = db.get('customers').value().length;
    db.get('customers').remove({ id: req.params.id }).write();
    const after = db.get('customers').value().length;
    if (before === after) return res.status(404).json({ error: 'Customer not found' });
    // Also clean up related data
    db.get('deliveries').remove({ customerId: req.params.id }).write();
    db.get('payments').remove({ customerId: req.params.id }).write();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
