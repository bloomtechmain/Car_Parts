import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { AuthRequest } from '../types';

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
    `SELECT sr.id, sr.price, sr.notes, sr.image_url, sr.created_at,
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

export async function getSuppliers(_req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT id, email, company_name, phone, is_active, created_at FROM users
     WHERE role = 'supplier' ORDER BY created_at DESC`
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
      res.status(409).json({ error: 'Email already in use' });
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
