/**
 * STARVIS AI — Email Service (Resend)
 * Handles: OTP, magic links, notifications, assignment reminders, onboarding
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "noreply@starvis.app";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:8080";

// ── Helpers ────────────────────────────────────────────────────────────────

function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>STARVIS AI</title>
</head>
<body style="margin:0;padding:0;background:#01020f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:8px;">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:inline-block;text-align:center;line-height:36px;color:white;font-size:18px;">✦</div>
            <span style="font-size:22px;font-weight:700;color:white;">STARVIS AI</span>
          </div>
        </div>
        <!-- Card -->
        <div style="background:#0a0e23;border:1px solid rgba(139,92,246,0.3);border-radius:16px;padding:32px;">
          ${content}
        </div>
        <!-- Footer -->
        <div style="text-align:center;margin-top:24px;color:#4b5563;font-size:12px;">
          <p>© ${new Date().getFullYear()} STARVIS AI. All rights reserved.</p>
          <p>Built for students, by students.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email Functions ────────────────────────────────────────────────────────

/**
 * Onboarding welcome email
 */
export async function sendWelcomeEmail(to, name) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to STARVIS AI 🚀",
    html: emailWrapper(`
      <h1 style="color:white;font-size:24px;margin:0 0 8px;">Welcome, ${name}! 👋</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">Your AI academic copilot is ready. Let's make this semester your best one yet.</p>
      <div style="margin-bottom:24px;">
        <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;margin-bottom:8px;">
          <p style="color:#a78bfa;font-weight:600;margin:0 0 4px;">📝 AI Notes Generator</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Generate detailed study notes from any topic instantly.</p>
        </div>
        <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;margin-bottom:8px;">
          <p style="color:#a78bfa;font-weight:600;margin:0 0 4px;">💬 Chat with your PDFs</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Upload any document and ask questions about it.</p>
        </div>
        <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;">
          <p style="color:#a78bfa;font-weight:600;margin:0 0 4px;">🎯 AI Study Planner</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Get a personalised study schedule for your exams.</p>
        </div>
      </div>
      <a href="${CLIENT_ORIGIN}" style="display:block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:600;font-size:16px;">Open STARVIS AI →</a>
    `),
  });
}

/**
 * Assignment deadline reminder
 */
export async function sendAssignmentReminder(to, name, assignments) {
  if (!process.env.RESEND_API_KEY) return;
  const assignmentList = assignments.map((a) =>
    `<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <p style="color:white;margin:0;font-weight:500;">${a.assignment}</p>
      <p style="color:#6b7280;margin:4px 0 0;font-size:13px;">${a.course} • Due: ${new Date(a.dueDate).toLocaleDateString()}</p>
    </div>`
  ).join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ ${assignments.length} assignment(s) due soon — STARVIS`,
    html: emailWrapper(`
      <h1 style="color:white;font-size:20px;margin:0 0 4px;">Hey ${name}, deadlines approaching!</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">These assignments are due in the next 48 hours:</p>
      <div style="margin-bottom:24px;">${assignmentList}</div>
      <a href="${CLIENT_ORIGIN}/assignments" style="display:block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:600;">View Assignments →</a>
    `),
  });
}

/**
 * OTP verification email
 */
export async function sendOTPEmail(to, otp) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your STARVIS verification code: ${otp}`,
    html: emailWrapper(`
      <h1 style="color:white;font-size:20px;margin:0 0 8px;">Verify your email</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">Use this code to complete your sign-in. It expires in 10 minutes.</p>
      <div style="background:rgba(139,92,246,0.15);border:2px dashed rgba(139,92,246,0.4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:700;color:white;letter-spacing:12px;">${otp}</span>
      </div>
      <p style="color:#4b5563;font-size:13px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

/**
 * Login alert notification email
 */
export async function sendLoginAlertEmail(to, name) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "New login detected on your STARVIS AI account 🔐",
    html: emailWrapper(`
      <h1 style="color:white;font-size:20px;margin:0 0 8px;">Security Alert: New Login</h1>
      <p style="color:#9ca3af;margin:0 0 24px;">Hey ${name}, we detected a new login to your STARVIS account on ${new Date().toLocaleString()}.</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">If this was you, you can safely ignore this email. If this wasn't you, please secure your account immediately.</p>
      <a href="${CLIENT_ORIGIN}" style="display:block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;text-decoration:none;text-align:center;padding:12px;border-radius:10px;font-weight:600;">Go to STARVIS AI →</a>
    `),
  });
}
