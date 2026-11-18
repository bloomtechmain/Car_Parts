import { Request, Response } from 'express';
import { z } from 'zod';
import { createTicket, getActiveSuppliers } from '../services/ticketService';
import {
  sendTicketToSuppliers,
  sendTicketConfirmation,
  sendContactFormEmail,
} from '../services/emailService';
import { finalizeSelection, getOfferedOptions } from '../services/selectionService';
import pool from '../config/db';
import { AuthRequest } from '../types';

const ticketSchema = z.object({
  car_make: z.string().min(1).max(100),
  car_model: z.string().min(1).max(100),
  car_year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  car_vin: z.string().max(50).optional(),
  part_name: z.string().min(1).max(255),
  part_description: z.string().max(2000).optional(),
  part_category: z.string().min(1).max(100),
  // Contact details are NOT asked for: emails go to the account email, SMS to the account phone.
  // (Older clients may still send these — they are ignored except an optional name/location.)
  full_name: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
});

/** POST /api/tickets — requires a logged-in customer account. */
export async function submitTicket(req: AuthRequest, res: Response): Promise<void> {
  const parsed = ticketSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const account = await pool.query(
      `SELECT id, email, phone FROM users WHERE id = $1 AND role = 'customer' AND is_active = true`,
      [req.user!.id]
    );
    if (!account.rows[0]) {
      res.status(403).json({ error: 'Please log in with a customer account to request a part.' });
      return;
    }
    const email: string = account.rows[0].email;
    const phone: string = account.rows[0].phone || '';
    // No name is collected — greet by the email's local part (e.g. "Hello nimal")
    const fullName = parsed.data.full_name?.trim() || email.split('@')[0];

    const { ticketId, ticketNumber } = await createTicket({
      ...parsed.data,
      full_name: fullName,
      email,
      phone,
      location: parsed.data.location?.trim() || '',
      customer_user_id: req.user!.id,
    });

    const ticketRow = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = ticketRow.rows[0];
    const suppliers = await getActiveSuppliers(ticketId);

    await Promise.allSettled([
      sendTicketToSuppliers(ticket, suppliers),
      sendTicketConfirmation(ticket, email, fullName),
    ]);

    res.status(201).json({
      ticket_number: ticketNumber,
      ticket_id: ticketId,
      message: 'Your part request has been submitted. Check your email for confirmation.',
    });
  } catch (err) {
    console.error('Ticket submission error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
}

const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
});

export async function submitContactForm(req: Request, res: Response): Promise<void> {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    await sendContactFormEmail(parsed.data);
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/** "nimal@gmail.com" → "ni***@gmail.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Which customer account owns a ticket — sent to the email-link page so it can send the customer
 * to the right portal. Only a masked email hint is exposed (the caller already holds the ticket's link).
 */
async function ticketOwner(ticketId: number) {
  const r = await pool.query(
    `SELECT t.id, u.email
     FROM tickets t
     LEFT JOIN users u ON u.id = t.customer_user_id AND u.role = 'customer'
     WHERE t.id = $1`,
    [ticketId]
  );
  const row = r.rows[0];
  return {
    ticket_id: ticketId,
    has_account: Boolean(row?.email),
    account_hint: row?.email ? maskEmail(row.email) : null,
  };
}

/** GET /api/tickets/select-option?token=&reply= — preview from the email link (no login needed). */
export async function getSelectionPreview(req: Request, res: Response): Promise<void> {
  const { token, reply } = req.query;

  if (!token || !reply) {
    res.status(400).json({ error: 'Missing token or reply parameter' });
    return;
  }

  const ticketResult = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year,
            t.part_name, t.part_category, t.status
     FROM tickets t
     WHERE t.options_token = $1`,
    [token]
  );

  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Invalid or expired selection link' });
    return;
  }

  const ticket = ticketResult.rows[0];

  if (ticket.status === 'closed') {
    res.status(410).json({
      error: 'This ticket has already been completed',
      already_selected: true,
      owner: await ticketOwner(ticket.id),
    });
    return;
  }

  const options = await getOfferedOptions(ticket.id);
  const index = options.findIndex((o) => String(o.id) === String(reply));
  if (index === -1) {
    res.status(404).json({ error: 'Option not found' });
    return;
  }

  res.json({
    ticket_number: ticket.ticket_number,
    car_make: ticket.car_make,
    car_model: ticket.car_model,
    car_year: ticket.car_year,
    part_name: ticket.part_name,
    part_category: ticket.part_category,
    option: {
      reply_id: options[index].id,
      admin_price: options[index].admin_price,
      delivery_days: options[index].delivery_days,
      option_number: index + 1,
    },
  });
}

/** POST /api/tickets/confirm-selection — confirm from the email link (no login needed). */
export async function confirmSelection(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    token: z.string().min(1),
    reply_id: z.number().int().positive(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  const ticketResult = await pool.query(
    'SELECT id, status FROM tickets WHERE options_token = $1',
    [parsed.data.token]
  );
  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Invalid or expired selection link' });
    return;
  }

  const ticketId: number = ticketResult.rows[0].id;
  const result = await finalizeSelection(ticketId, parsed.data.reply_id);
  if (!result.ok) {
    res.status(result.status).json({
      error: result.error,
      already_selected: result.already_selected,
      ...(result.already_selected ? { owner: await ticketOwner(ticketId) } : {}),
    });
    return;
  }
  res.json({
    message: 'Order confirmed successfully',
    option_number: result.option_number,
    owner: await ticketOwner(ticketId),
  });
}
