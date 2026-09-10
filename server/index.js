require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'dist');
const hasDist  = fs.existsSync(distPath);
const isProd   = process.env.NODE_ENV === 'production' || hasDist;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/expenses',   require('./routes/expenses'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/auth',       require('./routes/auth'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'production', timestamp: new Date().toISOString() });
});

// ─── Serve React build (production) ──────────────────────────────────────────
if (hasDist) {
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Shree Shyam Rasoi running on http://localhost:${PORT}`);
  if (isProd) console.log(`   Open this URL in your browser to use the app.`);
  else console.log(`   Dev mode — frontend served by Vite on port 5173`);
});
