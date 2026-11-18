import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import supplierRoutes from './routes/supplier';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customer';
import pool from './config/db';

async function runMigrations() {
  const migrations = [
    `ALTER TABLE supplier_replies ADD COLUMN IF NOT EXISTS delivery_days INT`,
    `ALTER TABLE supplier_replies ADD COLUMN IF NOT EXISTS admin_price NUMERIC(12,2)`,
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS options_token VARCHAR(64)`,
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS selected_reply_id INTEGER REFERENCES supplier_replies(id) ON DELETE SET NULL`,
    // ── Customer accounts ──
    // Allow the 'customer' role
    `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`,
    `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'supplier', 'customer'))`,
    // One email may own several accounts of DIFFERENT roles (e.g. a customer and a supplier account)
    `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`,
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_role_key ON users (LOWER(email), role)`,
    // Which customer account raised a ticket
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS customer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_customer_user ON tickets(customer_user_id)`,
    // Which supplier replies were actually offered to the customer
    `ALTER TABLE supplier_replies ADD COLUMN IF NOT EXISTS sent_to_customer BOOLEAN NOT NULL DEFAULT false`,
    // ── Supplier self-registration (admin approval) ──
    // Existing suppliers (created by the admin) are 'approved'; self-registered ones start 'pending'
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS business_details TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
  ];
  for (const sql of migrations) {
    await pool.query(sql);
  }
  console.log('[migrations] All migrations applied');
}

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists on startup
fs.mkdirSync(path.join(UPLOAD_DIR, 'replies'), { recursive: true });

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'blob:', 'data:', 'https:'],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const ticketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketLimiter, ticketRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[migrations] Failed to run migrations:', err.message);
    process.exit(1);
  });

export default app;
