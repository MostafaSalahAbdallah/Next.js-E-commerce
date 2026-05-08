import { MailtrapClient } from "mailtrap";

function getMailtrapClient() {
  const token = process.env.MAILTRAP_API_TOKEN;

  if (!token) {
    return null;
  }

  return new MailtrapClient({ token });
}

export function getEmailFromAddress() {
  return process.env.EMAIL_FROM || "noreply@mailtrap.co";
}

export async function sendEmail({ to, subject, text, html }) {
  const client = getMailtrapClient();
  const from = getEmailFromAddress();

  if (!client || !from || !to) {
    console.warn("Email skipped: missing client, from address, or recipient");
    return { skipped: true };
  }

  try {
    await client.send({
      from: {
        email: from,
        name: process.env.EMAIL_FROM_NAME || "E-Commerce Store",
      },
      to: [{ email: to }],
      subject,
      text,
      html,
      category: "email-verification",
    });

    return { skipped: false };
  } catch (error) {
    console.error("Failed to send email via Mailtrap:", error);
    throw error;
  }
}

