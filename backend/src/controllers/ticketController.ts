import { Request, Response } from 'express';
import { z } from 'zod';
import { createTicket, getActiveSuppliers } from '../services/ticketService';
import {
  sendTicketToSuppliers,
  sendTicketConfirmation,
  sendContactFormEmail,
  sendOrderConfirmationToCustomer,
  sendSupplierOrderNotification,
  sendAdminSelectionNotification,
} from '../services/emailService';
import { sendOrderConfirmationSMS } from '../services/smsService';
import pool from '../config/db';

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
    res.status(410).json({ error: 'This ticket has already been completed', already_selected: true });
    return;
  }

  const repliesResult = await pool.query(
    `SELECT id, admin_price, delivery_days FROM supplier_replies
     WHERE ticket_id = $1 AND admin_price IS NOT NULL
     ORDER BY created_at ASC`,
    [ticket.id]
  );

  const replyRow = repliesResult.rows.find((r) => String(r.id) === String(reply));
  if (!replyRow) {
    res.status(404).json({ error: 'Option not found' });
    return;
  }

  const optionNumber = repliesResult.rows.findIndex((r) => String(r.id) === String(reply)) + 1;

  res.json({
    ticket_number: ticket.ticket_number,
    car_make: ticket.car_make,
    car_model: ticket.car_model,
    car_year: ticket.car_year,
    part_name: ticket.part_name,
    part_category: ticket.part_category,
    option: {
      reply_id: replyRow.id,
      admin_price: Number(replyRow.admin_price),
      delivery_days: Number(replyRow.delivery_days),
      option_number: optionNumber,
    },
  });
}

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
    `SELECT t.*, c.full_name, c.email AS customer_email, c.phone AS customer_phone
     FROM tickets t
     JOIN customers c ON c.ticket_id = t.id
     WHERE t.options_token = $1`,
    [parsed.data.token]
  );

  if (!ticketResult.rows[0]) {
    res.status(404).json({ error: 'Invalid or expired selection link' });
    return;
  }

  const ticket = ticketResult.rows[0];

  if (ticket.status === 'closed') {
    res.status(410).json({ error: 'This ticket has already been completed', already_selected: true });
    return;
  }

  const repliesResult = await pool.query(
    `SELECT sr.id, sr.admin_price, sr.delivery_days,
            u.email AS supplier_email, u.company_name
     FROM supplier_replies sr
     JOIN users u ON u.id = sr.supplier_id
     WHERE sr.ticket_id = $1 AND sr.admin_price IS NOT NULL
     ORDER BY sr.created_at ASC`,
    [ticket.id]
  );

  const replyRow = repliesResult.rows.find((r) => r.id === parsed.data.reply_id);
  if (!replyRow) {
    res.status(404).json({ error: 'Option not found for this ticket' });
    return;
  }

  const optionNumber = repliesResult.rows.findIndex((r) => r.id === parsed.data.reply_id) + 1;

  await pool.query(
    `UPDATE tickets SET status = 'closed', options_token = NULL, selected_reply_id = $2 WHERE id = $1`,
    [ticket.id, parsed.data.reply_id]
  );

  res.json({ message: 'Order confirmed successfully', option_number: optionNumber });

  const ticketData = {
    ticket_number: ticket.ticket_number,
    car_make: ticket.car_make,
    car_model: ticket.car_model,
    car_year: ticket.car_year,
    part_name: ticket.part_name,
    part_category: ticket.part_category,
    part_description: ticket.part_description,
    car_vin: ticket.car_vin,
  };

  const option = {
    admin_price: Number(replyRow.admin_price),
    delivery_days: Number(replyRow.delivery_days),
    option_number: optionNumber,
  };

  Promise.allSettled([
    sendOrderConfirmationToCustomer(ticketData, ticket.customer_email, ticket.full_name, option),
    sendSupplierOrderNotification(replyRow.supplier_email, replyRow.company_name, ticketData, replyRow.delivery_days),
    sendAdminSelectionNotification({
      customerName: ticket.full_name,
      customerEmail: ticket.customer_email,
      customerPhone: ticket.customer_phone || '',
      ticketNumber: ticket.ticket_number,
      ticketId: ticket.id,
      carMake: ticket.car_make,
      carModel: ticket.car_model,
      carYear: ticket.car_year,
      partName: ticket.part_name,
      partCategory: ticket.part_category,
      supplierName: replyRow.company_name,
      option,
    }),
    ticket.customer_phone
      ? sendOrderConfirmationSMS(ticket.customer_phone, {
          partName: ticket.part_name,
          ticketNumber: ticket.ticket_number,
          adminPrice: Number(replyRow.admin_price),
          deliveryDays: Number(replyRow.delivery_days),
          optionNumber,
        })
      : Promise.resolve(),
  ]).catch((err) => console.error('Order notification error:', err));
}
