import pool from '../config/db';
import { ticketHiddenFromSupplierSql } from './accountService';

interface CreateTicketInput {
  car_make: string;
  car_model: string;
  car_year: number;
  car_vin?: string;
  part_name: string;
  part_description?: string;
  part_category: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  customer_user_id: number;
}

export async function createTicket(data: CreateTicketInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketNumberResult = await client.query<{ generate_ticket_number: string }>(
      'SELECT generate_ticket_number()'
    );
    const ticketNumber = ticketNumberResult.rows[0].generate_ticket_number;

    const ticketResult = await client.query<{ id: number }>(
      `INSERT INTO tickets (ticket_number, car_make, car_model, car_year, car_vin, part_name, part_description, part_category, customer_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        ticketNumber,
        data.car_make,
        data.car_model,
        data.car_year,
        data.car_vin || null,
        data.part_name,
        data.part_description || null,
        data.part_category,
        data.customer_user_id,
      ]
    );
    const ticketId = ticketResult.rows[0].id;

    await client.query(
      `INSERT INTO customers (ticket_id, full_name, email, phone, location)
       VALUES ($1,$2,$3,$4,$5)`,
      [ticketId, data.full_name, data.email, data.phone, data.location]
    );

    await client.query('COMMIT');

    return { ticketId, ticketNumber };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Active suppliers who may receive this ticket (excludes the requester's own supplier account). */
export async function getActiveSuppliers(ticketId: number) {
  const result = await pool.query<{ email: string; company_name: string | null }>(
    `SELECT s.email, s.company_name
     FROM users s
     JOIN tickets t ON t.id = $1
     WHERE s.role = 'supplier' AND s.is_active = true
       AND NOT ${ticketHiddenFromSupplierSql('s', 't')}`,
    [ticketId]
  );
  return result.rows;
}
