import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, html, saleNumber } = req.body;
  if (!email || !html) {
    return res.status(400).json({ error: 'Missing email or html' });
  }
  try {
    // Configure your SMTP transport (replace with your SMTP credentials)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@stendo.bg',
      to: email,
      subject: `Стокова разписка №${saleNumber || ''}`,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send stock receipt error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
} 