import bcrypt from 'bcryptjs';
import pool from '../config/db';
import type { Role } from '../types';

/**
 * One email address may own several accounts with different roles
 * (e.g. a customer account and a supplier account). They must use different
 * passwords, so the password alone decides which account a login opens.
 *
 * Returns true when `password` is already used by another account (other role)
 * registered with the same email.
 */
export async function passwordUsedByOtherAccount(
  email: string,
  role: Role,
  password: string
): Promise<boolean> {
  const others = await pool.query<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE LOWER(email) = LOWER($1) AND role <> $2',
    [email, role]
  );
  for (const row of others.rows) {
    if (await bcrypt.compare(password, row.password_hash)) return true;
  }
  return false;
}

export const PASSWORD_REUSE_MESSAGE =
  'This email already has another account with this password. Please use a different password for this account.';

/** Last 9 digits of a phone number column, for matching numbers written in different formats. */
const phoneKey = (col: string) => `RIGHT(REGEXP_REPLACE(COALESCE(${col}, ''), '\\D', '', 'g'), 9)`;

/**
 * SQL condition that is TRUE when the supplier (users alias `s`) must NOT see ticket (alias `t`)
 * because the ticket was raised by the same person — matched on the customer account's email/phone
 * or on the contact email/phone given on the request.
 *
 * Keeps customer and supplier accounts of the same person anonymous from each other.
 */
export function ticketHiddenFromSupplierSql(s: string, t: string): string {
  return `EXISTS (
    SELECT 1
    FROM customers hc
    LEFT JOIN users hcu ON hcu.id = ${t}.customer_user_id
    WHERE hc.ticket_id = ${t}.id
      AND (
        LOWER(hc.email) = LOWER(${s}.email)
        OR LOWER(COALESCE(hcu.email, '')) = LOWER(${s}.email)
        OR (
          LENGTH(REGEXP_REPLACE(COALESCE(${s}.phone, ''), '\\D', '', 'g')) >= 7
          AND (${phoneKey('hc.phone')} = ${phoneKey(`${s}.phone`)}
               OR ${phoneKey('hcu.phone')} = ${phoneKey(`${s}.phone`)})
        )
      )
  )`;
}
