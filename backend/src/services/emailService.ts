import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.FROM_NAME || 'CarParts Finder'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@carpartsfinder.com';
const DEV_OVERRIDE = process.env.DEV_EMAIL_OVERRIDE;

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
            <p style="color:#e2e8f0;line-height:1.6;">A new part request <strong style="color:#f59e0b;">Ticket #${ticket.ticket_number}</strong> has been submitted for a <strong style="color:#f59e0b;">${ticket.car_year} ${ticket.car_make} ${ticket.car_model}</strong>. If you have the <strong>${ticket.part_name}</strong> available, please log in to your supplier dashboard and submit your quote with your price and estimated delivery time.</p>
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
          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:24px;">We will contact you once we have pricing options ready. Keep this ticket number for your reference.</p>
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

export interface QuoteOption {
  reply_id: number;
  admin_price: number;
  delivery_days: number;
  option_number: number;
}

export async function sendOptionsEmail(
  ticket: TicketData & { ticket_number: string; options_token: string },
  customerEmail: string,
  customerName: string,
  options: QuoteOption[]
): Promise<void> {
  const { to, devNote } = resolveRecipient(customerEmail);

  const optionCards = options.map((opt) => {
    const selectUrl = `${FRONTEND_URL}/select-option?token=${ticket.options_token}&reply=${opt.reply_id}`;
    return `
      <div style="background:#1a2235;border:1px solid #1e2d45;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="background:#f59e0b;color:#0a0f1e;font-weight:700;font-size:12px;padding:4px 10px;border-radius:20px;">OPTION ${opt.option_number}</span>
        </div>
        <p style="color:#f59e0b;font-size:26px;font-weight:700;margin:0 0 6px;">Rs. ${Number(opt.admin_price).toLocaleString('si-LK')}</p>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 16px;">Estimated delivery: <strong style="color:#e2e8f0;">${opt.delivery_days} day${opt.delivery_days !== 1 ? 's' : ''}</strong></p>
        <a href="${selectUrl}" style="display:inline-block;background:#f59e0b;color:#0a0f1e;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Select This Option</a>
      </div>
    `;
  }).join('');

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${devNote}Pricing Options Ready — Ticket ${ticket.ticket_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for customer: ${customerEmail}</div>` : ''}
        <div style="background:#f59e0b;padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f1e;font-size:22px;">Your Pricing Options Are Ready!</h1>
          <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">Please choose the option that best suits you</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#94a3b8;">Hello ${customerName},</p>
          <p style="color:#e2e8f0;line-height:1.6;">We have found <strong>${options.length} option${options.length !== 1 ? 's' : ''}</strong> for your <strong>${ticket.part_name}</strong> request (${ticket.car_year} ${ticket.car_make} ${ticket.car_model}).</p>

          <div style="background:#1a2235;border:1px solid #f59e0b;border-radius:10px;padding:12px 20px;margin:20px 0;text-align:center;">
            <p style="color:#94a3b8;margin:0 0 4px;font-size:12px;">TICKET NUMBER</p>
            <p style="color:#f59e0b;font-size:18px;font-weight:700;margin:0;letter-spacing:2px;">${ticket.ticket_number}</p>
          </div>

          <p style="color:#94a3b8;font-size:14px;margin-bottom:20px;">Review the options below and click <strong style="color:#f59e0b;">Select This Option</strong> on the one you prefer to place your order:</p>

          ${optionCards}

          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:8px;">Once you select an option, your order will be confirmed and we will take care of the rest. Supplier details are not shown — all arrangements are handled by CarParts Finder.</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Options email error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Options email sent to customer → ${to[0]} (intended: ${customerEmail})`);
  }
}

export async function sendOrderConfirmationToCustomer(
  ticket: TicketData & { ticket_number: string },
  customerEmail: string,
  customerName: string,
  option: { admin_price: number; delivery_days: number; option_number: number }
): Promise<void> {
  const { to, devNote } = resolveRecipient(customerEmail);

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${devNote}Order Confirmed — Ticket ${ticket.ticket_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for customer: ${customerEmail}</div>` : ''}
        <div style="background:#22c55e;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Order Confirmed!</h1>
          <p style="margin:4px 0 0;color:#ffffff;opacity:0.9;">Your selection has been placed successfully</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#94a3b8;">Hello ${customerName},</p>
          <p style="color:#e2e8f0;line-height:1.6;">Thank you for your order! Your selection for <strong>${ticket.part_name}</strong> (${ticket.car_year} ${ticket.car_make} ${ticket.car_model}) has been confirmed.</p>

          <div style="background:#1a2235;border:1px solid #22c55e;border-radius:10px;padding:20px;margin:24px 0;">
            <p style="color:#94a3b8;margin:0 0 4px;font-size:12px;">TICKET NUMBER</p>
            <p style="color:#f59e0b;font-size:18px;font-weight:700;margin:0 0 16px;letter-spacing:2px;">${ticket.ticket_number}</p>
            <p style="color:#94a3b8;margin:0 0 4px;font-size:12px;">SELECTED OPTION</p>
            <p style="color:#e2e8f0;font-weight:600;margin:0 0 12px;">Option ${option.option_number}</p>
            <p style="color:#94a3b8;margin:0 0 4px;font-size:12px;">PRICE</p>
            <p style="color:#f59e0b;font-size:24px;font-weight:700;margin:0 0 12px;">Rs. ${Number(option.admin_price).toLocaleString('si-LK')}</p>
            <p style="color:#94a3b8;margin:0 0 4px;font-size:12px;">ESTIMATED DELIVERY</p>
            <p style="color:#e2e8f0;font-weight:600;margin:0;">${option.delivery_days} day${option.delivery_days !== 1 ? 's' : ''}</p>
          </div>

          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:8px;">Our team will be in touch with further delivery details. Thank you for choosing CarParts Finder!</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Order confirmation error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Order confirmation sent to customer → ${to[0]}`);
  }
}

export async function sendSupplierOrderNotification(
  supplierEmail: string,
  companyName: string | null,
  ticket: TicketData & { ticket_number: string },
  delivery_days: number
): Promise<void> {
  const { to, devNote } = resolveRecipient(supplierEmail);

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${devNote}Your Quote Was Selected — Ticket ${ticket.ticket_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        ${devNote ? `<div style="background:#7c3aed;padding:10px 20px;font-size:12px;color:#fff;">🔧 DEV MODE — Intended for supplier: ${supplierEmail}</div>` : ''}
        <div style="background:#f59e0b;padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f1e;font-size:22px;">Your Quote Was Selected!</h1>
          <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">A customer has chosen your offer</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#94a3b8;">Hello ${companyName || 'Supplier'},</p>
          <p style="color:#e2e8f0;line-height:1.6;">A customer has selected your quote for <strong style="color:#f59e0b;">${ticket.part_name}</strong> — <strong style="color:#f59e0b;">${ticket.car_year} ${ticket.car_make} ${ticket.car_model}</strong> (Ticket <strong style="color:#f59e0b;">#${ticket.ticket_number}</strong>). Please prepare for delivery within your stated timeframe of <strong>${delivery_days} day${delivery_days !== 1 ? 's' : ''}</strong>.</p>
          ${partDetailsTable(ticket)}
          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:16px;">Our team will coordinate the delivery details with you. Do not contact the customer directly — all arrangements go through CarParts Finder.</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Supplier order notification error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Supplier order notification sent → ${to[0]}`);
  }
}

export async function sendAdminSelectionNotification(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketNumber: string;
  ticketId: number;
  carMake: string;
  carModel: string;
  carYear: number;
  partName: string;
  partCategory: string;
  supplierName: string | null;
  option: { option_number: number; admin_price: number; delivery_days: number };
}): Promise<void> {
  const { customerName, customerEmail, customerPhone, ticketNumber, ticketId,
          carMake, carModel, carYear, partName, partCategory,
          supplierName, option } = params;

  const result = await resend.emails.send({
    from: FROM,
    to: [ADMIN_EMAIL],
    subject: `Customer Selected Option ${option.option_number} — Ticket ${ticketNumber}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#ffffff;border-radius:12px;overflow:hidden;">
        <div style="background:#f59e0b;padding:24px 32px;">
          <h1 style="margin:0;color:#0a0f1e;font-size:22px;">Customer Has Selected an Option</h1>
          <p style="margin:4px 0 0;color:#0a0f1e;opacity:0.8;">Ticket #${ticketNumber} — Action required</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#e2e8f0;line-height:1.6;margin-bottom:24px;">A customer has confirmed their option selection. Here are the full details:</p>

          <h3 style="color:#f59e0b;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Customer Details</h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;width:40%;">Name</td><td style="padding:10px 14px;color:#e2e8f0;">${customerName}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Email</td><td style="padding:10px 14px;color:#e2e8f0;">${customerEmail}</td></tr>
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Phone</td><td style="padding:10px 14px;color:#e2e8f0;">${customerPhone}</td></tr>
          </table>

          <h3 style="color:#f59e0b;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Ticket & Vehicle</h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;width:40%;">Ticket ID</td><td style="padding:10px 14px;color:#e2e8f0;">#${ticketId} (${ticketNumber})</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Car Brand</td><td style="padding:10px 14px;color:#e2e8f0;">${carMake}</td></tr>
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Car Model</td><td style="padding:10px 14px;color:#e2e8f0;">${carModel}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Year</td><td style="padding:10px 14px;color:#e2e8f0;">${carYear}</td></tr>
          </table>

          <h3 style="color:#f59e0b;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Part & Selected Option</h3>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;width:40%;">Part Name</td><td style="padding:10px 14px;color:#e2e8f0;">${partName}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Part Category</td><td style="padding:10px 14px;color:#e2e8f0;">${partCategory}</td></tr>
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Supplier</td><td style="padding:10px 14px;color:#e2e8f0;">${supplierName || 'N/A'}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Selected Option</td><td style="padding:10px 14px;color:#f59e0b;font-weight:700;">Option ${option.option_number}</td></tr>
            <tr style="background:#1a2235;"><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Price (Admin)</td><td style="padding:10px 14px;color:#f59e0b;font-weight:700;">Rs. ${Number(option.admin_price).toLocaleString('si-LK')}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:600;color:#94a3b8;">Delivery</td><td style="padding:10px 14px;color:#e2e8f0;">${option.delivery_days} day${option.delivery_days !== 1 ? 's' : ''}</td></tr>
          </table>

          <p style="color:#64748b;font-size:13px;border-top:1px solid #1a2235;padding-top:16px;margin-top:8px;">This is an automated notification. The ticket has been marked as closed in the dashboard.</p>
        </div>
      </div>
    `,
  });

  if (result.error) {
    console.error('[email] Admin selection notification error:', JSON.stringify(result.error));
  } else {
    console.log(`[email] Admin selection notification sent → ${ADMIN_EMAIL}`);
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
