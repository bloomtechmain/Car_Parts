-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (admins and suppliers)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supplier')),
  company_name  VARCHAR(255),
  phone         VARCHAR(50),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets (part requests)
CREATE TABLE IF NOT EXISTS tickets (
  id               SERIAL PRIMARY KEY,
  ticket_number    VARCHAR(20) UNIQUE NOT NULL,
  car_make         VARCHAR(100) NOT NULL,
  car_model        VARCHAR(100) NOT NULL,
  car_year         SMALLINT NOT NULL,
  car_vin          VARCHAR(50),
  part_name        VARCHAR(255) NOT NULL,
  part_description TEXT,
  part_category    VARCHAR(100) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'replied', 'closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers (kept separate from tickets for privacy)
CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  full_name  VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  location   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier replies
CREATE TABLE IF NOT EXISTS supplier_replies (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price       NUMERIC(12, 2),
  notes       TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status    ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created   ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_ticket    ON supplier_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_replies_supplier  ON supplier_replies(supplier_id);
CREATE INDEX IF NOT EXISTS idx_customers_ticket  ON customers(ticket_id);

-- Atomic ticket number generator (prevents race conditions on concurrent inserts)
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
DECLARE
  y   TEXT := TO_CHAR(NOW(), 'YYYY');
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM tickets WHERE ticket_number LIKE 'CPF-' || y || '-%';
  RETURN 'CPF-' || y || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Default admin account (password: AdminPass123! — change after first deploy)
INSERT INTO users (email, password_hash, role, company_name)
VALUES (
  'admin@carpartsfinder.com',
  '$2a$12$olNRlYTxGcm9WS6KWPLui.RHMOXcfE5KPqr5e/3kS7N8XFtgpRqO.',
  'admin',
  'CarParts Finder Admin'
) ON CONFLICT (email) DO NOTHING;
