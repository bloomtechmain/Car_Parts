import { Response } from 'express';
import { z } from 'zod';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { uploadFile } from '../services/r2Service';
import { sendQuoteToCustomer } from '../services/emailService';
import { sendQuoteSMS } from '../services/smsService';

export async function getTickets(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT t.id, t.ticket_number, t.car_make, t.car_model, t.car_year, t.car_vin,
            t.part_name, t.part_description, t.part_category, t.status, t.created_at,
            COUNT(sr.id)::int AS reply_count,
            EXISTS(SELECT 1 FROM supplier_replies WHERE ticket_id = t.id AND supplier_id = $1) AS i_replied
     FROM tickets t
     LEFT JOIN supplier_replies sr ON sr.ticket_id = t.id
     WHERE t.status != 'closed'
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [req.user!.id]
  );
  res.json({ tickets: result.rows, total: result.rows.length });
}

export async function getTicket(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const ticketResult = await pool.query(
    `SELECT id, ticket_number, car_make, car_model, car_year, car_vin,
            part_name, part_description, part_category, status, created_at
     FROM tickets WHERE id = $1 AND status != 'closed'`,
    [id]
  );

  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const myReplyResult = await pool.query(
    `SELECT id, price, notes, image_url, created_at FROM supplier_replies
     WHERE ticket_id = $1 AND supplier_id = $2`,
    [id, req.user!.id]
  );

  res.json({
    ...ticketResult.rows[0],
    my_reply: myReplyResult.rows[0] || null,
  });
}

const replySchema = z.object({
  price: z.preprocess((v) => (v !== '' && v !== null && v !== undefined ? Number(v) : undefined), z.number().positive().optional()),
  notes: z.string().max(2000).optional(),
});

export async function submitReply(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  const ticketResult = await pool.query(
    'SELECT id, status FROM tickets WHERE id = $1',
    [id]
  );
  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const existing = await pool.query(
    'SELECT id FROM supplier_replies WHERE ticket_id = $1 AND supplier_id = $2',
    [id, req.user!.id]
  );
  if (existing.rows[0]) {
    res.status(409).json({ error: 'You have already replied to this ticket' });
    return;
  }

  let imageUrl: string | null = null;
  if (req.file) {
    try {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch (err) {
      console.error('R2 upload error:', err);
      res.status(500).json({ error: 'Failed to upload image' });
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const replyResult = await client.query(
      `INSERT INTO supplier_replies (ticket_id, supplier_id, price, notes, image_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, req.user!.id, parsed.data.price || null, parsed.data.notes || null, imageUrl]
    );

    if (ticketResult.rows[0].status === 'open') {
      await client.query(`UPDATE tickets SET status = 'replied' WHERE id = $1`, [id]);
    }

    await client.query('COMMIT');
    res.status(201).json(replyResult.rows[0]);

    // Notify customer by email — fire and forget, don't block the response
    pool.query(
      `SELECT t.ticket_number, t.car_make, t.car_model, t.car_year, t.part_name,
              c.full_name, c.email, c.phone,
              u.company_name
       FROM tickets t
       JOIN customers c ON c.ticket_id = t.id
       JOIN users u ON u.id = $2
       WHERE t.id = $1`,
      [id, req.user!.id]
    ).then(({ rows }) => {
      if (!rows[0]) return;
      const row = rows[0];
      sendQuoteToCustomer(
        { ticket_number: row.ticket_number, car_make: row.car_make, car_model: row.car_model, car_year: row.car_year, part_name: row.part_name, part_category: '' },
        row.email,
        row.full_name,
        { price: replyResult.rows[0].price, notes: replyResult.rows[0].notes, image_url: replyResult.rows[0].image_url, company_name: row.company_name }
      ).catch((err) => console.error('Quote email error:', err));

      if (row.phone) {
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        sendQuoteSMS(row.phone, {
          companyName: row.company_name,
          partName: row.part_name,
          price: replyResult.rows[0].price,
          ticketNumber: row.ticket_number,
          date,
        }).catch((err) => console.error('Quote SMS error:', err));
      }
    }).catch((err) => console.error('Quote email lookup error:', err));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Failed to submit reply' });
  } finally {
    client.release();
  }
}

export async function getMyReplies(req: AuthRequest, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT sr.*, t.ticket_number, t.car_make, t.car_model, t.part_name, t.status AS ticket_status
     FROM supplier_replies sr
     JOIN tickets t ON t.id = sr.ticket_id
     WHERE sr.supplier_id = $1
     ORDER BY sr.created_at DESC`,
    [req.user!.id]
  );
  res.json({ replies: result.rows });
}
