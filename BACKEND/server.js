const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const smsRouter = require('./src/routes/sms');
const feedbackRouter = require('./src/routes/feedback');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'sawari-backend' });
});

// Debug (non-sensitive): check required env presence
app.get('/env-check', (_req, res) => {
  res.json({
    TWILIO_ACCOUNT_SID: Boolean(process.env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN: Boolean(process.env.TWILIO_AUTH_TOKEN),
    TWILIO_MESSAGING_SERVICE_SID: Boolean(process.env.TWILIO_MESSAGING_SERVICE_SID),
    TWILIO_FROM_NUMBER: Boolean(process.env.TWILIO_FROM_NUMBER),
  });
});

// Routes
app.use('/', smsRouter);
app.use('/', feedbackRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SAWARI backend listening on http://localhost:${PORT}`);
});

module.exports = app;
