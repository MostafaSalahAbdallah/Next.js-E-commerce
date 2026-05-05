import nodemailer from "nodemailer";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();

  if (!transporter || !to) {
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false };
}

export async function sendVerificationEmail(user, token) {
  const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Verify your email by opening this link: ${verificationUrl}`,
    html: `<p>Verify your email by opening this link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}

export async function sendOrderPlacedEmail(userEmail, order) {
  return sendEmail({
    to: userEmail,
    subject: `Order ${order.id} placed`,
    text: `Your order ${order.id} was placed with status ${order.status}. Total: $${Number(order.total).toFixed(2)}.`,
    html: `<p>Your order <strong>${order.id}</strong> was placed.</p><p>Status: ${order.status}</p><p>Total: $${Number(order.total).toFixed(2)}</p>`,
  });
}

export async function sendOrderStatusEmail(userEmail, order) {
  return sendEmail({
    to: userEmail,
    subject: `Order ${order.id} status updated`,
    text: `Your order ${order.id} is now ${order.status}.`,
    html: `<p>Your order <strong>${order.id}</strong> is now <strong>${order.status}</strong>.</p>`,
  });
}
