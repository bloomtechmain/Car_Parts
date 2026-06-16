# Railway Deployment Guide — CarParts Finder

## Overview

Two Railway services + one PostgreSQL plugin:

```
Railway Project
├── backend   (Node.js API — port auto-assigned)
├── frontend  (React SPA — port auto-assigned)
└── Postgres  (Railway plugin — DATABASE_URL auto-injected into backend)
```

External services you manage:
- **Cloudflare R2** — image uploads (supplier reply attachments)
- **Resend** — transactional email

---

## Prerequisites

- [Railway account](https://railway.app) (free tier works)
- Railway CLI installed: `npm install -g @railway/cli`
- Cloudflare R2 bucket created (or use placeholder values to skip image uploads)
- Resend account with API key

---

## Step 1 — Create the Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Empty project**
3. Name it `carparts-finder` (or anything you like)

---

## Step 2 — Add the PostgreSQL Plugin

1. Inside your project, click **+ New** → **Database** → **PostgreSQL**
2. Railway creates the database and sets `DATABASE_URL` automatically
3. Note the plugin name (default: `Postgres`) — you'll reference it when linking to the backend

---

## Step 3 — Deploy the Backend

### 3a. Create the backend service

1. Click **+ New** → **GitHub Repo** (connect your repo if not done yet)
2. Select your repository
3. When prompted for **Root Directory**, set it to:
   ```
   Car Parts eCommerce/backend
   ```
4. Railway detects Node.js via nixpacks and uses `railway.toml` automatically

### 3b. Link PostgreSQL to the backend

1. Open the backend service → **Variables** tab
2. Click **+ Add Variable Reference**
3. Select `Postgres` → `DATABASE_URL`
   - This injects `${{Postgres.DATABASE_URL}}` — Railway resolves it at runtime

### 3c. Set backend environment variables

In the backend service **Variables** tab, add all of the following:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | Your verified sender (e.g. `noreply@yourdomain.com`) |
| `FROM_NAME` | `CarParts Finder` |
| `ADMIN_EMAIL` | Your admin email address |
| `FRONTEND_URL` | *(leave blank for now — fill in after frontend deploys)* |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | `carparts-uploads` (or your bucket name) |
| `R2_PUBLIC_URL` | Your R2 public bucket URL (e.g. `https://pub-xxx.r2.dev`) |

> **Skipping R2 for now?** Use `placeholder` for all R2 values. Image uploads will return a 500 error but everything else works fine.

### 3d. Trigger a deploy

Click **Deploy** in the Railway dashboard. Watch the build logs:
```
✓ npm install
✓ npm run build   (compiles TypeScript → dist/)
✓ node dist/server.js
✓ GET /api/health → 200 OK
```

Copy the backend's public URL (e.g. `https://carparts-backend.up.railway.app`). You'll need it for the frontend.

---

## Step 4 — Run the Database Migration

The migration SQL is at `backend/src/migrations/001_init.sql`. Run it once against your Railway database.

### Option A — Railway CLI (recommended)

```bash
railway login
railway link          # select your project
railway run psql $DATABASE_URL -f src/migrations/001_init.sql
```

### Option B — Railway dashboard query runner

1. Open the **Postgres** plugin → **Data** tab → **Query**
2. Paste the contents of `backend/src/migrations/001_init.sql`
3. Click **Run**

This creates the `users`, `tickets`, `customers`, and `supplier_replies` tables and inserts the default admin account.

> **Default admin credentials** (change immediately after first login):
> - Email: `admin@carpartsfinder.com`
> - Password: `AdminPass123!`

---

## Step 5 — Deploy the Frontend

### 5a. Create the frontend service

1. Click **+ New** → **GitHub Repo** → same repository
2. Set **Root Directory** to:
   ```
   Car Parts eCommerce/frontend
   ```

### 5b. Set frontend environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your backend Railway URL (e.g. `https://carparts-backend.up.railway.app`) |

> `VITE_API_URL` is a **build-time** variable — it gets baked into the JS bundle. Set it **before** the first deploy, or redeploy after setting it.

### 5c. Deploy

Railway runs:
```
npm install
npm run build    (Vite bundles React → dist/)
serve -s dist    (serves SPA with client-side routing fallback)
```

Copy the frontend's public URL (e.g. `https://carparts-frontend.up.railway.app`).

---

## Step 6 — Connect Frontend URL to Backend

1. Go back to the **backend** service → **Variables**
2. Set `FRONTEND_URL` to your frontend Railway URL
3. Railway redeploys the backend automatically (CORS now allows the frontend origin)

---

## Step 7 — Verify Everything Works

```bash
# Backend health
curl https://your-backend.up.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
open https://your-frontend.up.railway.app
# Should load the CarParts Finder UI
```

Then test the full flow:
- [ ] Log in as admin (`admin@carpartsfinder.com` / `AdminPass123!`)
- [ ] Change admin password immediately
- [ ] Create a supplier account via admin panel
- [ ] Submit a ticket as a customer — confirm emails arrive
- [ ] Log in as supplier and reply to a ticket

---

## Production Checklist

- [ ] **Change default admin password** — first thing after deploy
- [ ] **Strong JWT_SECRET** — at least 32 random characters, never reuse from dev
- [ ] **Verified Resend domain** — remove `DEV_EMAIL_OVERRIDE` from backend vars so real emails reach real recipients
- [ ] **R2 bucket CORS** — add your frontend Railway URL to the R2 bucket's CORS policy if images load from R2 directly
- [ ] **Railway custom domains** — optionally map `api.yourdomain.com` → backend, `yourdomain.com` → frontend in Railway settings

---

## Environment Variables Quick Reference

### Backend service (complete list)

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<32+ random chars>
JWT_EXPIRES_IN=7d
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=CarParts Finder
ADMIN_EMAIL=you@yourdomain.com
FRONTEND_URL=https://your-frontend.up.railway.app
R2_ACCOUNT_ID=<cloudflare account id>
R2_ACCESS_KEY_ID=<r2 access key>
R2_SECRET_ACCESS_KEY=<r2 secret key>
R2_BUCKET_NAME=carparts-uploads
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
```

### Frontend service

```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Backend crashes on start | Missing env var | Check Railway logs for `undefined` errors; verify all vars are set |
| `CORS` errors in browser | `FRONTEND_URL` wrong | Set it to the exact Railway frontend URL (no trailing slash) |
| Login returns 500 | Migration not run | Run `001_init.sql` against the Railway database |
| Emails not sending | `FROM_EMAIL` domain not verified | Verify domain in Resend dashboard or keep `DEV_EMAIL_OVERRIDE` set |
| Image upload fails | R2 credentials wrong | Check R2 account ID and keys; or use placeholder values to skip |
| Frontend shows blank page | `VITE_API_URL` wrong/missing | Set the var and redeploy the frontend |
