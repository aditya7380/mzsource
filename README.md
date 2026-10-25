# MZ Source — Website Frontend (v2)

This replaces the earlier mobile-first frontend. It's a **desktop-first
website** — a top navbar on Buyer pages, the full sidebar Admin dashboard —
that remains fully usable on a phone or a resized browser window (bottom
tab bar + drawer nav kick in below the `md`/`lg` breakpoints).

**This version is a direct port of your approved Figma design**, not a
new redesign. I extracted the actual component source from your uploaded
Figma export and rebuilt each screen to match it pixel-for-pixel — same
copy, same layout, same colors — wired to the real FastAPI backend instead
of local mock data.

## What changed vs. the previous delivery

1. **Desktop website, not a shrunk mobile app.** Buyer pages now have a
   proper top navbar (logo, nav links, cart badge, notification bell,
   profile avatar) on screens ≥768px, with the bottom tab bar reserved for
   mobile widths. Admin keeps its full sidebar layout at all times on
   desktop, collapsing to a drawer + hamburger menu on mobile.
2. **Exact catalogue data.** The seeded categories, subcategories, and all
   20 products are pulled verbatim from your Figma mock data — same names,
   model numbers, colors, and icons as your screenshots.
3. **Admin login is already real, PostgreSQL-backed.** `admin` / `admin123`
   is a real row in the `admin_users` table with a hashed password — kept
   as the demo credential per your instruction, but it's not a fake/local
   check.
4. **Product History dialog.** Next to "Add to Request" on the Product
   Detail page there's now a History button — opens a dialog (closable via
   Escape or the × button, per your spec) showing your past requests for
   that specific product, quantity, and status. Rejected entries get their
   own × to dismiss them from the list individually, without touching
   accepted/other entries.
5. **"Added to Request" turns the button green** with a checkmark, matching
   your description, then reverts after ~1.8s.
6. **Cart supports delete** per item, plus quantity +/-.
7. **Admin phone number on the buyer Profile page**, top of the page, as a
   tap-to-call link — editable by the admin from Admin → Settings, backed
   by a new `/api/settings` endpoint (public read, admin-only write).
8. **Fixed a status-flow bug from the original mock**: the reference design
   set a request to `CONFIRMED` the instant a quotation was sent, which
   skipped the buyer's confirmation step entirely. This version does the
   correct two-step flow — quotation sent → `SELECTED` → buyer taps
   **Confirm Request** → `CONFIRMED` — and I verified this against the live
   backend before shipping.
9. **Admin → Quotations** is its own nav item (not folded into Requests),
   listing every request that has a quotation with its value and status —
   matches your sidebar screenshot.
10. **Analytics** now shows Total Requests / Completion Rate / Total
    Customers / Quoted Value cards, a status-distribution pie chart, a
    requests-by-customer-type bar chart, and a Key Metrics row — computed
    live from real request data (recharts), matching your screenshot.

## Backend changes (small, targeted)

I reviewed the whole backend against every screen before touching the
frontend. It turned out almost everything the Figma UI needs (quotations
list, analytics, product order history) can be computed client-side from
data already being fetched — no new endpoints needed there. The one real
gap:

- **New `Settings` table + `/api/settings/public` (no auth) and
  `/api/admin/settings` (admin GET/PATCH)** — stores business name,
  tagline, contact phone/email/address. This is what powers the "call
  admin" button on the buyer Profile page and the Admin → Settings screen.
- **Seed data rewritten** to load the exact categories/products extracted
  from your Figma file (`app/figma_seed_data.json`) instead of an
  approximation.

Everything else — buyer OTP auth, requests, quotations, notifications,
admin CRUD — was already correct and is unchanged. See the backend's own
README for full API docs.

## Project layout

```
src/
  data/appTypes.ts        Types + CUSTOMER_TYPES/UNIT_TYPES + status color helpers
  lib/api.ts               Backend API client
  lib/format.ts             Currency/date formatting
  context/
    AppContext.tsx          Single source of truth: buyer/admin auth, catalogue,
                             cart, requests, notifications — talks to the real API
    CheckoutContext.tsx      Holds the delivery address during the request flow
  components/
    common/Dialog.tsx        Lightweight modal (Escape + × close, no dependencies)
    common/Misc.tsx           StatusBadge, EmptyState, LoadingScreen
    buyer/BuyerLayout.tsx     Top navbar (desktop) + bottom tabs (mobile)
    buyer/ProductCard.tsx
    buyer/StatusTimeline.tsx  4-step request timeline (shared by buyer + admin)
    admin/AdminLayout.tsx     Sidebar (desktop) + drawer (mobile)
  pages/
    Landing.tsx
    buyer/                   One file per buyer screen
    admin/                   One file per admin screen
  App.tsx                    All routes
```

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend
npm run dev
```

Make sure the backend (`mz_source_backend`) is running first — by default
at `http://localhost:8000`. Demo credentials:

| Role  | Identifier   | Secret                          |
|-------|--------------|------------------------------------|
| Admin | `admin`      | `admin123`                          |
| Buyer | `9999999999` | OTP `123456` (demo mode, any code accepted) |

### Production build

```bash
npm run build   # outputs to dist/
npm run preview # sanity-check the production build locally
```

## Responsive behavior

- **≥1024px (lg):** Admin sidebar always visible; buyer top navbar with
  inline nav links.
- **768–1023px (md):** Buyer top navbar switches to a compact version;
  Admin sidebar collapses to the drawer.
- **<768px:** Buyer bottom tab bar (Home / Categories / Cart / Requests /
  Profile); Admin drawer + hamburger menu — this is the "opens fine on a
  phone" behavior you asked for, it's the same codebase and routes, just
  different chrome.

Resize your browser window with the app open, or open the dev server's
`Network:` URL on your phone, to see both modes.
