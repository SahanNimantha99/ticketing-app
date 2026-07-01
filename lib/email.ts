import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Silently no-ops if RESEND_API_KEY isn't set, so local dev without email
// configured doesn't crash ticket creation.
export async function sendNewTicketEmail({
  to,
  ticketId,
  title,
  description,
  priority,
  projectName,
  clientName,
  appUrl,
}: {
  to: string[];
  ticketId: string;
  title: string;
  description: string;
  priority: string;
  projectName: string;
  clientName: string;
  appUrl: string;
}) {
  if (!resend || to.length === 0) return;

  const priorityColor = priority === "HIGH" ? "#dc2626" : priority === "MID" ? "#d97706" : "#16a34a";

  try {
    await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL || "Ticketing <notifications@yourdomain.com>",
      to,
      subject: `[${priority}] New ticket on ${projectName}: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px;">
          <p style="margin:0 0 12px;">
            <strong>${clientName}</strong> opened a new ticket on
            <strong>${projectName}</strong>.
          </p>
          <p style="margin:0 0 4px;">
            <span style="background:${priorityColor}; color:white; padding:2px 8px; border-radius:12px; font-size:12px;">
              ${priority} PRIORITY
            </span>
          </p>
          <h3 style="margin:16px 0 4px;">${title}</h3>
          <p style="white-space:pre-wrap; color:#374151;">${description}</p>
          <p style="margin-top:20px;">
            <a href="${appUrl}/tickets/${ticketId}" style="background:#111827;color:white;padding:8px 16px;border-radius:8px;text-decoration:none;">
              View ticket
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Don't let an email failure block ticket creation
    console.error("Failed to send new ticket email:", err);
  }
}
