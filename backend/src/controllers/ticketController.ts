import { Request, Response } from 'express';
import { z } from 'zod';
import { createTicket, getActiveSuppliers } from '../services/ticketService';
import { sendTicketToSuppliers, sendTicketConfirmation } from '../services/emailService';
import pool from '../config/db';
import { sendContactFormEmail } from '../services/emailService';

const ticketSchema = z.object({
  car_make: z.string().min(1).max(100),
  car_model: z.string().min(1).max(100),
  car_year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  car_vin: z.string().max(50).optional(),
  part_name: z.string().min(1).max(255),
  part_description: z.string().max(2000).optional(),
  part_category: z.string().min(1).max(100),
  full_name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  location: z.string().min(1).max(255),
});

export async function submitTicket(req: Request, res: Response): Promise<void> {
  const parsed = ticketSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const { ticketId, ticketNumber } = await createTicket(parsed.data);

    const ticketRow = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );
    const ticket = ticketRow.rows[0];

    const suppliers = await getActiveSuppliers();

    await Promise.allSettled([
      sendTicketToSuppliers(ticket, suppliers),
      sendTicketConfirmation(ticket, parsed.data.email, parsed.data.full_name),
    ]);

    res.status(201).json({
      ticket_number: ticketNumber,
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
