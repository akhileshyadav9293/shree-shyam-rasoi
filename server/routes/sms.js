const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

function getApiKey() {
  return process.env.FAST2SMS_API_KEY || db.get('settings.fast2sms_api_key').value() || '';
}

// GET /api/sms/config — check if Fast2SMS key is present & fetch wallet balance
router.get('/config', async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.json({
      hasKey: false,
      maskedKey: '',
      walletBalance: null,
    });
  }

  const maskedKey = apiKey.length > 8
    ? apiKey.slice(0, 4) + '...' + apiKey.slice(-4)
    : '***';

  let walletBalance = null;
  try {
    const response = await fetch('https://www.fast2sms.com/dev/wallet', {
      headers: { authorization: apiKey },
    });
    if (response.ok) {
      const data = await response.json();
      walletBalance = data.wallet !== undefined ? data.wallet : null;
    }
  } catch (err) {
    console.error('Fast2SMS balance check error:', err.message);
  }

  res.json({
    hasKey: true,
    maskedKey,
    walletBalance,
  });
});

// POST /api/sms/config — save Fast2SMS API key
router.post('/config', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: 'API key is required' });
  }

  db.set('settings.fast2sms_api_key', apiKey.trim()).write();
  res.json({ success: true, message: 'Fast2SMS API key saved successfully' });
});

// POST /api/sms/send — send direct SMS to Indian mobile number
router.post('/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Customer phone number is required' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(400).json({
      error: 'Fast2SMS API Key is not configured. Please add your key in SMS Settings.',
      needsConfig: true,
    });
  }

  // Format 10-digit Indian phone number
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: `Invalid phone number: ${phone}. Must be a 10-digit mobile number.` });
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message.trim(),
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (data.return === true || (response.ok && data.status_code === 200)) {
      return res.json({
        success: true,
        message: `SMS sent successfully to +91 ${cleanPhone}!`,
        requestId: data.request_id,
      });
    } else {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Failed to send SMS');
      return res.status(400).json({ error: `Fast2SMS Error: ${errMsg}` });
    }
  } catch (err) {
    console.error('Fast2SMS send error:', err);
    return res.status(500).json({ error: `Server error sending SMS: ${err.message}` });
  }
});

module.exports = router;
