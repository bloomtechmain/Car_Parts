-- Migration: New Quote Flow
-- All 3 lines below have already been run on the production database.

ALTER TABLE supplier_replies ADD COLUMN IF NOT EXISTS delivery_days INT;
ALTER TABLE supplier_replies ADD COLUMN IF NOT EXISTS admin_price NUMERIC(12,2);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS options_token VARCHAR(64);
