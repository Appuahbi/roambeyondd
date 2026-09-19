# Roam Beyond — Production Deployment Checklist

Everything needed to go live: **Render** (backend), **Upstash** (Redis),
**Vercel** (frontend), **MongoDB Atlas** (DB), plus the seed run and final
verification. All code is pushed and deploy-ready — this is 100% dashboard +
config work.

---

## 0. Before you start

- Everything is committed & pushed to `main` (single repo, 3 deployable roots —
  set each one to its directory: `Backend`, `Frontend`).
- Secrets stay local (`.env` is git-ignored). The marked ✏️ values are what
  **you** generate on each dashboard.

---

## PART 1 — MongoDB Atlas (already exists? then just grab the URI)

1. Atlas → **Database** → your M0 cluster → **Connect** → **Drivers**.
2. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
3. **Replace `<password>`** with your real password.
4. Append your DB name (use one dedicated to the app, e.g. `roambeyondd`):
   `...mongodb.net/roambeyondd?retryWrites=true&w=majority`
5. Network Access → allow `0.0.0.0/0` (Render + Vercel + your seed machine).
6. Set a DB user with the role **readWrite** on that database.

---

## PART 2 — Upstash Redis (the one thing Render needs at boot)

Render no longer includes Redis, so we use Upstash (free tier is fine):

1. upstash.com → console → **Create database**.
   - Plan: **Free** · Region close to Render.
   - Keep the default (RESP is handled; we connect with `RESP:2`).
2. Copy the **REST URL** (starts `https://...upstash.io`). This is your
   `REDIS_URL`.
3. In the Upstash console you can **Test connection** (sends `SET key value`)

> ⚠️ The backend **fails to start** if Redis is unreachable (it's required at
> boot). Create Upstash **before** the Render service.

---

## PART 3 — Render (Backend web service)

The **Root working directory is `Backend`** — open Render → **New + → Web Service**
→ connect your GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `Backend` |
| Environment | `Node` (runtime `/<your-os>/20`) |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health-check path | `https://<backend>.onrender.com/api` |

### Environment variables (Render → Environment → Add)

Secrets marked ✏️ you generate. The rest you copy.

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `MONGO_URI` | (your Atlas URI with DB name) ✏️ | |
| `JWT_SECRET` | (≥32 random chars) ✏️ | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRE` | `7d` | |
| `BCRYPT_SALT_ROUNDS` | `12` | |
| `REDIS_URL` | (Upstash REST URL) ✏️ | from PART 2 |
| `CORS_ORIGIN` | `https://<frontend>.vercel.app` ✏️ | your Vercel origin |
| `FRONTEND_URL` | `https://<frontend>.vercel.app` ✏️ | same as above |
| `API_URL` | `https://<backend>.onrender.com/api` ✏️ | used in lead alert email links |

**SMTP / email (lead alerts, admin invoice email):**
| Key | Value |
|---|---|
| `SMTP_HOST` | e.g. `smtp.gmail.com` (or your provider) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your SMTP login |
| `SMTP_PASS` | ✏️ app-specific password |
| `SMTP_FROM` | `Roam Beyond <you@yourdomain>` |
| `LEAD_ALERT_EMAIL` | where you want new-lead notifications |

**Storage — Cloudinary (for blog/package images + admin uploads):**
| Key | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | ✏️ |
| `CLOUDINARY_API_KEY` | ✏️ |
| `CLOUDINARY_API_SECRET` | ✏️ |

**Optional (leave blank for graceful fallback):**
| Key | Value / note |
|---|---|
| `TWILIO_*` | blank → OTP logged to console (mock SMS). Add real creds for live SMS. |
| `OPENAI_API_KEY` / `AI_PROVIDER` | blank → AI chat returns clean 503 "not configured" |
| `LOG_LEVEL` | `info` (default) |

---

## PART 4 — Vercel (Frontend)

Open vercel.com → **+ New Project** → import the same GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `Frontend` |
| Framework Preset | Vite |
| Build command | `npm run build` (the `prebuild` regenerates sitemap/robots) |
| Output / Publish dir | `dist` |

### Environment variables (Vercel → Settings → Environment Variables)

| Key | Value | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `https://<backend>.onrender.com/api` ✏️ | axios base — must include `/api` |
| `VITE_SOCKET_URL` | `https://<backend>.onrender.com` ✏️ | **no** `/api`; socket root |
| `VITE_SITE_URL` | `https://<frontend>.vercel.app` ✏️ | used for Seo/canonical |
| `VITE_SOCKET_URL_db`?… | — | |
| `API_URL` | `https://<backend>.onrender.com/api` ✏️ | build-time (sitemap from live API) |
| `SITE_URL` | `https://<frontend>.vercel.app` ✏️ | build-time |

Ensure `withCredentials` + cookies work cross-site: backend sends the auth
cookie with `SameSite=None; Secure` in production (already implemented in
`authCookie.js`). Login happens on Vercel → requests hit Render API → cookie is
stored on the Render origin and sent back — everything credential-aware.

---

## PART 5 — Seed the prod database

From a machine with `.env` (or use Render Shell) pointing at Atlas, run once:

```bash
cd Backend
node seedAdmin.js        # creates admin account (ADMIN_EMAIL/PASSWORD env)
node seedCategories.js   # categories for packages/blogs
node seedPackages.js     # sample tour packages (fast, safe)
```

> The `seedXx` scripts never duplicate — safe to re-run.

---

## PART 6 — Verify

- [ ] Site loads on your Vercel URL (no console errors)
- [ ] Images render (Cloudinary / Unsplash fallback)
- [ ] Login works on the **Vercel domain** (cookie auth)
- [ ] Admin panel / dashboard reachable
- [ ] Realtime (chat / notifications / socket) connects — check Network tab for
      `ws://…` frames without errors
- [ ] Enquiry + contact forms submit; lead alert email arrives
- [ ] Search works; package/blog detail pages open; sitemap at
      `https://<frontend>.vercel.app/sitemap.xml`

---

## Notes / gotchas

- Render **free tier sleeps** after ~15 min idle → first request after a gap
  can take 30–60s to wake (cold start). Normal.
- Because frontend and backend are **different domains**, the auth cookie is
  `SameSite=None` + Secure in production (already coded). If they're ever on
  the **same** domain (custom domain + subdomain), you can relax it back to
  `Lax`.
- Twilio/AI not configured → graceful fallbacks (mock SMS / 503), not outages.
