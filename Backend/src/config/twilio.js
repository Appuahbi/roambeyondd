/*
Twilio SMS client.

The client is created lazily and only when credentials are present AND the
app is not running in a local mock context, so development/tests work without
real Twilio credentials (see services/smsService.js mock mode).
*/

let client = null;
let attempted = false;

const getTwilioClient = () => {
    if (attempted) return client;

    attempted = true;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        return null;
    }

    const twilio = require("twilio");
    client = twilio(accountSid, authToken);
    return client;
};

/*
Indian mobile numbers are stored as 10 digits (e.g. 9876543210).
Convert to E.164 for Twilio: +919876543210.
*/
const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) {
        return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
        return `+${digits}`;
    }
    return `+${digits}`;
};

module.exports = {
    getTwilioClient,
    normalizePhone
};
