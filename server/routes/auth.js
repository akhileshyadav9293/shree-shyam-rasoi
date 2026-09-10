const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/auth/status — check if an admin account has been configured
router.get('/status', (req, res) => {
  const pin = db.get('settings.app_pin').value();
  const username = db.get('settings.app_username').value() || 'Admin';
  res.json({
    isSetup: Boolean(pin && pin.length === 4),
    username: username,
  });
});

// POST /api/auth/setup — initial setup of username & 4-digit PIN
router.post('/setup', (req, res) => {
  const { username, pin } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!pin || pin.length !== 4) {
    return res.status(400).json({ error: '4-digit PIN is required' });
  }

  db.set('settings.app_username', username.trim()).write();
  db.set('settings.app_pin', String(pin)).write();

  res.json({
    success: true,
    message: 'Admin account configured successfully',
    username: username.trim(),
  });
});

// POST /api/auth/login — verify PIN
router.post('/login', (req, res) => {
  const { pin } = req.body;
  const savedPin = db.get('settings.app_pin').value();
  const username = db.get('settings.app_username').value() || 'Admin';

  if (!savedPin) {
    return res.status(400).json({ error: 'Admin account not set up yet', needsSetup: true });
  }

  if (String(pin) === String(savedPin)) {
    res.json({
      success: true,
      username: username,
      token: 'sst_' + Date.now(),
    });
  } else {
    res.status(401).json({ error: 'Incorrect PIN. Please try again.' });
  }
});

// POST /api/auth/reset — reset admin credentials
router.post('/reset', (req, res) => {
  db.set('settings.app_pin', '').write();
  db.set('settings.app_username', '').write();
  res.json({ success: true, message: 'Admin profile reset successfully' });
});

module.exports = router;
