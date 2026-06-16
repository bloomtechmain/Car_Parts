# Railway Deployment Guide — CarParts Finder

## Architecture

Single service deployment — one Railway service runs everything:

```
Railway Project
├── Car_Parts   (GitHub repo — builds frontend + backend, serves both)
│   └── Volume mounted at /uploads  (persistent image storage)
└── Postgres    (Railway plugin — DATABASE_URL auto-injected)
```

One URL serves both the React frontend and the Express API.

---

## Current Setup (from your Railway dashboard)

You already have:
- ✅ **Postgres** service — Online
- ✅ **Car_Parts** service — Online

Follow the steps below to configure it correctly.

---

## Step 1 — Set Root Directory

1. Click the **Car_Parts** service
2. Go to **Settings** tab
3. Under **Build** → find **Root Directory**
4. Leave it **empty** (repo root) — Railway will use the `railway.toml` at the repo root

---

## Step 2 — Link PostgreSQL to Car_Parts

1. Click the **Car_Parts** service → **Variables** tab
2. Click **+ Add Variable Reference**
3. Select **Postgres** → **DATABASE_URL**
4. This injects the database connection string automatically

---

## Step 3 — Set Environment Variables

In the **Car_Parts** service → **Variables** tab, add all of the following:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | Your verified sender (e.g. `noreply@yourdomain.com`) |
| `FROM_NAME` | `CarParts Finder` |
| `ADMIN_EMAIL` | Your admin email address |
| `UPLOAD_DIR` | `/uploads` |
| `FRONTEND_URL` | Your Railway service URL (get it from Step 4 below) |
| `BACKEND_URL` | Same as FRONTEND_URL (it's the same service) |

> **Note:** Do NOT set `VITE_API_URL` — leaving it unset makes the frontend call the same origin automatically.

---

## Step 4 — Generate the Service URL

1. Click the **Car_Parts** service → **Settings** tab
2. Scroll to **Networking** → **Public Networking**
3. Click **Generate Domain**
4. Copy the URL (e.g. `https://car-parts-production-xxxx.up.railway.app`)
5. Go back to **Variables** and set both `FRONTEND_URL` and `BACKEND_URL` to this URL

---

## Step 5 — Add a Volume for Image Uploads

1. Click the **Car_Parts** service → **Volumes** tab
2. Click **+ Add Volume**
3. Set **Mount Path** to `/uploads`
4. Click **Add**

Uploaded images will be stored at `/uploads/replies/<filename>` and served at `https://your-url.up.railway.app/uploads/replies/<filename>`.

---

## Step 6 — Run the Database Migration

### Option A — Railway Dashboard (easiest)

1. Click the **Postgres** service → **Data** tab → **Query**
2. Run **Query 1** (paste and click Run):

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  full_name  VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  location   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_replies (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price       NUMERIC(12, 2),
  notes       TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created  ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_ticket   ON supplier_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_replies_supplier ON supplier_replies(supplier_id);
CREATE INDEX IF NOT EXISTS idx_customers_ticket ON customers(ticket_id);

INSERT INTO users (email, password_hash, role, company_name)
VALUES (
  'admin@carpartsfinder.com',
  '$2a$12$olNRlYTxGcm9WS6KWPLui.RHMOXcfE5KPqr5e/3kS7N8XFtgpRqO.',
  'admin',
  'CarParts Finder Admin'
) ON CONFLICT (email) DO NOTHING;
```

3. After that succeeds, run **Query 2** in a new query:

```sql
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
BEGIN
  RETURN 'CPF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_seq')::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

> **Default admin credentials** (change immediately after first login):
> - Email: `admin@carpartsfinder.com`
> - Password: `AdminPass123!`

---

## Step 7 — Deploy

1. Go back to the **Car_Parts** service
2. Click **Deploy** (or push a new commit to trigger auto-deploy)
3. Watch the build logs — it should show:
   ```
   npm install (frontend)
   npm run build (frontend → dist/)
   npm install (backend)
   npm run build (backend → dist/)
   node backend/dist/server.js
   GET /api/health → 200 OK
   ```
4. Open your service URL in the browser — you should see the CarParts Finder homepage

---

## Step 8 — Verify

```
https://your-url.up.railway.app          → Frontend (React app)
https://your-url.up.railway.app/api/health → {"status":"ok"}
```

Test the full flow:
- [ ] Open the service URL — homepage loads
- [ ] Go to `/dashboard/login` — login page loads
- [ ] Log in as `admin@carpartsfinder.com` / `AdminPass123!`
- [ ] Change admin password immediately
- [ ] Create a supplier account
- [ ] Submit a ticket as a customer — emails arrive
- [ ] Log in as supplier and reply with an image

---

## Production Checklist

- [ ] **Change default admin password** — do this first
- [ ] **Strong `JWT_SECRET`** — 32+ random characters
- [ ] **Verified Resend domain** — remove `DEV_EMAIL_OVERRIDE` var so emails reach real recipients
- [ ] **Volume mounted** — Car_Parts service → Volumes tab shows `/uploads`
- [ ] **`FRONTEND_URL` and `BACKEND_URL` set** — to your Railway service URL

---

## Environment Variables Reference

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<32+ random chars>
JWT_EXPIRES_IN=7d
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=CarParts Finder
ADMIN_EMAIL=you@yourdomain.com
FRONTEND_URL=https://your-url.up.railway.app
BACKEND_URL=https://your-url.up.railway.app
UPLOAD_DIR=/uploads
```

> Do NOT set `VITE_API_URL` in Railway. Leaving it unset makes API calls use the same origin.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails — "directory does not exist" | Make sure Root Directory in Settings is empty (not `backend` or `Car Parts eCommerce/backend`) |
| Frontend loads but API calls fail | Check `NODE_ENV=production` is set; check `FRONTEND_URL` matches the service URL |
| Login returns 500 | Run the migration SQL in Postgres → Data → Query |
| Image uploads fail | Check Volume is mounted at `/uploads`; check `UPLOAD_DIR=/uploads` |
| Blank white page | Open browser DevTools → check console for errors; likely missing env var |
| Emails not sending | Verify domain in Resend dashboard; check `FROM_EMAIL` is from a verified domain |
