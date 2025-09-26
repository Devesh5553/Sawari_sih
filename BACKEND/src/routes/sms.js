const express = require('express');
const router = express.Router();
const { getTwilioClient, getTwilioFromConfig } = require('../config/twilio');

function validatePayload(body) {
  const errors = [];
  const { phone, route, currentStop, destinationStop, eta } = body || {};
  if (!phone || typeof phone !== 'string' || !phone.trim()) errors.push('phone is required');
  if (!route || typeof route !== 'string' || !route.trim()) errors.push('route is required');
  if (!currentStop || typeof currentStop !== 'string' || !currentStop.trim()) errors.push('currentStop is required');
  if (!destinationStop || typeof destinationStop !== 'string' || !destinationStop.trim()) errors.push('destinationStop is required');
  if (eta !== undefined && eta !== null && typeof eta !== 'string') errors.push('eta must be a string when provided');
  return errors;
}

// Simple health endpoint for this router
router.get('/sms-health', (_req, res) => {
  res.json({ ok: true });
});

// POST /send-sms
router.post('/send-sms', async (req, res) => {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ success: false, error: errors.join(', ') });

    const { phone, route, currentStop, destinationStop, eta } = req.body;
    const messageBody = eta && eta.trim()
      ? `Bus ${route} from ${currentStop} to ${destinationStop} will arrive in ${eta}.`
      : `Bus ${route} from ${currentStop} to ${destinationStop} is on its way.`;

    const client = getTwilioClient();
    const fromConfig = getTwilioFromConfig();
    const statusCallback = process.env.STATUS_CALLBACK_URL;

    await client.messages.create({
      to: phone.trim(),
      body: messageBody,
      ...fromConfig,
      ...(statusCallback ? { statusCallback } : {}),
    });

    return res.json({ success: true, message: 'SMS sent' });
  } catch (err) {
    const reason = err?.message || 'Unknown error';
    const status = err?.status || 500;
    return res.status(status).json({ success: false, error: reason });
  }
});

// ----------------- OTP endpoints -----------------
// In-memory OTP store (phone -> { code, expiresAt })
// For production, use Redis and add rate limiting.
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function normalizePhone(p) {
  return (p || '').toString().trim();
}

// POST /send-otp { phone }
router.post('/send-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) return res.status(400).json({ success: false, error: 'phone is required' });

    const code = generateOtp();
    const ttlMs = 5 * 60 * 1000; // 5 minutes
    const expiresAt = Date.now() + ttlMs;

    const client = getTwilioClient();
    const fromConfig = getTwilioFromConfig();
    const statusCallback = process.env.STATUS_CALLBACK_URL;

    const body = `Your SAWARI verification code is ${code}. It expires in 5 minutes.`;
    await client.messages.create({
      to: phone,
      body,
      ...fromConfig,
      ...(statusCallback ? { statusCallback } : {}),
    });

    otpStore.set(phone, { code, expiresAt });
    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    const reason = err?.message || 'Unknown error';
    const status = err?.status || 500;
    return res.status(status).json({ success: false, error: reason });
  }
});

// POST /verify-otp { phone, code }
router.post('/verify-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = (req.body?.code || '').toString().trim();
    if (!phone || !code) return res.status(400).json({ success: false, error: 'phone and code are required' });

    const entry = otpStore.get(phone);
    if (!entry) return res.status(400).json({ success: false, error: 'No OTP requested for this phone' });
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }
    if (entry.code !== code) return res.status(400).json({ success: false, error: 'Invalid OTP' });

    otpStore.delete(phone);
    return res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    const reason = err?.message || 'Unknown error';
    const status = err?.status || 500;
    return res.status(status).json({ success: false, error: reason });
  }
});

module.exports = router;
