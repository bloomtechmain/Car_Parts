import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { getOfferedOptions, finalizeSelection } from '../services/selectionService';
import { passwordUsedByOtherAccount, PASSWORD_REUSE_MESSAGE } from '../services/accountService';

// Customers only ever see the admin price and delivery time of the options offered to them —
// never supplier names, supplier prices, notes or images.

/** GET /api/customer/tickets — the logged-in customer's requests. */
export async function getMyTickets(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year,
            t.part_name, t.part_category, t.status, t.created_at, t.selected_reply_id,
            (SELECT COUNT(*)::int FROM supplier_replies sr WHERE sr.ticket_id = t.id) AS quotes_received,
            (SELECT COUNT(*)::int FROM supplier_replies sr
              WHERE sr.ticket_id = t.id AND sr.admin_price IS NOT NULL
                AND (sr.sent_to_customer OR t.options_token IS NOT NULL OR t.selected_reply_id IS NOT NULL)
            ) AS options_ready
     FROM tickets t
     WHERE t.customer_user_id = $1
     ORDER BY t.created_at DESC`,
    [req.user!.id]
  );
  res.json({ tickets: result.rows });
}

/** GET /api/customer/tickets/:id — one request with the options offered. */
export async function getMyTicket(req: AuthRequest, res: Response): Promise<void> {
  const ticketResult = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year, t.car_vin,
            t.part_name, t.part_description, t.part_category, t.status, t.created_at,
            t.selected_reply_id, t.options_token IS NOT NULL AS options_sent,
            c.full_name, c.phone, c.location,
            (SELECT COUNT(*)::int FROM supplier_replies sr WHERE sr.ticket_id = t.id) AS quotes_received
     FROM tickets t
     JOIN customers c ON c.ticket_id = t.id
     WHERE t.id = $1 AND t.customer_user_id = $2`,
    [req.params.id, req.user!.id]
  );
  const ticket = ticketResult.rows[0];
  if (!ticket) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  // Options become visible once the admin has sent them (or one was already selected)
  const visible = ticket.options_sent || ticket.selected_reply_id !== null;
  const options = visible
    ? (await getOfferedOptions(ticket.id)).map((o, i) => ({
        reply_id: o.id,
        option_number: i + 1,
        admin_price: o.admin_price,
        delivery_days: o.delivery_days,
      }))
    : [];

  delete ticket.options_sent;
  res.json({ ...ticket, options });
}

/** POST /api/customer/tickets/:id/select — choose an option from the portal (same flow as the email link). */
export async function selectOption(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ reply_id: z.number().int().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  const own = await pool.query(
    `SELECT id, options_token IS NOT NULL AS options_sent FROM tickets WHERE id = $1 AND customer_user_id = $2`,
    [req.params.id, req.user!.id]
  );
  if (!own.rows[0]) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (!own.rows[0].options_sent) {
    res.status(400).json({ error: 'Options for this request are not ready yet.' });
    return;
  }

  const result = await finalizeSelection(own.rows[0].id, parsed.data.reply_id);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error, already_selected: result.already_selected });
    return;
  }
  res.json({ message: 'Order confirmed successfully', option_number: result.option_number });
}

/** GET /api/customer/profile */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT email, phone, created_at FROM users WHERE id = $1 AND role = 'customer'`,
    [req.user!.id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  res.json(result.rows[0]);
}

const profileSchema = z.object({
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(50).optional(),
  current_password: z.string().optional(),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(200).optional(),
});

/** PATCH /api/customer/profile — change phone and/or password. */
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    res.status(400).json({ error: first || 'Invalid input' });
    return;
  }
  const { phone, current_password, new_password } = parsed.data;

  const userResult = await pool.query(
    `SELECT email, password_hash FROM users WHERE id = $1 AND role = 'customer'`,
    [req.user!.id]
  );
  const user = userResult.rows[0];
  if (!user) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  if (phone !== undefined) {
    await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [phone, req.user!.id]);
  }

  if (new_password) {
    if (!current_password || !(await bcrypt.compare(current_password, user.password_hash))) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    if (await passwordUsedByOtherAccount(user.email, 'customer', new_password)) {
      res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
      return;
    }
    const hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user!.id]);
  }

  res.json({ message: 'Account updated' });
}
