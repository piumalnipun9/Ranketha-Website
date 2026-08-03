import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'node:path';

const envPath = process.env.SERVER_ENV_PATH || path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
export interface MailPayload {
  to: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

export async function sendMail({ to, subject, html, text, replyTo }: MailPayload) {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.FROM_EMAIL || user || 'no-replyroboclub@gmail.com'

  if (!host || !port || !user || !pass) {
    console.warn('SMTP not configured. Skipping email send.', { to, subject })
    return { skipped: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const info = await transporter.sendMail({ from, to, subject, html, text, replyTo })
  return { messageId: info.messageId }
}
