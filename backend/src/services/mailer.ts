// Mail transport switch.
// EMAIL_PROVIDER=smtp   -> send through SMTP (e.g. Gmail) using nodemailer  [temporary option]
// EMAIL_PROVIDER=resend -> send through Resend (default)
// Both expose the same small API as the Resend SDK (emails.send / batch.send returning { data, error }),
// so emailService.ts does not need to know which provider is active.
import dotenv from 'dotenv';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

dotenv.config();

export interface MailMessage {
  from: string;
  to: string[] | string;
  subject: string;
  html: string;
  reply_to?: string;
}

interface SendResult {
  data: { id: string } | null;
  error: { message: string } | null;
}

interface BatchResult {
  data: { id: string }[] | null;
  error: { message: string } | null;
}

export interface Mailer {
  provider: 'smtp' | 'resend';
  emails: { send(msg: MailMessage): Promise<SendResult> };
  batch: { send(msgs: MailMessage[]): Promise<BatchResult> };
}

export const EMAIL_PROVIDER: 'smtp' | 'resend' =
  (process.env.EMAIL_PROVIDER || '').toLowerCase() === 'smtp' ? 'smtp' : 'resend';

/** Readable plain-text version of an HTML email (links kept as "text (url)") */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => `${text.replace(/<[^>]+>/g, '').trim()} (${href})`)
    .replace(/<\/(p|div|h[1-6]|tr|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .split('\n').map((l) => l.trim()).join('\n')
    .trim();
}

function createSmtpMailer(): Mailer {
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Reuse one connection — Gmail rejects many parallel logins ("421 too many connections")
    pool: true,
    maxConnections: 2,
  });

  async function attempt(msg: MailMessage) {
    return transporter.sendMail({
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      // Plain-text copy: HTML-only mail is a strong spam signal for Gmail/Outlook
      text: htmlToText(msg.html),
      replyTo: msg.reply_to || process.env.SMTP_USER,
    });
  }

  async function sendOne(msg: MailMessage): Promise<SendResult> {
    const to = Array.isArray(msg.to) ? msg.to.join(', ') : msg.to;
    try {
      let info;
      try {
        info = await attempt(msg);
      } catch (err) {
        // One retry for temporary SMTP problems (4xx / dropped connection)
        const code = (err as { responseCode?: number }).responseCode;
        const temporary = !code || (code >= 400 && code < 500);
        if (!temporary) throw err;
        await new Promise((r) => setTimeout(r, 1500));
        info = await attempt(msg);
      }
      if (info.rejected?.length) {
        const message = `Rejected by mail server: ${info.rejected.join(', ')} (${info.response})`;
        console.error(`[smtp] ✗ ${msg.subject} → ${to}: ${message}`);
        return { data: null, error: { message } };
      }
      console.log(`[smtp] ✓ accepted for delivery → ${info.accepted.join(', ')} | ${info.response}`);
      return { data: { id: info.messageId }, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[smtp] ✗ ${msg.subject} → ${to}: ${message}`);
      return { data: null, error: { message } };
    }
  }

  return {
    provider: 'smtp',
    emails: { send: sendOne },
    batch: {
      async send(msgs) {
        // One after another, so Gmail never sees a burst of parallel sends
        const results: SendResult[] = [];
        for (const m of msgs) results.push(await sendOne(m));
        const failed = results.filter((r) => r.error);
        if (failed.length) {
          return {
            data: null,
            error: { message: `${failed.length}/${msgs.length} failed: ${failed.map((f) => f.error!.message).join('; ')}` },
          };
        }
        return { data: results.map((r) => r.data!), error: null };
      },
    },
  };
}

function createResendMailer(): Mailer {
  const resend = new Resend(process.env.RESEND_API_KEY);
  return {
    provider: 'resend',
    emails: { send: (msg) => resend.emails.send(msg) as Promise<SendResult> },
    batch: { send: (msgs) => resend.batch.send(msgs) as unknown as Promise<BatchResult> },
  };
}

export const mailer: Mailer = EMAIL_PROVIDER === 'smtp' ? createSmtpMailer() : createResendMailer();

/** Sender address. With Gmail SMTP the From address must be the Gmail account itself. */
export function senderAddress(): string {
  const name = process.env.FROM_NAME || 'CarParts Finder';
  const email =
    EMAIL_PROVIDER === 'smtp'
      ? process.env.SMTP_USER || process.env.FROM_EMAIL
      : process.env.FROM_EMAIL || 'onboarding@resend.dev';
  return `${name} <${email}>`;
}

/** Returns a list of configuration problems (empty = looks OK). */
export function configProblems(): string[] {
  const problems: string[] = [];
  if (EMAIL_PROVIDER === 'smtp') {
    if (!process.env.SMTP_USER) problems.push('SMTP_USER is missing (your Gmail address)');
    if (!process.env.SMTP_PASS) problems.push('SMTP_PASS is missing (a 16-character Gmail App Password)');
  } else {
    const key = process.env.RESEND_API_KEY || '';
    if (!key.startsWith('re_') || key.length < 30) problems.push('RESEND_API_KEY is missing or a placeholder');
    if (/example\.com|yourdomain/.test(process.env.FROM_EMAIL || '')) problems.push('FROM_EMAIL is a placeholder');
  }
  return problems;
}
