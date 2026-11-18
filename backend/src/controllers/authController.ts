import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../config/db';
import { AuthRequest, AuthUser } from '../types';
import { passwordUsedByOtherAccount, PASSWORD_REUSE_MESSAGE } from '../services/accountService';
import { sendSupplierApplicationToAdmin } from '../services/emailService';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueToken(user: AuthUser): string {
  return jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  // The same email can own a customer AND a supplier account (with different passwords).
  // The password decides which account is opened.
  const result = await pool.query(
    `SELECT id, email, password_hash, role, company_name, is_active, approval_status
     FROM users WHERE LOWER(email) = LOWER($1)
     ORDER BY id`,
    [email]
  );

  let user = null;
  for (const row of result.rows) {
    if (!(await bcrypt.compare(password, row.password_hash))) continue;
    if (row.is_active) {
      user = row;
      break;
    }
    // Correct password but the supplier application isn't approved (yet)
    if (row.role === 'supplier' && row.approval_status === 'pending') {
      res.status(403).json({ error: 'Your supplier account is waiting for admin approval. We will email you once it is approved.' });
      return;
    }
    if (row.role === 'supplier' && row.approval_status === 'rejected') {
      res.status(403).json({ error: 'Your supplier application was not approved. Please contact us for details.' });
      return;
    }
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const payload: AuthUser = { id: user.id, email: user.email, role: user.role, company_name: user.company_name };
  res.json({ token: issueToken(payload), user: payload });
}

const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

export async function registerCustomer(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    res.status(400).json({ error: first || 'Invalid input' });
    return;
  }
  const { email, phone, password } = parsed.data;

  const existing = await pool.query(
    `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) AND role = 'customer'`,
    [email]
  );
  if (existing.rows[0]) {
    res.status(409).json({ error: 'A customer account with this email already exists. Please log in.' });
    return;
  }

  if (await passwordUsedByOtherAccount(email, 'customer', password)) {
    res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, phone)
       VALUES ($1, $2, 'customer', $3)
       RETURNING id, email, role, company_name`,
      [email, hash, phone]
    );
    const payload: AuthUser = result.rows[0];
    res.status(201).json({ token: issueToken(payload), user: payload });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'A customer account with this email already exists. Please log in.' });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
}

const supplierRegisterSchema = z.object({
  company_name: z.string().trim().min(2, 'Enter your company name').max(255),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(50),
  address: z.string().trim().min(3, 'Enter your business address').max(500),
  business_details: z.string().trim().max(2000).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

/** POST /api/auth/register-supplier — a supplier applies; the account stays locked until an admin approves it. */
export async function registerSupplier(req: Request, res: Response): Promise<void> {
  const parsed = supplierRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    res.status(400).json({ error: first || 'Invalid input' });
    return;
  }
  const d = parsed.data;

  const existing = await pool.query(
    `SELECT id, approval_status FROM users WHERE LOWER(email) = LOWER($1) AND role = 'supplier'`,
    [d.email]
  );
  const prev = existing.rows[0];
  if (prev && prev.approval_status === 'approved') {
    res.status(409).json({ error: 'A supplier account with this email already exists. Please log in.' });
    return;
  }
  if (prev && prev.approval_status === 'pending') {
    res.status(409).json({ error: 'An application with this email is already waiting for approval.' });
    return;
  }

  if (await passwordUsedByOtherAccount(d.email, 'supplier', d.password)) {
    res.status(400).json({ error: PASSWORD_REUSE_MESSAGE });
    return;
  }

  const hash = await bcrypt.hash(d.password, 12);
  try {
    if (prev) {
      // Previously rejected — re-apply with the new details
      await pool.query(
        `UPDATE users SET password_hash = $1, company_name = $2, phone = $3, address = $4, business_details = $5,
                is_active = false, approval_status = 'pending', reviewed_at = NULL, rejection_reason = NULL,
                created_at = NOW()
         WHERE id = $6`,
        [hash, d.company_name, d.phone, d.address, d.business_details || null, prev.id]
      );
    } else {
      await pool.query(
        `INSERT INTO users (email, password_hash, role, company_name, phone, address, business_details, is_active, approval_status)
         VALUES ($1, $2, 'supplier', $3, $4, $5, $6, false, 'pending')`,
        [d.email, hash, d.company_name, d.phone, d.address, d.business_details || null]
      );
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'A supplier account with this email already exists.' });
    } else {
      console.error('Supplier register error:', err);
      res.status(500).json({ error: 'Failed to send your application' });
    }
    return;
  }

  res.status(201).json({ message: 'Application sent. We will email you once an admin approves your account.' });
  sendSupplierApplicationToAdmin({
    company_name: d.company_name,
    email: d.email,
    phone: d.phone,
    address: d.address,
    business_details: d.business_details || '',
  }).catch((err) => console.error('Supplier application email error:', err));
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  res.json(req.user);
}
