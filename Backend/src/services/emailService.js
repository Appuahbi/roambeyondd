const transporter = require("../config/email");
const logger = require("../config/logger");

const escapeHtml = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html
        });
    } catch (err) {
        logger.error({ err, to }, "Failed to send email");
        throw err;
    }
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
        subject: "Reset Your Password - Delhi Tours",
        html
    });
};

const sendVerificationEmail = async (user, verifyToken) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>Welcome to Delhi Tours! Please verify your email address by clicking the button below:</p>
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
        subject: "Verify Your Email - Delhi Tours",
        html
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendVerificationEmail
};
