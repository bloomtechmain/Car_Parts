import pool from '../config/db';
import {
  sendOrderConfirmationToCustomer,
  sendSupplierOrderNotification,
  sendAdminSelectionNotification,
} from './emailService';
import { sendOrderConfirmationSMS } from './smsService';

export interface OfferedOption {
  id: number;
  admin_price: number;
  delivery_days: number;
  supplier_email: string;
  company_name: string | null;
}

/**
 * The options the customer was offered, in display order (Option 1, 2, …).
 * Replies explicitly sent to the customer; for older tickets (before that flag existed)
 * every reply with an admin price.
 */
export async function getOfferedOptions(ticketId: number): Promise<OfferedOption[]> {
  const result = await pool.query(
    `SELECT sr.id, sr.admin_price, sr.delivery_days, sr.sent_to_customer,
            u.email AS supplier_email, u.company_name
     FROM supplier_replies sr
     JOIN users u ON u.id = sr.supplier_id
     WHERE sr.ticket_id = $1 AND sr.admin_price IS NOT NULL
     ORDER BY sr.created_at ASC`,
    [ticketId]
  );
  const sent = result.rows.filter((r) => r.sent_to_customer);
  const rows = sent.length ? sent : result.rows;
  return rows.map((r) => ({
    id: r.id,
    admin_price: Number(r.admin_price),
    delivery_days: Number(r.delivery_days),
    supplier_email: r.supplier_email,
    company_name: r.company_name,
  }));
}

export type SelectionResult =
  | { ok: true; option_number: number }
  | { ok: false; status: number; error: string; already_selected?: boolean };

/**
 * Customer picks one offered option: closes the ticket, records the selection and
 * sends the usual notifications (customer email + SMS, supplier email, admin email).
 * Used by both the email link (token) flow and the customer portal.
 */
export async function finalizeSelection(ticketId: number, replyId: number): Promise<SelectionResult> {
  const ticketResult = await pool.query(
    `SELECT t.*, c.full_name, c.email AS customer_email, c.phone AS customer_phone
     FROM tickets t
     JOIN customers c ON c.ticket_id = t.id
     WHERE t.id = $1`,
    [ticketId]
  );
  const ticket = ticketResult.rows[0];
  if (!ticket) return { ok: false, status: 404, error: 'Ticket not found' };
  if (ticket.status === 'closed') {
    return { ok: false, status: 410, error: 'This ticket has already been completed', already_selected: true };
  }

  const options = await getOfferedOptions(ticket.id);
  const index = options.findIndex((o) => o.id === replyId);
  if (index === -1) return { ok: false, status: 404, error: 'Option not found for this ticket' };
  const chosen = options[index];
  const optionNumber = index + 1;

  // Only one selection can win, even if two clicks race
  const update = await pool.query(
    `UPDATE tickets SET status = 'closed', options_token = NULL, selected_reply_id = $2
     WHERE id = $1 AND status <> 'closed'`,
    [ticket.id, replyId]
  );
  if (update.rowCount === 0) {
    return { ok: false, status: 410, error: 'This ticket has already been completed', already_selected: true };
  }

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
    admin_price: chosen.admin_price,
    delivery_days: chosen.delivery_days,
    option_number: optionNumber,
  };

  // Notifications run in the background — they never block the customer's confirmation
  Promise.allSettled([
    sendOrderConfirmationToCustomer(ticketData, ticket.customer_email, ticket.full_name, option),
    sendSupplierOrderNotification(chosen.supplier_email, chosen.company_name, ticketData, chosen.delivery_days),
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
      supplierName: chosen.company_name,
      option,
    }),
    ticket.customer_phone
      ? sendOrderConfirmationSMS(ticket.customer_phone, {
          partName: ticket.part_name,
          ticketNumber: ticket.ticket_number,
          adminPrice: chosen.admin_price,
          deliveryDays: chosen.delivery_days,
          optionNumber,
        })
      : Promise.resolve(),
  ]).catch((err) => console.error('Order notification error:', err));

  return { ok: true, option_number: optionNumber };
}
