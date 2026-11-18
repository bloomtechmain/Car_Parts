// Sends one test email using the email settings in backend/.env (SMTP or Resend).
// Usage:  npm run test:email                 -> sends to DEV_EMAIL_OVERRIDE / ADMIN_EMAIL
//         npm run test:email -- you@mail.com -> sends to that address
import dotenv from 'dotenv';
import { mailer, senderAddress, configProblems, EMAIL_PROVIDER } from '../services/mailer';

dotenv.config();

async function main(): Promise<void> {
  const to = process.argv[2] || process.env.DEV_EMAIL_OVERRIDE || process.env.ADMIN_EMAIL || '';
  const problems = configProblems();
  if (!to || /example\.com|yourdomain/.test(to)) {
    problems.push('No real recipient — set ADMIN_EMAIL or pass an address: npm run test:email -- you@mail.com');
  }
  console.log(`Provider: ${EMAIL_PROVIDER.toUpperCase()}  ·  From: ${senderAddress()}  ·  To: ${to || '(none)'}`);
  if (problems.length) {
    console.error('✗ Email is not configured:\n  - ' + problems.join('\n  - '));
    process.exit(1);
  }

  const { data, error } = await mailer.emails.send({
    from: senderAddress(),
    to: [to],
    subject: 'CarParts Finder — test email',
    html: `<p>If you can read this, email sending from CarParts Finder is working (via ${EMAIL_PROVIDER.toUpperCase()}).</p>`,
  });

  if (error) {
    console.error('✗ Email was rejected:', error.message);
    if (/Username and Password not accepted|Invalid login|535/i.test(error.message)) {
      console.error('  → Gmail needs an App Password (not your normal password): https://myaccount.google.com/apppasswords');
    }
    process.exit(1);
  }
  console.log(`✓ Test email sent to ${to} (id: ${data?.id})`);
}

main().catch((err) => {
  console.error('✗ Unexpected error:', err);
  process.exit(1);
});
