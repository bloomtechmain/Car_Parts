import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { sendOptionsEmail, QuoteOption, sendSupplierApprovalEmail } from '../services/emailService';
import { passwordUsedByOtherAccount, PASSWORD_REUSE_MESSAGE } from '../services/accountService';

export async function getTickets(_req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year,
            t.part_name, t.part_category, t.status, t.created_at,
            c.full_name AS customer_name, c.email AS customer_email,
            COUNT(sr.id)::int AS reply_count
     FROM tickets t
     JOIN customers c ON c.ticket_id = t.id
     LEFT JOIN supplier_replies sr ON sr.ticket_id = t.id
     GROUP BY t.id, c.full_name, c.email
     ORDER BY t.created_at DESC`
  );
  res.json({ tickets: result.rows, total: result.rows.length });
}

export async function getTicket(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const ticketResult = await pool.query(
    'SELECT * FROM tickets WHERE id = $1',
    [id]
  );
  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const customerResult = await pool.query(
    'SELECT full_name, email, phone, location FROM customers WHERE ticket_id = $1',
    [id]
  );

  const repliesResult = await pool.query(
    `SELECT sr.id, sr.price, sr.delivery_days, sr.admin_price, sr.notes, sr.image_url, sr.created_at,
            u.company_name, u.email AS supplier_email
     FROM supplier_replies sr
     JOIN users u ON u.id = sr.supplier_id
     WHERE sr.ticket_id = $1
     ORDER BY sr.created_at ASC`,
    [id]
  );

  res.json({
    ...ticketResult.rows[0],
    customer: customerResult.rows[0] || null,
    replies: repliesResult.rows,
  });
}

export async function updateTicketStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const schema = z.object({ status: z.enum(['open', 'replied', 'closed']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const result = await pool.query(
    'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING id, status',
    [parsed.data.status, id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json(result.rows[0]);
}

export async function updateReplyAdminPrice(req: AuthRequest, res: Response): Promise<void> {
  const { id, replyId } = req.params;
  const schema = z.object({
    admin_price: z.number().positive(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid admin price' });
    return;
  }

  const result = await pool.query(
    `UPDATE supplier_replies SET admin_price = $1
     WHERE id = $2 AND ticket_id = $3
     RETURNING id, admin_price`,
    [parsed.data.admin_price, replyId, id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Reply not found' });
    return;
  }
  res.json(result.rows[0]);
}

export async function sendOptionsToCustomer(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const bodySchema = z.object({ reply_ids: z.array(z.number().int().positive()).min(1) });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please select at least one supplier option to send.' });
    return;
  }
  const { reply_ids } = parsed.data;

  const ticketResult = await pool.query(
    'SELECT * FROM tickets WHERE id = $1',
    [id]
  );
  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const customerResult = await pool.query(
    'SELECT full_name, email, phone FROM customers WHERE ticket_id = $1',
    [id]
  );
  if (!customerResult.rows[0]) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  const repliesResult = await pool.query(
    `SELECT id, admin_price, delivery_days FROM supplier_replies
     WHERE ticket_id = $1 AND id = ANY($2::int[]) AND admin_price IS NOT NULL
     ORDER BY created_at ASC`,
    [id, reply_ids]
  );

  if (repliesResult.rows.length === 0) {
    res.status(400).json({ error: 'None of the selected options have an admin price set. Please save prices before sending.' });
    return;
  }

  const ticket = ticketResult.rows[0];

  // Reuse the existing token when options are re-sent, so links in earlier emails keep working.
  const token: string = ticket.options_token || crypto.randomBytes(32).toString('hex');
  if (!ticket.options_token) {
    await pool.query(
      'UPDATE tickets SET options_token = $1 WHERE id = $2',
      [token, id]
    );
  }
  const customer = customerResult.rows[0];

  // Remember which replies were offered, so the customer portal shows the same options
  await pool.query(
    'UPDATE supplier_replies SET sent_to_customer = true WHERE ticket_id = $1 AND id = ANY($2::int[])',
    [id, repliesResult.rows.map((r) => r.id)]
  );

  const options: QuoteOption[] = repliesResult.rows.map((r, i) => ({
    reply_id: r.id,
    admin_price: Number(r.admin_price),
    delivery_days: Number(r.delivery_days),
    option_number: i + 1,
  }));

  res.json({ message: 'Options sent to customer', options_count: options.length });

  sendOptionsEmail(
    { ...ticket, options_token: token },
    customer.email,
    customer.full_name,
    options
  ).catch((err) => console.error('Options email error:', err));
}

export async function getSuppliers(_req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT id, email, company_name, phone, is_active, created_at FROM users
     WHERE role = 'supplier' AND approval_status = 'approved' ORDER BY created_at DESC`
  );
  res.json({ suppliers: result.rows });
}

const supplierSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  company_name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
});

export async function createSupplier(req: AuthRequest, res: Response): Promise<void> {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  if (await passwordUsedByOtherAccount(parsed.data.email, 'supplier', parsed.data.password)) {
    res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
    return;
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, company_name, phone)
       VALUES ($1,$2,'supplier',$3,$4)
       RETURNING id, email, company_name, phone, is_active, created_at`,
      [parsed.data.email, hash, parsed.data.company_name, parsed.data.phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'A supplier account with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create supplier' });
    }
  }
}

const updateSupplierSchema = z.object({
  company_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function updateSupplier(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const parsed = updateSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (parsed.data.company_name !== undefined) { updates.push(`company_name = $${idx++}`); values.push(parsed.data.company_name); }
  if (parsed.data.phone !== undefined) { updates.push(`phone = $${idx++}`); values.push(parsed.data.phone); }
  if (parsed.data.is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(parsed.data.is_active); }
  if (parsed.data.password) {
    const sup = await pool.query(`SELECT email FROM users WHERE id = $1 AND role = 'supplier'`, [id]);
    if (sup.rows[0] && (await passwordUsedByOtherAccount(sup.rows[0].email, 'supplier', parsed.data.password))) {
      res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
      return;
    }
    const hash = await bcrypt.hash(parsed.data.password, 12);
    updates.push(`password_hash = $${idx++}`); values.push(hash);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} AND role = 'supplier'
     RETURNING id, email, company_name, phone, is_active`,
    values
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Supplier not found' });
    return;
  }
  res.json(result.rows[0]);
}

export async function deleteSupplier(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 AND role = 'supplier' RETURNING id`,
    [id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Supplier not found' });
    return;
  }
  res.json({ message: 'Supplier deleted' });
}

/* ───────────────────────── Customer management ───────────────────────── */

export async function getCustomers(_req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT u.id, u.email, u.phone, u.is_active, u.created_at,
            COUNT(t.id)::int AS ticket_count,
            COUNT(t.id) FILTER (WHERE t.status <> 'closed')::int AS active_count,
            COUNT(t.id) FILTER (WHERE t.selected_reply_id IS NOT NULL)::int AS order_count,
            MAX(t.created_at) AS last_request_at
     FROM users u
     LEFT JOIN tickets t ON t.customer_user_id = u.id
     WHERE u.role = 'customer'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  res.json({ customers: result.rows });
}

export async function getCustomerTickets(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year, t.part_name,
            t.status, t.created_at, t.selected_reply_id,
            (SELECT COUNT(*)::int FROM supplier_replies sr WHERE sr.ticket_id = t.id) AS reply_count
     FROM tickets t
     JOIN users u ON u.id = t.customer_user_id AND u.role = 'customer'
     WHERE t.customer_user_id = $1
     ORDER BY t.created_at DESC`,
    [req.params.id]
  );
  res.json({ tickets: result.rows });
}

const createCustomerSchema = z.object({
  email: z.string().trim().email(),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function createCustomer(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    res.status(400).json({ error: first || 'Invalid input' });
    return;
  }
  if (await passwordUsedByOtherAccount(parsed.data.email, 'customer', parsed.data.password)) {
    res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
    return;
  }
  const hash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, phone)
       VALUES ($1, $2, 'customer', $3)
       RETURNING id, email, phone, is_active, created_at`,
      [parsed.data.email, hash, parsed.data.phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'A customer account with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
}

const updateCustomerSchema = z.object({
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(50).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export async function updateCustomer(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const parsed = updateCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    res.status(400).json({ error: first || 'Invalid input' });
    return;
  }

  const existing = await pool.query(`SELECT email FROM users WHERE id = $1 AND role = 'customer'`, [id]);
  if (!existing.rows[0]) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (parsed.data.phone !== undefined) { updates.push(`phone = $${idx++}`); values.push(parsed.data.phone); }
  if (parsed.data.is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(parsed.data.is_active); }
  if (parsed.data.password) {
    if (await passwordUsedByOtherAccount(existing.rows[0].email, 'customer', parsed.data.password)) {
      res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
      return;
    }
    updates.push(`password_hash = $${idx++}`); values.push(await bcrypt.hash(parsed.data.password, 12));
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} AND role = 'customer'
     RETURNING id, email, phone, is_active, created_at`,
    values
  );
  res.json(result.rows[0]);
}

/** Deletes the login only — the customer's tickets stay (unlinked) so order history is kept. */
export async function deleteCustomer(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 AND role = 'customer' RETURNING id`,
    [req.params.id]
  );
  if (!result.rows[0]) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  res.json({ message: 'Customer deleted' });
}

/* ───────────────────────── Supplier account requests ───────────────────────── */

/** GET /api/admin/supplier-requests?status=pending|rejected */
export async function getSupplierRequests(req: AuthRequest, res: Response): Promise<void> {
  const status = req.query.status === 'rejected' ? 'rejected' : 'pending';
  const result = await pool.query(
    `SELECT id, email, company_name, phone, address, business_details, approval_status,
            rejection_reason, created_at, reviewed_at
     FROM users
     WHERE role = 'supplier' AND approval_status = $1
     ORDER BY created_at DESC`,
    [status]
  );
  const pending = await pool.query(
    `SELECT COUNT(*)::int AS n FROM users WHERE role = 'supplier' AND approval_status = 'pending'`
  );
  res.json({ requests: result.rows, pending_count: pending.rows[0].n });
}

/** POST /api/admin/supplier-requests/:id/approve — the supplier can log in and starts receiving requests */
export async function approveSupplierRequest(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `UPDATE users SET approval_status = 'approved', is_active = true, reviewed_at = NOW(), rejection_reason = NULL
     WHERE id = $1 AND role = 'supplier' AND approval_status IN ('pending', 'rejected')
     RETURNING id, email, company_name`,
    [req.params.id]
  );
  const s = result.rows[0];
  if (!s) {
    res.status(404).json({ error: 'Request not found or already approved' });
    return;
  }
  res.json({ message: 'Supplier approved', supplier: s });
  sendSupplierApprovalEmail(s.email, s.company_name, true).catch((err) => console.error('Approval email error:', err));
}

/** POST /api/admin/supplier-requests/:id/reject — { reason?: string } */
export async function rejectSupplierRequest(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ reason: z.string().trim().max(1000).optional() }).safeParse(req.body ?? {});
  const reason = parsed.success ? parsed.data.reason || null : null;
  const result = await pool.query(
    `UPDATE users SET approval_status = 'rejected', is_active = false, reviewed_at = NOW(), rejection_reason = $2
     WHERE id = $1 AND role = 'supplier' AND approval_status = 'pending'
     RETURNING id, email, company_name`,
    [req.params.id, reason]
  );
  const s = result.rows[0];
  if (!s) {
    res.status(404).json({ error: 'Request not found or already handled' });
    return;
  }
  res.json({ message: 'Supplier request rejected' });
  sendSupplierApprovalEmail(s.email, s.company_name, false, reason).catch((err) => console.error('Rejection email error:', err));
}
