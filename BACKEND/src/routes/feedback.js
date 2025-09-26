const express = require('express');
const router = express.Router();

// In-memory feedback store (replace with DB for production)
const feedbacks = [];
let nextId = 1;

function validateFeedback(body) {
  const errors = [];
  const { busNumber, startStop, destinationStop, journeyDate, journeyTime, rating, categories, comment, otpVerified, photoMeta } = body || {};
  if (!busNumber) errors.push('busNumber is required');
  if (!startStop) errors.push('startStop is required');
  if (!destinationStop) errors.push('destinationStop is required');
  if (!journeyDate) errors.push('journeyDate is required');
  if (!journeyTime) errors.push('journeyTime is required');
  if (typeof rating !== 'number' || rating < 1 || rating > 5) errors.push('rating must be 1..5');
  if (!Array.isArray(categories)) errors.push('categories must be an array');
  if (!otpVerified) errors.push('otpVerified must be true');
  if (!photoMeta || !photoMeta.name) errors.push('photoMeta with name is required');
  return errors;
}

router.post('/feedback', express.json(), (req, res) => {
  const errors = validateFeedback(req.body);
  if (errors.length) return res.status(400).json({ success: false, error: errors.join(', ') });

  const item = { id: nextId++, createdAt: new Date().toISOString(), ...req.body };
  feedbacks.unshift(item);
  return res.json({ success: true, id: item.id });
});

router.get('/feedbacks', (_req, res) => {
  return res.json({ success: true, data: feedbacks });
});

module.exports = router;
