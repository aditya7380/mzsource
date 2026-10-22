# MZ Source — Backend API

A complete FastAPI + PostgreSQL (SQLAlchemy) backend for the MZ Source
request-based product sourcing platform. It implements every entity and
workflow already defined by the existing frontend
(`src/app/data/mockData.ts` + `src/app/context/AppContext.tsx`) so the React
app in the Figma export can be pointed at this API with minimal changes —
this does **not** touch or rebuild any front-end screens.

## What's included

- **Full CRUD** for Categories, Subcategories, Products, Customers,
  Addresses, Requests, Quotations, Notifications, and Custom Product
  Requests.
- **Two auth systems**, matching the spec exactly:
  - Buyer: mobile number + OTP → JWT (`/api/buyer/auth/...`)
  - Admin: username + password → JWT (`/api/admin/auth/...`), single admin
    account seeded from `.env`.
- **The full request lifecycle**: `PENDING → SELECTED → CONFIRMED →
  COMPLETED`, with `REJECTED`/`CANCELLED` branches, a status history
  timeline, and automatic buyer/admin notifications at each step — mirrors
  `AppContext.tsx` behaviour 1:1.
- **Snapshotting**: every request stores the buyer's name/mobile/type/
  address *as it was at submission time*, so later profile edits never
  retroactively change a past request (per the spec's "Request-Specific
  Information" requirement).
- **Privacy enforced at the API layer**: supplier name/contact/cost/margin
  and admin private notes are only ever serialised into a response when the
  caller is authenticated as Admin — a buyer token can never receive them,
  regardless of which endpoint is called.
- **Auto customer ID / request ID generation**: `MZ-CUS-000001`,
  `REQ-MZ-2026-000001`, etc.
- Works against **PostgreSQL** (recommended) or **SQLite** (zero-setup local
  dev) via a single `DATABASE_URL` env var — same code, no branching.

## Project layout

```
app/
  main.py           FastAPI app, router wiring, CORS, startup seeding
  config.py         Settings (reads .env)
  database.py       SQLAlchemy engine/session
  models.py         ORM models (the actual DB schema)
  schemas.py        Pydantic request/response models (camelCase JSON)
  serializers.py     ORM -> schema conversion, enforces buyer/admin privacy
  crud.py           All business logic (mirrors AppContext.tsx)
  auth.py           Password hashing + JWT issuing/verification
  seed.py           Creates tables, seeds admin user + starter catalogue
  routers/
    buyer_auth.py       POST send-otp / verify-otp / create-profile
    admin_auth.py       POST login
    categories.py       GET (public) + POST/PATCH/DELETE (admin)
    products.py         GET/search (public) + POST/PATCH/DELETE (admin)
    buyer_profile.py    Buyer's own profile + saved addresses
    admin_customers.py  Admin customer management
    requests.py         Buyer submit/track/cancel/confirm; Admin manage/quote
    notifications.py    Buyer + Admin notification feeds
    custom_requests.py  "Request a Product" feature
    analytics.py        Admin dashboard summary stats
requirements.txt
.env.example
schema.postgresql.sql   Reference DDL (generated from the models)
```

## Setup

### 1. Install dependencies

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure the database

Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:

```bash
cp .env.example .env
```

```
DATABASE_URL=postgresql+psycopg2://mzsource:mzsource@localhost:5432/mzsource
```

Create the database first (e.g. `createdb mzsource` or via your Postgres
admin tool). Tables are created automatically on startup — no manual DDL
needed (`schema.postgresql.sql` is provided for reference/review only).

**No Postgres available yet?** Just switch the line in `.env`:

```
DATABASE_URL=sqlite:///./mzsource.db
```

Everything works identically — same models, same endpoints.

### 3. Run it

```bash
uvicorn app.main:app --reload --port 8000
```

On first run, the app automatically:
- creates all tables,
- creates the single Admin account from `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  (default `admin` / `admin123` — **change this in production**),
- seeds the 3 starter categories + subcategories from the spec
  (Project & Electronics, Disposable Products, Toys & Educational),
- adds a handful of demo products so the catalogue isn't empty,
- creates a demo buyer (mobile `9999999999`) for the OTP demo flow.

Interactive API docs: **http://localhost:8000/docs**

### 4. Demo credentials

| Role  | Identifier          | Secret                                  |
|-------|----------------------|------------------------------------------|
| Admin | `admin`              | `admin123`                                |
| Buyer | `9999999999`         | OTP `123456` (any code works while `DEMO_OTP_BYPASS=true`) |

Set `DEMO_OTP_BYPASS=false` in `.env` once you wire up a real SMS gateway —
`send_otp()` in `app/routers/buyer_auth.py` is the one place to plug that in.

## Key endpoints

```
Buyer auth
  POST /api/buyer/auth/send-otp
  POST /api/buyer/auth/verify-otp
  POST /api/buyer/auth/create-profile
  GET  /api/buyer/auth/me

Admin auth
  POST /api/admin/auth/login

Catalogue (public read, admin write)
  GET  /api/categories
  GET  /api/products?categoryId=&subcategoryId=&search=

Buyer profile
  GET/PATCH /api/buyer/profile
  GET/POST/PATCH/DELETE /api/buyer/profile/addresses

Requests
  POST /api/buyer/requests                       submit a new request
  GET  /api/buyer/requests                        my requests
  GET  /api/buyer/requests/{id}                    track one request
  POST /api/buyer/requests/{id}/cancel
  POST /api/buyer/requests/{id}/confirm-quotation

  GET   /api/admin/requests
  GET   /api/admin/requests/{id}
  PATCH /api/admin/requests/{id}/status            select / reject / etc.
  POST  /api/admin/requests/{id}/quotation         create/replace quotation
  POST  /api/admin/requests/{id}/notes             private admin note

Notifications
  GET  /api/buyer/notifications | /api/admin/notifications
  POST .../{id}/read | .../read-all

Custom product requests ("Request a Product")
  POST /api/buyer/custom-requests
  GET  /api/admin/custom-requests
  PATCH /api/admin/custom-requests/{id}/status

Admin dashboard
  GET /api/admin/analytics/summary
```

All request/response bodies use **camelCase** JSON keys (e.g. `customerId`,
`unitType`, `deliveryAddress`) to match the existing TypeScript interfaces
in `mockData.ts` as closely as possible.

## Connecting the existing frontend

The React app currently keeps all state in `localStorage` via
`AppContext.tsx`. To point it at this API instead of mock data:

1. Replace the `loadState()`/`saveState()` localStorage calls with `fetch`
   calls to the endpoints above.
2. Store the JWT (`accessToken`) returned by login/OTP-verify and send it as
   `Authorization: Bearer <token>` on subsequent requests.
3. The shapes returned by this API match the `Category`, `Product`,
   `Customer`, `Request`, `Notification`, etc. interfaces in `mockData.ts`
   almost exactly (camelCase field names), so most components should need
   little more than swapping `useApp()`'s data source.

This backend intentionally does not touch any `.tsx` files — it's a drop-in
data layer for the mobile-optimised frontend you build separately.

## Production notes

- Set a strong random `JWT_SECRET_KEY` and change the default admin
  password before deploying.
- Tighten `CORSMiddleware` `allow_origins` in `app/main.py` to your real app
  domain(s).
- For schema evolution over time, introduce Alembic migrations instead of
  relying on `create_all()`.
- Wire `send_otp()` to a real SMS provider and set `DEMO_OTP_BYPASS=false`.
- Consider rate-limiting `/send-otp` and `/verify-otp` to prevent abuse.
