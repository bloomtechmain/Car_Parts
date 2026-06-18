-- Migration: Store customer's selected reply
-- Run this on the database before deploying the updated backend.

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS selected_reply_id INTEGER REFERENCES supplier_replies(id) ON DELETE SET NULL;
