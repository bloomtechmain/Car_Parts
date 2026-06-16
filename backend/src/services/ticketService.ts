import pool from '../config/db';

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
      `INSERT INTO tickets (ticket_number, car_make, car_model, car_year, car_vin, part_name, part_description, part_category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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

export async function getActiveSuppliers() {
  const result = await pool.query<{ email: string; company_name: string | null }>(
    `SELECT email, company_name FROM users WHERE role = 'supplier' AND is_active = true`
  );
  return result.rows;
}
