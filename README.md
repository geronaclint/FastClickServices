# SureServe

Full-stack service marketplace — React + Vite frontend, Express + PostgreSQL backend.

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend  | Express.js (Node.js)                    |
| Database | PostgreSQL (Supabase)                   |
| Auth     | JWT (bcryptjs + jsonwebtoken)           |

## Project Structure

```
├── index.html              # Vite entry HTML
├── vite.config.js          # Vite config
├── vercel.json             # Vercel SPA rewrites (frontend)
├── package.json            # Frontend dependencies
├── src/                    # React app
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/         # Shared UI components
│   ├── pages/              # Route pages (buyer/seller)
│   ├── services/           # API service layer
│   └── utils/              # Helpers
└── backend/
    ├── server.js           # Express entry point
    ├── db.js               # PostgreSQL connection pool
    ├── init.sql            # Database schema
    ├── initDB.js           # Schema migration runner
    ├── controllers/        # Route handlers
    ├── routes/             # Express route definitions
    └── middleware/          # Auth middleware (JWT)
```

---

## Deployment Overview

The app runs across three services:

| Piece     | Where    | Why                                             |
| --------- | -------- | ----------------------------------------------- |
| Frontend  | Vercel   | Static + SPA hosting, free tier                 |
| Database  | Supabase | PostgreSQL via Vercel Integration, 500 MB free  |
| Backend   | Render   | Long-running Express server, free tier          |

---

## Step-by-Step Deployment

### 1. Database — Supabase (Vercel Integration)

1. Go to your Vercel project dashboard.
2. Click the **Integrations** tab, search for **Supabase**, and add it.
3. Follow the wizard to create a new Supabase project (or link an existing one).
4. Vercel automatically sets these environment variables in your project:

   | Variable                  | Description                    |
   | ------------------------- | ------------------------------ |
   | `DATABASE_URL`            | Postgres connection string     |
   | `SUPABASE_URL`            | Supabase API URL               |
   | `SUPABASE_ANON_KEY`       | Public anon key                |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key (private)  |

   > You only need `DATABASE_URL` for this app.

5. **Run the schema migration** — do this once from your local machine pointing at the Supabase database. Copy the `DATABASE_URL` from Vercel and run:
   ```bash
   cd backend
   set DATABASE_URL=postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   node initDB.js
   ```
   This creates all tables: `users`, `services`, `bookings`, `tickets`, `service_requests`, `ratings`.

> You only run `initDB.js` once — your database tables now live in Supabase.

### 2. Backend — Render

1. Push your repo to GitHub (if you haven't already).
2. Sign up at [render.com](https://render.com) and click **New → Web Service**.
3. Connect your GitHub repo.
4. Configure the service:

   | Setting         | Value             |
   | --------------- | ----------------- |
   | Root Directory  | `backend`         |
   | Runtime         | Node              |
   | Build Command   | `npm install`     |
   | Start Command   | `npm start`       |

5. Add environment variables:

   | Key            | Value                                                     |
   | -------------- | --------------------------------------------------------- |
   | `DATABASE_URL` | (your Supabase `DATABASE_URL` from step 1)                |
   | `JWT_SECRET`   | (generate a long random string — use a UUID or password generator) |

   > Leave `PORT` unset — Render sets it automatically.

6. Click **Deploy Web Service**. Render gives you a URL like `https://sureserve-api.onrender.com`.

7. Test it by visiting that URL in your browser — you should see:
   ```json
   { "success": true, "message": "SureServe backend is running" }
   ```

### 3. Frontend — Vercel

1. In the Vercel dashboard, this project should already exist (from the Supabase integration). If not, click **Add New → Project** and import the repo.
2. Vercel auto-detects Vite. Confirm:
   | Setting           | Value           |
   | ----------------- | --------------- |
   | Framework         | Vite            |
   | Build Command     | `npm run build` |
   | Output Directory  | `dist`          |
3. Add environment variable:

   | Key            | Value                                      |
   | -------------- | ------------------------------------------ |
   | `VITE_API_URL` | `https://sureserve-api.onrender.com`       |

4. Click **Deploy**. Vercel gives you a URL like `https://sureserve.vercel.app`.

5. **Update CORS** — open `backend/server.js` and add your new Vercel domain to the `origin` array:
   ```js
   origin: [
     "https://sureserve.vercel.app",           // ← add your domain
     "https://sureserve-frontend-mauve.vercel.app",
     ...
   ],
   ```
   Commit and push — Render auto-redeploys on push.

---

## Running Locally (Optional)

### 1. PostgreSQL

Install PostgreSQL, create the database, then run the migration:

```bash
cd backend
node initDB.js
```

Your `backend/.env` already has local DB credentials — `db.js` uses those when `DATABASE_URL` is not set.

### 2. Backend

```bash
cd backend
npm install
npm run dev              # http://localhost:5000
```

### 3. Frontend

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev              # http://localhost:5173
```

---

## Environment Variables Reference

| Variable        | Where     | Example                                                       |
| --------------- | --------- | ------------------------------------------------------------- |
| `VITE_API_URL`  | Vercel    | `https://sureserve-api.onrender.com` (or `http://localhost:5000`) |
| `DATABASE_URL`  | Render    | `postgresql://postgres.xxx:[pass]@aws-0.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET`    | Render    | A long random string                                          |
| `PORT`          | Render    | Set automatically by Render; defaults to `5000` locally       |
| `DB_HOST`       | Local     | `127.0.0.1` (ignored when `DATABASE_URL` is set)              |
| `DB_USER`       | Local     | `root` (ignored when `DATABASE_URL` is set)                   |
| `DB_PASSWORD`   | Local     | (ignored when `DATABASE_URL` is set)                          |
| `DB_NAME`       | Local     | `sureserve_db` (ignored when `DATABASE_URL` is set)           |
| `DB_PORT`       | Local     | `5432` (ignored when `DATABASE_URL` is set)                   |

---

## API Routes

All routes are prefixed with `/api`:

| Endpoint                     | Auth | Description              |
| ---------------------------- | ---- | ------------------------ |
| `POST /api/auth/register`    | No   | Register a new user      |
| `POST /api/auth/login`       | No   | Login, returns JWT       |
| `GET /api/profile`           | Yes  | Get user profile         |
| `PUT /api/profile`           | Yes  | Update profile           |
| `GET /api/services`          | No   | List services            |
| `POST /api/services`         | Yes  | Create a service (seller)|
| `POST /api/bookings`         | Yes  | Book a service           |
| `GET /api/tickets`           | Yes  | List tickets             |
| `POST /api/tickets`          | Yes  | Create ticket            |
| `POST /api/service-requests` | Yes  | Create service request   |
| `POST /api/ratings`          | Yes  | Submit a rating          |
| `GET /api/test-db`           | No   | Test database connection |

---

## Notes

- JWT tokens are stored in `localStorage` with `buyer_` or `seller_` prefixes depending on role.
- Passwords are hashed with bcryptjs before storage.
- `db.js` prefers `DATABASE_URL` (cloud) when set; falls back to individual `DB_*` fields for local development.
- The Supabase Vercel Integration automatically injects `DATABASE_URL` into your Vercel project — copy it to Render manually.
