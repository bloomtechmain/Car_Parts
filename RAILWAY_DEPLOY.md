# Railway Deployment Guide — CarParts Finder

## Overview

Two Railway services + one PostgreSQL plugin + one Volume:

```
Railway Project
├── backend   (Node.js API — handles uploads, serves /uploads as static files)
│   └── Volume mounted at /uploads  (persistent image storage)
├── frontend  (React SPA — port auto-assigned)
└── Postgres  (Railway plugin — DATABASE_URL auto-injected into backend)
```

External services you manage:
- **Resend** — transactional email

---

## Prerequisites

- [Railway account](https://railway.app) (free tier works)
- Railway CLI installed: `npm install -g @railway/cli`
- Resend account with API key

---

## Step 1 — Create the Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Empty project**
3. Name it `carparts-finder`

---

## Step 2 — Add the PostgreSQL Plugin

1. Inside your project, click **+ New** → **Database** → **PostgreSQL**
2. Railway creates the database and auto-sets `DATABASE_URL`
3. This variable will be linked to the backend service in the next step

---

## Step 3 — Deploy the Backend

### 3a. Create the backend service

1. Click **+ New** → **GitHub Repo** → connect your repo
2. Select the repository
3. Set **Root Directory** to:
   ```
   backend
   ```
4. Railway detects Node.js via nixpacks and uses `railway.toml` automatically

### 3b. Link PostgreSQL to the backend

1. Open the backend service → **Variables** tab
2. Click **+ Add Variable Reference** → select `Postgres` → `DATABASE_URL`

### 3c. Set backend environment variables

In the backend service **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | Your verified sender (e.g. `noreply@yourdomain.com`) |
| `FROM_NAME` | `CarParts Finder` |
| `ADMIN_EMAIL` | Your admin email address |
| `FRONTEND_URL` | *(leave blank for now — fill after frontend deploys)* |
| `BACKEND_URL` | Your backend Railway URL (e.g. `https://carparts-backend.up.railway.app`) |
| `UPLOAD_DIR` | `/uploads` *(must match the Volume mount path below)* |

### 3d. Add a Railway Volume for image uploads

Railway Volumes are persistent disks that survive redeploys.

1. Open the backend service → **Volumes** tab
2. Click **+ Add Volume**
3. Set **Mount Path** to `/uploads`
4. Click **Add**

> Uploaded images are stored at `/uploads/replies/<uuid>.jpg` and served publicly at `https://your-backend.up.railway.app/uploads/replies/<uuid>.jpg`

### 3e. Deploy the backend

Click **Deploy** and watch the build logs:
```
✓ npm install
✓ npm run build   (compiles TypeScript → dist/)
✓ node dist/server.js
✓ GET /api/health → 200 OK
```

Copy the backend's public URL — you'll need it for the frontend and for `BACKEND_URL`.

---

## Step 4 — Run the Database Migration

The migration SQL is at `backend/src/migrations/001_init.sql`. Run it once.

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

> **Default admin credentials** (change immediately after first login):
> - Email: `admin@carpartsfinder.com`
> - Password: `AdminPass123!`

---

## Step 5 — Deploy the Frontend

### 5a. Create the frontend service

1. Click **+ New** → **GitHub Repo** → same repository
2. Set **Root Directory** to:
   ```
   frontend
   ```

### 5b. Set frontend environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your backend Railway URL (e.g. `https://carparts-backend.up.railway.app`) |

> `VITE_API_URL` is baked into the JS bundle at build time — set it **before** deploying.

### 5c. Deploy

Railway runs:
```
npm install
npm run build    (Vite bundles React → dist/)
serve -s dist    (serves SPA with client-side routing fallback)
```

Copy the frontend's public URL.

---

## Step 6 — Connect Frontend URL to Backend

1. Go back to the **backend** service → **Variables**
2. Set `FRONTEND_URL` to your frontend Railway URL (no trailing slash)
3. Railway redeploys the backend automatically

---

## Step 7 — Verify Everything Works

```bash
# Backend health
curl https://your-backend.up.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
open https://your-frontend.up.railway.app
```

Full flow to test:
- [ ] Log in as admin (`admin@carpartsfinder.com` / `AdminPass123!`)
- [ ] Change admin password immediately
- [ ] Create a supplier account via admin panel
- [ ] Submit a ticket as a customer — confirm emails arrive
- [ ] Log in as supplier, reply to a ticket with an image attachment
- [ ] Confirm image displays in the ticket reply (served from `/uploads/`)

---

## Production Checklist

- [ ] **Change default admin password** — first thing after deploy
- [ ] **Strong `JWT_SECRET`** — at least 32 random characters, never reuse from dev
- [ ] **Verified Resend domain** — remove `DEV_EMAIL_OVERRIDE` from backend vars so emails reach real recipients
- [ ] **`BACKEND_URL` is correct** — must match your actual Railway backend URL exactly (no trailing slash)
- [ ] **Volume is mounted** — check backend service → Volumes tab shows `/uploads`
- [ ] **`UPLOAD_DIR=/uploads`** — must match the Volume mount path

---

## Environment Variables Quick Reference

### Backend service

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
BACKEND_URL=https://your-backend.up.railway.app
UPLOAD_DIR=/uploads
```

### Frontend service

```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## How Image Storage Works

```
Supplier uploads image
       ↓
Multer buffers file in memory
       ↓
uploadFile() writes buffer to /uploads/replies/<uuid>.jpg
       ↓
URL stored in DB: https://your-backend.up.railway.app/uploads/replies/<uuid>.jpg
       ↓
Express serves /uploads as static files → image loads in browser
       ↓
Railway Volume persists /uploads across redeploys
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Backend crashes on start | Missing env var | Check Railway logs; verify all vars are set |
| CORS errors in browser | `FRONTEND_URL` wrong | Set it to the exact Railway frontend URL (no trailing slash) |
| Login returns 500 | Migration not run | Run `001_init.sql` against the Railway database |
| Emails not sending | `FROM_EMAIL` domain not verified | Verify domain in Resend dashboard |
| Image upload fails | `UPLOAD_DIR` not set or Volume not mounted | Check Volume is attached at `/uploads`; verify `UPLOAD_DIR=/uploads` |
| Images return 404 | `BACKEND_URL` wrong | Set `BACKEND_URL` to the exact backend Railway URL |
| Frontend shows blank page | `VITE_API_URL` wrong/missing | Set the var and redeploy the frontend |
