import { sendEmail } from "@/lib/email";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function sendVerificationCodeEmail(user, code) {
  return sendEmail({
    to: user.email,
    subject: "Your AXO verification code",
    text: `Hello! Your AXO verification code is ${code}. Enter it on the verification page to activate your account.`,
    html: `<p>Hello <strong>${user.email}</strong>,</p>
           <p>Your 4-digit verification code is:</p>
           <p style="font-size: 1.5rem; letter-spacing: 0.22em; font-weight: 700; color: #744577;">${code}</p>
           <p>Enter this code on the verification screen to activate your account.</p>
           <p>If you did not request this, please ignore this email.</p>`,
  });
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to AXO E-Commerce Store!",
    text: `Welcome ${user.email}! Your account has been created successfully. You can now login and start shopping.`,
    html: `<p>Welcome <strong>${user.email}</strong>!</p>
           <p>Your account has been created successfully. You can now login and start shopping.</p>
           <p>Thank you for joining AXO!</p>`,
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
