const transporter = require("../config/email");
const logger = require("../config/logger");

/*
Emails are processed on an in-process queue so SMTP latency never blocks
request handling (signup, password reset, verification, newsletter sends).
Errors are logged; the request itself is never held hostage to the mail server.
*/
const queue = [];
let processing = false;

const processQueue = async () => {
    if (processing) return;
    processing = true;

    while (queue.length > 0) {
        const mail = queue.shift();
        try {
            await transporter.sendMail(mail);
        } catch (err) {
            logger.error({ err, to: mail.to, subject: mail.subject }, "Failed to send email");
        }
    }

    processing = false;
};

const escapeHtml = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const sendEmail = ({ to, subject, html }) => {
    queue.push({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    });
    processQueue();
    return Promise.resolve();
};

const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #4CAF50; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                This link expires in 15 minutes. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${resetUrl}">${resetUrl}</a>
            </p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Roam Beyond",
        html
    });
};

const sendVerificationEmail = async (user, verifyToken) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>Welcome to Roam Beyond! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}"
                   style="background-color: #2196F3; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Verify Email
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                This link expires in 24 hours. If you didn't create an account, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Roam Beyond",
        html
    });
};

const sendNewsletterEmail = async (subscriber, subject, body) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const apiUrl = process.env.API_URL || "http://localhost:5000";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
            <div style="background: linear-gradient(135deg, #2f7a42, #3a9e54); padding: 28px 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Roam Beyond</h1>
                <p style="color: #d4edda; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Curated Tours</p>
            </div>
            <div style="padding: 32px; color: #333; line-height: 1.7; font-size: 15px;">
                <h2 style="color: #2f3f33; font-size: 20px; margin: 0 0 16px;">${escapeHtml(subject)}</h2>
                <div style="white-space: pre-line;">${escapeHtml(body)}</div>
            </div>
            <div style="background: #f9f5e7; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #888; font-size: 12px;">You're receiving this because you subscribed to Roam Beyond updates.</p>
                <p style="margin: 8px 0 0; font-size: 12px;">
                    <a href="${apiUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #2f7a42; text-decoration: underline;">Unsubscribe</a>
                </p>
            </div>
        </div>
    `;

    await sendEmail({
        to: subscriber.email,
        subject: `${subject} — Roam Beyond`,
        html
    });
};

/*
|--------------------------------------------------------------------------
| New Lead Alerts
|--------------------------------------------------------------------------
| Fired when a customer submits an enquiry or a trip request. Emails every
| admin in real time so nobody has to watch the dashboard to catch a lead.
| Errors are swallowed and logged — a mail hiccup must never fail the lead.
|--------------------------------------------------------------------------
*/

const getLeadAlertRecipients = async () => {
    if (process.env.LEAD_ALERT_EMAIL) {
        return [process.env.LEAD_ALERT_EMAIL.trim()];
    }
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" }).select("email").lean();
    return admins.map((a) => a.email);
};

const leadEmailShell = (title, rowsHtml) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
        <div style="background: linear-gradient(135deg, #2f7a42, #3a9e54); padding: 24px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Roam Beyond</h1>
            <p style="color: #d4edda; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">New Lead Alert</p>
        </div>
        <div style="padding: 28px 32px; color: #333; line-height: 1.7; font-size: 14px;">
            <h2 style="color: #2f3f33; font-size: 18px; margin: 0 0 16px;">${escapeHtml(title)}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                ${rowsHtml}
            </table>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">This is an automated alert from the Roam Beyond platform.</p>
        </div>
    </div>
`;

const leadRow = (label, value) => `
    <tr>
        <td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap; vertical-align: top;">${escapeHtml(label)}</td>
        <td style="padding: 6px 0; color: #333; font-weight: 600;">${escapeHtml(String(value ?? "—"))}</td>
    </tr>
`;

const sendNewEnquiryAlert = async (enquiry) => {
    try {
        const admins = await getLeadAlertRecipients();
        if (admins.length === 0) return;

        const packageTitle = enquiry.tourPackage?.title || "Custom trip";
        const subject = `New Enquiry — ${enquiry.enquiryNumber} (${packageTitle})`;

        const rowsHtml = [
            leadRow("Enquiry no.", enquiry.enquiryNumber),
            leadRow("Customer", enquiry.customerName),
            leadRow("Email", enquiry.customerEmail),
            leadRow("Phone", enquiry.customerPhone),
            leadRow("Package", packageTitle),
            leadRow("Travel date", enquiry.travelDate ? new Date(enquiry.travelDate).toDateString() : ""),
            leadRow("Adults / Children", `${enquiry.adults} / ${enquiry.children || 0}`),
            leadRow("Notes", enquiry.notes || "—")
        ].join("");

        await sendEmail({
            to: admins,
            subject,
            html: leadEmailShell(subject, rowsHtml)
        });
    } catch (err) {
        logger.warn({ err }, "Failed to send new enquiry alert");
    }
};

const sendNewTripRequestAlert = async (tripRequest) => {
    try {
        const admins = await getLeadAlertRecipients();
        if (admins.length === 0) return;

        const subject = `New Trip Request — ${tripRequest.destination}`;
        const userName = tripRequest.userName || tripRequest.user?.name || "Customer";

        const rowsHtml = [
            leadRow("Customer", userName),
            leadRow("Email", tripRequest.user?.email || ""),
            leadRow("Destination", tripRequest.destination),
            leadRow("Dates", `${new Date(tripRequest.startDate).toDateString()} → ${new Date(tripRequest.endDate).toDateString()}`),
            leadRow("Budget", tripRequest.budget?.min ? `₹${tripRequest.budget.min} – ₹${tripRequest.budget.max}` : "—"),
            leadRow("Group size", `${tripRequest.groupSize} (${tripRequest.adults} adults / ${tripRequest.children || 0} children)`),
            leadRow("Preferences", (tripRequest.preferences || []).join(", ") || "—"),
            leadRow("Special requests", tripRequest.specialRequests || "—")
        ].join("");

        await sendEmail({
            to: admins,
            subject,
            html: leadEmailShell(subject, rowsHtml)
        });
    } catch (err) {
        logger.warn({ err }, "Failed to send new trip request alert");
    }
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendNewsletterEmail,
    sendNewEnquiryAlert,
    sendNewTripRequestAlert
};
