import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.FROM_NAME || 'CarParts Finder'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@carpartsfinder.com';
const DEV_OVERRIDE = process.env.DEV_EMAIL_OVERRIDE;

// When DEV_EMAIL_OVERRIDE is set, all emails go to that address.
// Remove it from .env once you verify a domain at resend.com/domains.
function resolveRecipient(intended: string): { to: string[]; devNote: string } {
  if (DEV_OVERRIDE && intended !== DEV_OVERRIDE) {
    return { to: [DEV_OVERRIDE], devNote: `[DEV → intended for: ${intended}] ` };
  }
  return { to: [intended], devNote: '' };
}

interface TicketData {
  ticket_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_vin?: string | null;
  part_name: string;
  part_category: string;
  part_description?: string | null;
}

interface SupplierEmail {
  email: string;
  company_name: string | null;
}

function partDetailsTable(ticket: TicketData): string {
  return `
    <table style="border-collapse:collapse;width:100%;margin:16px 0;">
      <tr style="background:#f59e0b;color:#0a0f1e;">
        <th style="padding:10px 14px;text-align:left;">Field</th>
        <th style="padding:10px 14px;text-align:left;">Details</th>
      </tr>
      <tr style="background:#f9fafb;"><td style="padding:10px 14px;font-weight:600;">Ticket #</td><td style="padding:10px 14px;">${ticket.ticket_number}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;">Car Make</td><td style="padding:10px 14px;">${ticket.car_make}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:10px 14px;font-weight:600;">Car Model</td><td style="padding:10px 14px;">${ticket.car_model}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;">Year</td><td style="padding:10px 14px;">${ticket.car_year}</td></tr>
      ${ticket.car_vin ? `<tr style="background:#f9fafb;"><td style="padding:10px 14px;font-weight:600;">VIN</td><td style="padding:10px 14px;">${ticket.car_vin}</td></tr>` : ''}
      <tr style="background:#f9fafb;"><td style="padding:10px 14px;font-weight:600;">Part Category</td><td style="padding:10px 14px;">${ticket.part_category}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;">Part Name</td><td style="padding:10px 14px;">${ticket.part_name}</td></tr>
      ${ticket.part_description ? `<tr style="background:#f9fafb;"><td style="padding:10px 14px;font-weight:600;">Description</td><td style="padding:10px 14px;">${ticket.part_description}</td></tr>` : ''}
    </table>
  `;
}

export async function sendTicketToSuppliers(
  ticket: TicketData,
  suppliers: SupplierEmail[]
): Promise<void> {
  if (suppliers.length === 0) {
    console.log('[email] No active suppliers — skipping supplier notification');
    return;
  }

  const emails = suppliers.map((s) => {
    const { to, devNote } = resolveRecipient(s.email);
    return {
      from: FROM,
      to,
      subject: `${devNote}New Part Request — Ticket ${ticket.ticket_number}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
          ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for supplier: ${s.email} (${s.company_name || 'Unknown'})</div>` : ''}
          <div style="background:#f59e0b;padding:24px 32px;">
            <h1 style="margin:0;color:#0a0f1e;font-size:22px;">New Part Request</h1>
            <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">A customer is looking for a part — can you help?</p>
          </div>
          <div style="padding:32px;">
            <p style="color:#94a3b8;margin-bottom:8px;">Hello ${s.company_name || 'Supplier'},</p>
            <p style="color:#e2e8f0;line-height:1.6;">A new part request has been submitted. If you have this part available, please log in to your supplier dashboard and submit your quote.</p>
            ${partDetailsTable(ticket)}
            <div style="text-align:center;margin:32px 0;">
              <a href="${FRONTEND_URL}/dashboard/supplier" style="background:#f59e0b;color:#0a0f1e;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">View & Reply to Ticket</a>
            </div>
            <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:16px;">Customer contact information is not included. All communication is managed through the platform.</p>
          </div>
        </div>
      `,
    };
  });

  const result = await resend.batch.send(emails);
  if (result.error) {
    console.error('[email] Supplier batch send error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Supplier notifications sent to ${suppliers.length} supplier(s)`);
  }
}

export async function sendTicketConfirmation(
  ticket: TicketData,
  customerEmail: string,
  customerName: string
): Promise<void> {
  const { to, devNote } = resolveRecipient(customerEmail);

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${devNote}Your Part Request — Ticket ${ticket.ticket_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for customer: ${customerEmail}</div>` : ''}
        <div style="background:#f59e0b;padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f1e;font-size:22px;">Request Received!</h1>
          <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">We're finding suppliers for your part</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#94a3b8;">Hello ${customerName},</p>
          <p style="color:#e2e8f0;line-height:1.6;">Your part request has been submitted successfully. Our network of suppliers has been notified and will review your request.</p>
          <div style="background:#1a2235;border:1px solid #f59e0b;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
            <p style="color:#94a3b8;margin:0 0 6px;font-size:13px;">YOUR TICKET NUMBER</p>
            <p style="color:#f59e0b;font-size:28px;font-weight:700;margin:0;letter-spacing:2px;">${ticket.ticket_number}</p>
          </div>
          <p style="color:#94a3b8;font-size:14px;">Part: <strong style="color:#e2e8f0;">${ticket.part_name}</strong> for ${ticket.car_year} ${ticket.car_make} ${ticket.car_model}</p>
          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:24px;">We will contact you once we have quotes from our suppliers. Keep this ticket number for your reference.</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Customer confirmation error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Customer confirmation sent → ${to[0]} (intended: ${customerEmail})`);
  }
}

export async function sendQuoteToCustomer(
  ticket: TicketData & { ticket_number: string },
  customerEmail: string,
  customerName: string,
  reply: { price: number | null; notes: string | null; image_url: string | null; company_name: string | null }
): Promise<void> {
  const { to, devNote } = resolveRecipient(customerEmail);

  const priceLine = reply.price !== null
    ? `<p style="font-size:28px;font-weight:700;color:#f59e0b;margin:0;">Rs. ${Number(reply.price).toLocaleString('si-LK')}</p>`
    : `<p style="color:#94a3b8;margin:0;">Price on request</p>`;

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${devNote}New Quote Received — Ticket ${ticket.ticket_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for customer: ${customerEmail}</div>` : ''}
        <div style="background:#f59e0b;padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f1e;font-size:22px;">You Have a New Quote!</h1>
          <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">${reply.company_name || 'A supplier'} has responded to your part request</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#94a3b8;">Hello ${customerName},</p>
          <p style="color:#e2e8f0;line-height:1.6;">Great news! <strong>${reply.company_name || 'A supplier'}</strong> has submitted a quote for your <strong>${ticket.part_name}</strong> request (${ticket.car_year} ${ticket.car_make} ${ticket.car_model}).</p>

          <div style="background:#1a2235;border:1px solid #f59e0b;border-radius:10px;padding:20px;margin:24px 0;">
            <p style="color:#94a3b8;margin:0 0 6px;font-size:13px;">TICKET NUMBER</p>
            <p style="color:#f59e0b;font-size:20px;font-weight:700;margin:0 0 16px;letter-spacing:2px;">${ticket.ticket_number}</p>
            <p style="color:#94a3b8;margin:0 0 4px;font-size:13px;">QUOTED PRICE</p>
            ${priceLine}
            ${reply.company_name ? `<p style="color:#64748b;font-size:12px;margin:8px 0 0;">Quoted by: ${reply.company_name}</p>` : ''}
          </div>

          ${reply.notes ? `
          <div style="background:#1a2235;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Supplier Notes</p>
            <p style="color:#e2e8f0;margin:0;line-height:1.6;">${reply.notes}</p>
          </div>` : ''}

          ${reply.image_url ? `
          <p style="margin-bottom:20px;">
            <a href="${reply.image_url}" style="color:#f59e0b;font-size:14px;">View Part Image →</a>
          </p>` : ''}

          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:8px;">Our team will be in touch to help you compare quotes and proceed. You may receive more quotes from other suppliers — we will notify you for each one.</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Customer quote notification error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Quote notification sent to customer → ${to[0]} (intended: ${customerEmail})`);
  }
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const result = await resend.emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    reply_to: data.email,
    subject: `Contact Form: ${data.subject}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;padding:32px;">
        <h2 style="color:#f59e0b;margin-top:0;">New Contact Form Submission</h2>
        <p><strong style="color:#94a3b8;">From:</strong> ${data.name} (${data.email})</p>
        <p><strong style="color:#94a3b8;">Subject:</strong> ${data.subject}</p>
        <div style="background:#1a2235;border-radius:8px;padding:16px;margin-top:12px;">
          <p style="margin:0;color:#e2e8f0;line-height:1.7;">${data.message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Contact form error:', JSON.stringify(result.error));
  }
}

