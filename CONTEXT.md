# SureServe — Complete Project Context

> **Purpose:** This file is the single source of truth for AI agents and developers working on this codebase. It documents every layer of the application: what exists, how it works, where it lives, what's broken, and what to watch out for.

**Last updated:** 2026-07-17
**Git user:** Clint
**Branch:** master

---

## 1. Project Identity

**SureServe** is a full-stack electronics service marketplace. Customers (buyers) submit service requests and support tickets. Sellers/providers manage those requests through an admin portal. The app has a subscription tier system (Free / Premium / Professional / Enterprise) that gates features like priority levels and analytics.

### What the business does:
- Buyers request electronics installation, maintenance, or repair services at a physical location
- Buyers submit support tickets (technical support, hardware malfunction, software error, warranty claims)
- Sellers view, process, finish, or cancel incoming requests and tickets
- Buyers rate completed services (1–5 stars + review text)
- Both sides have subscription plans that unlock features

---

## 2. Repository Map

```
website papa/
├── CONTEXT.md                          ← YOU ARE HERE
├── README.md                           ← Deployment guide (slightly outdated)
├── index.html                          ← Vite entry HTML
├── vite.config.js                      ← Vite + React + Tailwind CSS v4 plugin
├── vercel.json                         ← Vercel SPA rewrites (all routes → index.html)
├── package.json                        ← Frontend deps (React, Vite, Tailwind, Framer Motion, Lucide)
├── .gitignore
├── .claude/
│   └── settings.local.json             ← Claude Code config (DeepSeek proxy)
│
├── src/                                ← React Frontend
│   ├── main.jsx                        ← ReactDOM entry, renders <App />
│   ├── App.jsx                         ← Root: auth gating + routing (no React Router — manual popstate)
│   ├── AppAuth.jsx                     ← Auth UI: login/register/forgot-password (buyer + seller portal)
│   ├── index.css                       ← Tailwind import + dark mode overrides + print styles
│   ├── components/
│   │   ├── buyer/
│   │   │   ├── BuyerLayout.jsx         ← Shell: sidebar + header + main content area
│   │   │   ├── BuyerSidebar.jsx        ← Left nav (260px): Dashboard, Service, Ticket, Recent, Premium, Profile
│   │   │   └── BuyerHeader.jsx         ← Top bar: welcome message, notification bell, avatar
│   │   └── seller/
│   │       ├── SellerLayout.jsx        ← MONOLITH: ~1400 lines. All seller pages + Shell + Sidebar + Topbar in one file
│   │       └── AdvancedSubscription.jsx ← Seller subscription plans (Free/Professional/Enterprise — ₱0/₱299/₱999)
│   ├── pages/
│   │   └── buyer/
│   │       ├── BuyerDashboard.jsx      ← Page router for buyer (dashboard/installation/ticket/recent/premium/profile)
│   │       ├── DashboardContent.jsx    ← Dashboard: stat cards, quick actions, recent activity, premium CTA
│   │       ├── InstallationPage.jsx    ← Service request form (type/priority/location/contact/date/time/description)
│   │       ├── TicketPage.jsx          ← Support ticket form (type/priority/contact/phone/description)
│   │       ├── RecentPage.jsx          ← Unified table: tickets + service requests + rating modal + delete confirm
│   │       ├── PremiumPage.jsx         ← Buyer subscription plans (Free/Premium/Enterprise — ₱0/₱149/₱499)
│   │       └── ProfilePage.jsx         ← Profile editor: photo upload, name/phone/address, dark mode toggle
│   ├── services/                       ← API client layer (all use fetch, all talk to VITE_API_URL)
│   │   ├── authService.js             ← register/login/saveAuthData/getUser/getAuthToken/authHeaders + JWT migration
│   │   ├── profileService.js          ← getProfile, updateProfile, getDashboardStats, getSellerStats
│   │   ├── ticketService.js           ← createTicket, getTickets, updateTicketStatus, deleteTicket
│   │   ├── serviceRequestService.js   ← createServiceRequest, getServiceRequests, updateStatus, delete
│   │   └── ratingService.js           ← submitRating, getRating, getBulkRatings
│   └── utils/
│       └── sellerAuth.js              ← isSellerLoggedIn / loginSeller / logoutSeller (uses "seller-auth" localStorage key)
│
├── backend/                            ← Express.js (Node) Backend ← PRIMARY / PRODUCTION
│   ├── server.js                       ← Express entry: CORS, routes, /api/test-db, port 5000
│   ├── db.js                           ← pg Pool: prefers DATABASE_URL (Supabase) else local DB_* env vars
│   ├── init.sql                        ← Full DDL: users, ratings, services, bookings, tickets, service_requests + migrations
│   ├── initDB.js                       ← Runs init.sql against the database (one-shot schema migration)
│   ├── package.json                    ← express 5.1, pg, bcryptjs, jsonwebtoken, cors, dotenv, nodemon
│   ├── .env                            ← Local dev DB credentials + JWT secret
│   ├── middleware/
│   │   └── authMiddleware.js           ← JWT verify (protect) + role gate (providerOnly)
│   ├── controllers/
│   │   ├── authController.js           ← registerUser, loginUser
│   │   ├── serviceController.js        ← CRUD: getServices, getServiceById, createService, updateService, deleteService
│   │   ├── bookingController.js        ← createBooking, getMyBookings, updateBookingStatus
│   │   ├── profileController.js        ← getProfile, updateProfile, getDashboardStats, getSellerStats, initProductionDatabase
│   │   ├── ticketController.js         ← createTicket, getTickets, getTicket, updateTicketStatus, deleteTicket
│   │   ├── serviceRequestController.js ← createServiceRequest, getServiceRequests, updateStatus, delete
│   │   └── ratingController.js         ← submitRating, getRating, getBulkRatings
│   └── routes/
│       ├── authRoutes.js
│       ├── serviceRoutes.js
│       ├── bookingRoutes.js
│       ├── profileRoutes.js
│       ├── ticketRoutes.js
│       ├── serviceRequestRoutes.js
│       └── ratingRoutes.js
│
├── backend_flask/                      ← Flask (Python) Backend ← SECONDARY / ALTERNATIVE (MySQL, not Postgres)
│   ├── app.py                          ← Flask entry: CORS, blueprints, /api/test-db
│   ├── config.py                       ← ENV config: PORT, DB_*, JWT_SECRET
│   ├── db.py                           ← MySQL connection pool (mysql.connector), query(), execute() helpers
│   ├── init.sql                        ← MySQL schema
│   ├── init_db.py                      ← Schema migration script
│   ├── auth_middleware.py              ← JWT auth decorator
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── service_routes.py
│   │   ├── booking_routes.py
│   │   ├── ticket_routes.py
│   │   ├── service_request_routes.py
│   │   └── profile_routes.py
│   └── venv/                           ← Python virtual environment
```

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT MAP                             │
├────────────┬─────────────────┬───────────────────────────────────┤
│  FRONTEND  │    BACKEND      │          DATABASE                 │
│  Vercel    │    Render       │       Supabase (PostgreSQL)       │
│  Static    │    Express.js   │       Vercel Integration           │
│  SPA       │    Node.js      │       500 MB free                  │
├────────────┼─────────────────┼───────────────────────────────────┤
│ VITE_API   │ DATABASE_URL    │ Tables: users, services,          │
│ _URL env   │ JWT_SECRET env  │ bookings, tickets, service_       │
│ var        │ PORT (auto)     │ requests, ratings                 │
└────────────┴─────────────────┴───────────────────────────────────┘
```

### Request Flow:
1. **Browser** → Vercel (static files served, SPA handles routing)
2. **SPA** → `VITE_API_URL/api/*` → Render (Express server)
3. **Express** → `DATABASE_URL` → Supabase PostgreSQL
4. **Auth:** JWT stored in `localStorage` with `buyer_` or `seller_` prefix key

### Two Backend Implementations Exist:
| | Express (Node) | Flask (Python) |
|---|---|---|
| **Status** | Primary / Production | Secondary / Alternative |
| **Database** | PostgreSQL (Supabase) | MySQL (local) |
| **Port** | 5000 | 5000 |
| **ORM** | Raw SQL (pg) | Raw SQL (mysql.connector) |
| **Feature parity** | Complete | Partial (routes exist but may lag) |

The frontend is hardcoded to use the Express backend via `VITE_API_URL`. The Flask backend is an alternative implementation that was started but is not wired to the frontend.

---

## 4. Database Schema (PostgreSQL — Production)

### Table: `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | UNIQUE NOT NULL |
| password | VARCHAR(255) | bcrypt hash |
| phone | VARCHAR(30) | DEFAULT '' |
| address | TEXT | DEFAULT NULL |
| role | VARCHAR(20) | DEFAULT 'buyer'. Values: 'buyer', 'provider', 'admin', 'seller' |
| subscription | VARCHAR(50) | DEFAULT 'Free'. Values: 'Free', 'Premium', 'Professional', 'Enterprise' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Role confusion note:** The codebase uses three terms interchangeably for the same concept — `provider`, `seller`, and `admin`. The `role` column stores `'provider'` for seller accounts, but `authController.js` maps `role=seller` → `role=provider` at login. The JWT stores whatever role the DB returns.

### Table: `services`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| provider_id | INT FK → users.id | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| price | DECIMAL(10,2) | NOT NULL |
| category | VARCHAR(100) | |
| image_url | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### Table: `bookings`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| buyer_id | INT FK → users.id | |
| service_id | INT FK → services.id | |
| status | VARCHAR(20) | DEFAULT 'pending'. Values: pending, confirmed, completed, cancelled |
| booking_date | DATE | NOT NULL |
| booking_time | TIME | NOT NULL |
| notes | TEXT | |
| created_at | TIMESTAMP | |

### Table: `tickets`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users.id | |
| ticket_type | VARCHAR(100) | NOT NULL. Values: Technical Support, Hardware Malfunction, Software Error, Warranty Claim |
| priority | VARCHAR(20) | DEFAULT 'Normal'. Values: Low, Normal, High, Urgent |
| contact_person | VARCHAR(100) | |
| phone | VARCHAR(30) | |
| description | TEXT | |
| preferred_date | DATE | NULLABLE (added via migration) |
| status | VARCHAR(20) | DEFAULT 'Pending'. Values: Pending, Processing, Finished, Cancelled |
| created_at | TIMESTAMP | |

### Table: `service_requests`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users.id | |
| service_type | VARCHAR(100) | NOT NULL. Values: Installation, Maintenance, Repair |
| priority | VARCHAR(20) | DEFAULT 'Normal' |
| location | TEXT | NOT NULL |
| contact_person | VARCHAR(100) | |
| phone | VARCHAR(30) | |
| preferred_date | DATE | NULLABLE (added via migration) |
| preferred_time | VARCHAR(30) | |
| description | TEXT | |
| status | VARCHAR(20) | DEFAULT 'Pending'. Values: Pending, Processing, Finished, Cancelled |
| created_at | TIMESTAMP | |

### Table: `ratings`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users.id | |
| item_type | VARCHAR(20) | 'ticket' or 'service' |
| item_id | INT | NOT NULL |
| rating | INT | 1–5, CHECK constraint |
| review | TEXT | |
| created_at | TIMESTAMP | |
| **UNIQUE** | (item_type, item_id) | One rating per item. Upsert on conflict. |

---

## 5. Complete API Reference

All routes prefixed with `/api`. All protected routes require `Authorization: Bearer <JWT>` header.

### Auth — `/api/auth`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | /register | No | `{fullName, email, password, role?}` | `{success, message}` |
| POST | /login | No | `{email, password, role?}` | `{success, token, user: {id, fullName, email, role}}` |

**Role mapping at login:** If `role=seller` is sent, the controller looks up `role=provider` in DB. This is the only place this mapping occurs.

### Profile — `/api/profile`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | Yes | Returns user profile (id, full_name, email, phone, address, role, subscription, created_at) |
| PUT | / | Yes | Update profile. Uses COALESCE — only updates provided fields. Email is sent but ignored by frontend. |
| GET | /dashboard-stats | Yes | Buyer stats: totalTickets, totalServiceRequests, pendingTickets |
| GET | /seller-stats | Yes | Seller stats: counts by status + avgRating + totalRatings |
| GET | /init-db | Yes | **DANGER:** Runs init.sql on production DB. No extra auth. |

### Services — `/api/services`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | No | List all services with provider name |
| GET | /:id | No | Single service |
| POST | / | Yes + Provider | Create service |
| PUT | /:id | Yes + Provider | Update service |
| DELETE | /:id | Yes + Provider | Delete service |

### Bookings — `/api/bookings`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | Yes | Buyer sees own; Provider sees bookings on their services |
| POST | / | Yes | Create booking (service_id, booking_date, booking_time, notes) |
| PUT | /:id/status | Yes + Provider | Update status (pending/confirmed/completed/cancelled) |

### Tickets — `/api/tickets`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | Yes | Buyer sees own; Provider/Admin sees all with customer info |
| GET | /:id | Yes | Single ticket |
| POST | / | Yes | Create ticket. Has fallback for missing preferred_date column. |
| PUT | /:id/status | Yes | Update status. Buyer can only update own; Provider/Admin can update any. |
| DELETE | /:id | Yes | Delete ticket. Same ownership rules. |

### Service Requests — `/api/service-requests`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | Yes | Buyer sees own; Provider/Admin sees all with customer info |
| POST | / | Yes | Create request. Has fallback for missing preferred_date/preferred_time columns. |
| PUT | /:id/status | Yes | Update status |
| DELETE | /:id | Yes | Delete request |

### Ratings — `/api/ratings`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | / | Yes | Submit rating. Upserts on UNIQUE(item_type, item_id). Has fallback if table missing. |
| GET | /bulk?itemType=X&ids=1,2,3 | Yes | Batch fetch ratings for table views |
| GET | /:itemType/:itemId | Yes | Get rating for one item |

### System — `/`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | / | No | Health check: `{success: true, message: "SureServe backend is running"}` |
| GET | /api/test-db | No | Test DB: `SELECT NOW()`, returns timestamp |

---

## 6. Frontend Architecture

### Routing (NO React Router)
The app uses **manual popstate-based routing**. There is no React Router, no `<BrowserRouter>`, no `<Routes>`. Navigation works by:

1. `window.history.pushState({}, "", "/new-path")`
2. `window.dispatchEvent(new PopStateEvent("popstate"))`
3. `App.jsx` listens to `popstate` and reads `window.location.pathname`
4. Component selection via `switch`/`if` statements

**Buyer routes (SPA, no URL change except initial load):**
- `/` → `AppAuth` (login/register) or `BuyerDashboard` if logged in
- Navigation inside buyer uses `setPage("dashboard"|"installation"|"ticket"|"recent"|"premium"|"profile")` — does NOT change URL

**Seller routes (actual URL paths):**
- `/seller-login` → Seller login page
- `/seller-dashboard` → Seller dashboard
- `/seller-requests` → Manage service requests
- `/seller-tickets` → Manage support tickets
- `/seller-analytics` → Analytics (gated behind Professional/Enterprise)
- `/seller-subscription` → Subscription plans

**Custom navigation events:** `BuyerDashboard.jsx` listens for `"navigatePage"` CustomEvent to change pages from header notifications.

### Authentication Flow

**Storage keys (localStorage):**
| Key | Purpose |
|---|---|
| `buyer_token` | JWT for buyer session |
| `buyer_user` | JSON `{id, fullName, email, role, subscription, photo?}` |
| `seller_token` | JWT for seller session |
| `seller_user` | JSON user object for seller |
| `seller-auth` | `"true"` if seller logged in (simple flag) |
| `buyerDarkMode` | `"true"` if buyer dark mode on |
| `sellerDarkMode` | `"true"` if seller dark mode on |
| `profilePhoto_{userId}` | Base64 profile photo string |
| `rating_{source}_{id}` | Cached rating value for table display |

**Login flow:**
1. Form submits to `/api/auth/login` with `{email, password, role}`
2. On success: JWT + user object saved to localStorage with role-appropriate prefix
3. `App.jsx` reads `buyer_user` from localStorage on mount → if exists and role=buyer, auto-login
4. Seller uses `seller-auth` flag check via `isSellerLoggedIn()`

**Legacy migration:** `authService.js` has an IIFE that migrates old unprefixed `token`/`user` keys to `buyer_`/`seller_` prefixed keys.

### Component Tree

```
<App>  ← Root: checks auth, routes by pathname
├── <AppAuth portalType="buyer">  ← Login/Register/ForgotPassword
│   └── <AuthBrandPanel>  ← Left brand panel with secret seller click (5 clicks)
│
├── <AppAuth portalType="seller">  ← Seller login
│
├── <BuyerDashboard>  ← Page router for buyer
│   └── <BuyerLayout>
│       ├── <BuyerSidebar>  ← Left nav (260px), dark navy (#0B1B34)
│       ├── <BuyerHeader>  ← Top bar with notifications + avatar
│       └── <main>
│           ├── <DashboardContent>  ← Stats + quick actions + recent activity
│           ├── <InstallationPage>  ← Service request form
│           ├── <TicketPage>  ← Support ticket form
│           ├── <RecentPage>  ← Unified table with rating modal
│           ├── <PremiumPage>  ← Subscription plans (₱ pricing)
│           └── <ProfilePage>  ← Profile edit + dark mode toggle
│
└── <SellerPortal page={page}>  ← Seller router
    └── <Shell>  ← Sidebar + Topbar + main (all in same file)
        ├── <SellerDashboard>  ← Stats + recent activity + status charts
        ├── <TablePage type="requests">  ← Manage service requests
        ├── <TablePage type="tickets">  ← Manage tickets
        ├── <Analytics>  ← Charts + donut + priority breakdown (premium-gated)
        └── <AdvancedSubscription>  ← Seller plans
```

### Design System

**Colors:**
| Role | Primary | Background | Sidebar |
|---|---|---|---|
| Buyer | Blue (#112b52 brand, blue-600 buttons) | #eef4ff / #edf3ff | #0B1B34 (dark navy) |
| Seller | Orange (#351000 sidebar, orange-500 buttons) | #fff7f4 | #351000 (dark brown) |

**UI Library:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no config file)
**Icons:** `lucide-react` (exclusively)
**Animation:** `framer-motion` (listed in package.json but NOT actually used in any component)
**Typography:** Inter, system-ui (defined in index.css)

### Dark Mode
Both buyer and seller have independent dark mode toggles persisted in localStorage. Dark mode is implemented via a `.dark-mode` CSS class on the root, with extensive `!important` overrides in `index.css` that force colors on standard Tailwind classes (bg-white, text-slate-*, etc.).

---

## 7. Known Issues & Technical Debt

### Critical
1. **`/api/profile/init-db` is exposed with no special auth** — any authenticated user can trigger a full database migration against production. This runs `init.sql` (`CREATE TABLE IF NOT EXISTS` for all tables + `ALTER TABLE` migrations).

2. **`backend/.env` contains real database credentials** — committed to the repo (not in `.gitignore` for backend/.env). The `.gitignore` lists `backend/.env` but the file is already tracked. Contains `DB_PASSWORD=SureServe@2026` and `JWT_SECRET=sureserve_secret_key`.

3. **`.claude/settings.local.json` contains API keys** — DeepSeek API key visible in plaintext. Committed to git (tracked as modified).

### Architecture / Code Quality
4. **No React Router** — manual popstate routing means no browser back/forward support, no URL sharing for specific buyer pages, and fragile navigation.

5. **SellerLayout.jsx is ~1400 lines** — contains 10+ components in one file: Shell, Sidebar, Topbar, SellerDashboard, TablePage, Analytics, ConfirmModal, DetailsModal, exportCsv, Badge, StatCard, HeaderTitle, SellerNotificationDropdown. Should be split into separate files.

6. **Two backend implementations** — Express (PostgreSQL) and Flask (MySQL) exist. Flask is not wired to the frontend. Maintaining both is confusing.

7. **No input validation library** — backend uses manual checks (`if (!email || !password)`). No rate limiting. No request sanitization.

8. **No error handling middleware** — every controller has its own try/catch. No centralized error handler in Express.

9. **No testing** — zero tests. No Jest, no Vitest, no Supertest, no PyTest.

10. **POST /api/bookings has no ownership check** — any authenticated buyer can book any service, but the frontend doesn't expose a booking UI. The bookings table and API exist but the buyer UI only uses tickets and service_requests.

### Frontend Issues
11. **framer-motion is imported but unused** — dead dependency.

12. **Profile photos stored as base64 in localStorage** — can hit the 5–10 MB localStorage limit. No server-side avatar storage.

13. **Rating cache in localStorage** — `rating_{source}_{id}` keys are never cleaned up. localStorage will grow indefinitely.

14. **Duplicate code** — `InstallationPage` and `TicketPage` share nearly identical form logic (FieldWrap, formatPhone, wordCount, getPriorityOptions, validate) but it's copy-pasted, not extracted.

15. **No TypeScript** — entire codebase is plain JavaScript.

16. **Seller role confusion** — three terms (`provider`, `seller`, `admin`) used for the same role. The DB stores `'provider'`, the API accepts `'seller'`, and the middleware checks all three.

17. **No pagination** — all API endpoints return the full dataset. Tables could become very large.

18. **Analytics is premium-gated via frontend check only** — `Analytics` component checks `sellerPlan` client-side. The API `/api/profile/seller-stats` returns full stats regardless of plan. A savvy user could call the API directly.

### Security
19. **JWT secret is weak** — hardcoded `"sureserve_secret_key"` in backend/.env and backend_flask/config.py.

20. **No HTTPS enforcement** — CORS allows specific Vercel domains but no helmet or security headers.

21. **No password strength requirements** — any password accepted.

---

## 8. Environment Variables Reference

| Variable | Where Used | Purpose | Example |
|---|---|---|---|
| `VITE_API_URL` | Frontend (Vercel) | Backend base URL for fetch calls | `https://sureserve-api.onrender.com` |
| `DATABASE_URL` | Backend (Render) | Supabase PostgreSQL connection string | `postgresql://postgres.xxx:[pass]@aws-0.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | Backend (Render) | JWT signing secret | Should be a long random string |
| `PORT` | Backend (Render) | Server port | Auto-set by Render; defaults to 5000 |
| `DB_HOST` | Backend (local) | PostgreSQL host | `127.0.0.1` |
| `DB_USER` | Backend (local) | PostgreSQL user | `root` |
| `DB_PASSWORD` | Backend (local) | PostgreSQL password | `SureServe@2026` |
| `DB_NAME` | Backend (local) | PostgreSQL database | `sureserve_db` |
| `DB_PORT` | Backend (local) | PostgreSQL port | `5432` |

**`db.js` logic:** If `DATABASE_URL` is set (cloud/Production), it uses that with SSL. Otherwise, it builds the connection from `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (local development).

---

## 9. Frontend Service Layer Pattern

Every API call follows this pattern:
```js
import { authHeaders } from "./authService";
const API_URL = `${import.meta.env.VITE_API_URL}/api/endpoint`;

export const someAction = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),         // → { "Content-Type": "application/json", Authorization: "Bearer <token>" }
    body: JSON.stringify(data),
  });
  return res.json();                // Always returns parsed JSON, caller checks .success
};
```

**Key detail:** `authHeaders()` reads the token at call time by checking `window.location.pathname` to determine which prefix (`buyer_` or `seller_`) to use. This means the token is always fresh for each request.

---

## 10. Subscription Tiers & Feature Gating

### Buyer Plans
| | Free | Premium (₱149/mo) | Enterprise (₱499/mo) |
|---|---|---|---|
| Priority levels | Low, Normal | Low, Normal, High | Low, Normal, High, Urgent |
| Max requests/week | 3 | Unlimited | Unlimited |
| Support | Email | 24/7 phone & email | Dedicated manager |

### Seller Plans
| | Free | Professional (₱299/mo) | Enterprise (₱999/mo) |
|---|---|---|---|
| Analytics | ❌ (locked UI) | ✅ | ✅ Advanced |
| Export | ❌ | ✅ PDF & CSV | ✅ Custom reports |
| Support | Email | Priority | Dedicated |

**Gating implementation:** Priority options are filtered client-side based on `user.subscription`. Analytics page shows a lock screen for non-premium sellers. The backend does NOT enforce any subscription-based restrictions — all gating is frontend-only.

---

## 11. CORS Configuration (Production)

From `backend/server.js`:
```js
origin: [
  "https://sureserve-frontend-mauve.vercel.app",
  "https://sureserve-frontend-git-main-jego-agbayani-s-projects.vercel.app",
]
```

If you deploy to a new Vercel domain, you MUST add it here or all API calls will fail with CORS errors.

---

## 12. Build & Run Commands

### Frontend
```bash
npm install              # Install Vite + React + Tailwind
npm run dev              # Dev server on localhost:5173
npm run build            # Production build → dist/
```

### Backend (Express)
```bash
cd backend
npm install              # Express + pg + bcryptjs + jsonwebtoken + cors
npm run dev              # nodemon on localhost:5000
npm start                # Production start
```

### Backend (Flask — alternative)
```bash
cd backend_flask
pip install -r requirements.txt   # (if it existed — currently needs manual install)
python app.py                     # Flask on port 5000
```

### Database Migration
```bash
cd backend
node initDB.js           # Run init.sql against configured database
```

---

## 13. Key Behaviors & Edge Cases

### Secret Seller Access
Clicking the "SURE SERVE" logo text 5 times within 2 seconds on the buyer login page navigates to `/seller-login`. This is the ONLY way to reach the seller portal from the UI — there's no visible "Seller Login" button.

### Notification System
- **Buyer:** Header bell icon fetches your tickets + service requests, shows 5 most recent, clicking navigates to Recent page.
- **Seller:** Same pattern but clicking navigates to the specific ticket/request page.
- No push notifications, no email notifications — purely polled from API.

### Export Feature (Seller)
Exports tables as `.xls` files (actually HTML tables with Excel XML namespace — not real Excel files, but they open in Excel). This is in `SellerLayout.jsx` `exportCsv()` function.

### Print Styles
`index.css` contains `@media print` rules that hide the sidebar, header, and buttons, leaving only the main content. Used by the Analytics "Export PDF" button (which actually just calls `window.print()`).

### Missing Column Fallbacks
Several controllers have try/catch fallbacks for columns that may not exist in older databases:
- `tickets.preferred_date`
- `service_requests.preferred_date` / `preferred_time`
- `users.subscription` / `users.address`
- `ratings` table (entire table may not exist)

This makes the app resilient to partial migrations.

### Photo Handling
Profile photos are:
1. Uploaded via file input → read as base64 `data:` URL via FileReader
2. Stored in localStorage as `profilePhoto_{userId}`
3. Displayed in sidebar and header avatars
4. NOT sent to the backend (frontend explicitly strips `photo` before PUT)

---

## 14. Revamp Considerations

When planning the revamp, here are the biggest-impact changes to consider:

1. **Add React Router** — proper routing with URL params, back/forward support
2. **Split SellerLayout.jsx** — one file per page/section
3. **Extract shared form logic** — `InstallationPage` and `TicketPage` share 70% of code
4. **Add TypeScript** — at minimum for the API service layer and auth
5. **Secure the backend** — remove `/init-db` endpoint, rotate JWT secret, add rate limiting, add Helmet
6. **Move subscription gating to backend** — enforce plan limits server-side
7. **Add proper error handling** — centralized error middleware, consistent error response shape
8. **Add pagination** — all list endpoints
9. **Switch to HTTP-only cookies for JWT** — more secure than localStorage
10. **Pick one backend** — drop Flask and focus on Express, or vice versa
11. **Add tests** — at minimum API integration tests
12. **Remove hardcoded values** — Philippine locations list, CORS origins, JWT secret, DB credentials
13. **Clean up .gitignore** — ensure .env files and settings.local.json are NOT committed
14. **Consider a proper state management solution** — currently prop drilling + localStorage
