const nodemailer = require('nodemailer');
const path = require('path');

async function sendEmail({ to, subject, text, html, attachments }) {
  try {
    // Validate required environment variables
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD) {
      throw new Error('Email configuration missing. Please check ADMIN_EMAIL and ADMIN_EMAIL_PASSWORD environment variables.');
    }

    // Prefer STARTTLS (587). If it times out, fall back to SMTPS (465)
    const baseOptions = {
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: { rejectUnauthorized: false },
    };

    let transporter;
    try {
      transporter = nodemailer.createTransport({
        ...baseOptions,
        port: 587,
        secure: false, // STARTTLS
      });
      await transporter.verify();
    } catch (e587) {
      console.warn('587 failed, retrying 465:', e587?.message || e587);
      transporter = nodemailer.createTransport({
        ...baseOptions,
        port: 465,
        secure: true, // SMTPS
      });
      await transporter.verify();
    }

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to,
      subject,
      text,
      html,
      attachments,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully. Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

module.exports = sendEmail;
