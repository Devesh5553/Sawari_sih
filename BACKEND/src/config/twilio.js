const twilio = require('twilio');

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials missing: set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }
  return twilio(accountSid, authToken);
}

function getTwilioFromConfig() {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (messagingServiceSid) return { messagingServiceSid };
  if (from) return { from };
  throw new Error('Provide TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER');
}

module.exports = { getTwilioClient, getTwilioFromConfig };
