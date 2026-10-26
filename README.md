# Cybexs Tech — Website & Business Platform

Premium animated marketing website, interactive demo portfolio, blog/CMS, lead
capture with free-consultation booking flow, and a secure admin dashboard with
CRM-style lead management. Built with Next.js 16 (App Router) + TypeScript +
Tailwind CSS 4 + Prisma.

> **Brand note:** the site uses the official Cybexs Tech logo assets
> (`public/brand/`), the ink/white/coral `#FF3B30` palette from the brand kit,
> and the "Deploy the Infrastructure, Decrease the Spend" campaign graphic
> (About page).

---

## 1. What is implemented

**Marketing site** (`src/app/(site)/`)

- Homepage with cinematic hero, outcome narrative, 7-service overview,
  engagement process, industries, concept-work teaser, DB-driven insights
  teaser, FAQs and conversion sections.
- About, Contact (working form), FAQs, Privacy Policy, Terms of Service.
- 7 service pages + 28 subservice pages, all data-driven from
  `src/data/services.ts` (unique metadata, JSON-LD `Service`, breadcrumbs).
- Industries overview + 8 industry detail pages (`src/data/industries.ts`).
- Portfolio `/work` — five concept projects, clearly labeled as fictional demos.

**Demo sites** (`src/app/demos/`, all `noindex`)

- `/demos/perfume` — Maison Élore (luxury fragrance: product dialogs, note
  explorer, demo discovery-set cart).
- `/demos/automotive` — AURION (electric hyper-GT: model selector, spec
  counters, animated performance bars, demo briefing form).
- `/demos/business-incubator` — Northbeam (program finder, 3-step demo
  application journey, FAQ).
- `/demos/footwear` — SOLSTICE (category filters, size selection, working demo
  cart drawer, demo checkout).
- `/demos/masala` — Garam Theory (heat-tolerance filter, blend cards, recipe
  tabs, demo newsletter).
- All demo forms are simulated and labeled "demo" — nothing is submitted to
  real endpoints; no payments exist.

**Insights blog** (`/insights`, `/insights/[slug]`)

- 12 original launch articles: 7 published, 5 drafts (seeded from
  `src/data/articles.ts`). Drafts never appear publicly and 404 on direct
  access. Categories filter via `?category=`.

**Booking flow** (`/book`)

- Step 1: exactly the five required fields (full name, work email, company
  name, company website, service of interest incl. "Not sure yet"), zod-validated.
- Step 2: Cal.com inline embed when `NEXT_PUBLIC_CALCOM_BOOKING_URL` is set;
  otherwise an honest "scheduling is being connected" panel with email fallback.
  No fake calendar is ever shown. Booking confirmation only ever comes from
  Cal.com itself.

**Lead management** (`/admin`)

- Secure sign-in (JWT httpOnly cookie, bcrypt hashes, rate-limited login,
  server-side session verification on every admin API).
- Overview: pipeline counters, 14-day trend, follow-ups due, recent leads.
- Leads: search, status/source/owner filters, pagination, inline quick-status
  updates, lead detail with pipeline control, owner assignment, follow-up date,
  internal notes (with automatic system notes), booking reference section,
  email-notification status with admin retry.
- CSV export (ADMIN role only) — rejects anonymous and TEAM-role access.
- Content CMS: create/edit/publish/delete articles (Markdown editor with
  preview, SEO fields, slug management, draft/published states).
- Team page: role model foundation (ADMIN vs TEAM) with honest "planned"
  markers for future invitations.

**SEO / AEO foundations**

- Per-page unique titles/descriptions, canonical URLs, Open Graph (+ generated
  OG image), JSON-LD (`Organization`, `WebSite`, `Service`, `BlogPosting`,
  `BreadcrumbList`, `FAQPage`, `Blog`), dynamic `sitemap.xml` (published
  articles included; demos/admin excluded), `robots.txt` (admin/api/demos
  disallowed), semantic HTML, descriptive alt text, `prefers-reduced-motion`
  support, skip-to-content link, keyboard-operable navigation.

**Analytics readiness**

- `src/lib/analytics.ts` defines the event taxonomy
  (`consultation_cta_clicked`, `consultation_form_submitted`,
  `scheduling_opened`, `booking_confirmed`, `contact_form_submitted`,
  `demo_opened`, `service_page_viewed`, `article_viewed`). No provider is
  connected at launch — events are a safe no-op until a provider is wired.

---

## 2. Architecture

```
src/
  app/
    (site)/          marketing pages (shared navbar/footer layout)
    demos/           five standalone demo sites (own layouts, noindex)
    admin/           dashboard (server-side session gate)
    api/             public leads/contact + admin API (see below)
    sitemap.ts robots.ts manifest.ts not-found.tsx layout.tsx
  components/
    site/            navbar, footer, CTA, page hero, breadcrumbs, JSON-LD…
    motion/          Reveal, StaggerGroup, HeroEntrance, Counter, Marquee
    forms/           consultation + contact forms
    demos/           demo-specific interactive components
    admin/           dashboard client components
    ui/              shadcn/ui components
  data/              services, industries, demos, faqs, articles (seed)
  lib/               db, auth (JWT session), email, analytics, validations, site config
prisma/schema.prisma Lead · Note · Article · AdminUser
prisma/seed.ts       admin provisioning + article import
```

**API endpoints**

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/leads` | POST | public | Consultation form capture (dedup by email/24h) |
| `/api/contact` | POST | public | Contact form capture |
| `/api/admin/login` `/logout` `/me` | POST/POST/GET | public/session | Auth |
| `/api/admin/stats` | GET | session | Dashboard metrics |
| `/api/admin/leads` | GET | session | Search/filter/paginate leads |
| `/api/admin/leads/[id]` | GET/PATCH | session | Lead detail / status·owner·follow-up |
| `/api/admin/leads/[id]/notes` | POST | session | Internal notes |
| `/api/admin/leads/[id]/resend-email` | POST | ADMIN | Retry notification |
| `/api/admin/leads/export` | GET | ADMIN | CSV export |
| `/api/admin/articles` | GET/POST | session/ADMIN | CMS list/create |
| `/api/admin/articles/[id]` | GET/PATCH/DELETE | session/ADMIN | CMS detail/update/delete |

**Data integrity guarantees** (lead pipeline): input is zod-validated → the
lead is persisted first → notifications run asynchronously afterwards → email
failure never discards a lead (status recorded as `FAILED` /
`SKIPPED_NO_PROVIDER`, retryable from the admin UI). Duplicate consultation
submissions within 24h return the existing lead instead of creating noise.

---

## 3. Run locally

```bash
bun install
cp .env.example .env            # fill in SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
bun run db:push                 # create/update SQLite tables
bun prisma/seed.ts              # provision admin + import launch articles
bun run dev                     # http://localhost:3000
```

Sign in at `/admin` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values from `.env`.

## 4. Production deployment path (zero-cost tiers)

1. **Database — Supabase** (free tier): create a project → copy the Postgres
   connection string → set `DATABASE_URL` → switch
   `prisma/schema.prisma` datasource provider to `"postgresql"` →
   `bun run db:push` → `bun prisma/seed.ts`. The data model is
   provider-agnostic; no code changes are required.
   *(This sandbox used SQLite — the documented, reversible adaptation.)*
2. **Hosting** (Vercel free tier or equivalent): import the repo, set all env
   vars from `.env.example`, deploy. Set `NEXT_PUBLIC_SITE_URL=https://cybexs.tech`
   so canonicals/sitemap/OG point at the real domain (never the preview domain).
3. **Cal.com** (free): create account → publish event type → set
   `NEXT_PUBLIC_CALCOM_BOOKING_URL=https://cal.com/<user>/<event>` →
   the /book step-2 panel switches to the live embed automatically.
4. **Email — Resend** (free tier): verify `cybexs.tech` domain (SPF/DKIM) →
   set `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL=business@cybexs.tech` →
   use the admin "Retry notification" button if any leads were captured
   unconfigured.
5. **DNS**: point the `cybexs.tech` domain at the hosting provider.
6. **Verify**: submit both forms → confirm leads in `/admin` → confirm email
   delivery → book a real slot via Cal.com → confirm the booking appears in
   your Cal.com dashboard (the site never claims a booking the provider
   didn't confirm).

## 5. Content editing

- **Articles**: `/admin/content` — full CRUD with draft/published workflow.
  Published articles appear on `/insights` and in the sitemap immediately.
- **Services/industries/page copy**: maintained as typed content in
  `src/data/*.ts` (documented decision — these pages are code-reviewed
  marketing assets; a DB-backed editor can be added later without route
  changes since pages read exclusively from those modules).

## 6. Security model

- Admin routes/pages are gated **server-side** (session JWT in httpOnly,
  SameSite=Lax cookie; bcrypt password hashes; session re-validated against
  the DB on every request so deleted users lose access instantly).
- Role checks are enforced in the API layer (TEAM cannot export CSV or edit
  content); the UI mirrors but never replaces those checks.
- No public registration; admin provisioning only via seed env vars.
- Login rate-limiting (10 attempts / 15 min / IP), uniform error messages
  (no account enumeration), no secrets in client bundles, private notes never
  exposed in public responses or CSV exports to unauthorized roles.
- When moving to Supabase, enable RLS on `Lead`, `Note`, `AdminUser` with
  least-privilege policies as defense-in-depth (the app intentionally accesses
  the DB server-side only).

## 7. Verified vs pending

**Verified end-to-end in this environment** (browser + API):

- All marketing/service/industry/insights/demo routes return 200 and render
  (screenshot-verified desktop + mobile); unknown routes 404 correctly.
- Consultation flow: form → validation → lead persisted (`SKIPPED_NO_PROVIDER`
  recorded honestly) → scheduling step shows the honest unconfigured state.
- Contact flow: form → lead persisted with message → success reference shown.
- Duplicate submission returns the existing lead (`existing: true`).
- Admin: login → overview stats → leads table (search/filter/quick-status) →
  lead detail (status change, note added, system note logged) → CSV export
  (authenticated; 401 anonymous; ADMIN-only).
- CMS: article list renders 12 seeded articles with correct statuses; drafts
  404 publicly and are excluded from `/insights` and sitemap.
- Demos: perfume dialog flow, automotive model tabs, incubator program filter
  and multi-step application, footwear filter/size/cart drawer, masala heat
  filter — all interactive and functional; all `noindex`.
- Lint (`bun run lint`) and `tsc --noEmit` pass for all project sources.

**Pending external configuration** (cannot be done without company accounts):

- Supabase project + Postgres migration (§4.1).
- Cal.com account/event → `NEXT_PUBLIC_CALCOM_BOOKING_URL`.
- Resend account + domain verification → email keys.
- Production hosting + `cybexs.tech` DNS.
- LinkedIn URL (`NEXT_PUBLIC_LINKEDIN_URL`) — page exists, URL to be supplied.
- Privacy/Terms jurisdiction specifics (flagged in-page for legal review).

## 8. Known limitations

- Booking associations (`bookingRef`/`bookingDetails`) populate via Cal.com
  once its webhook/automation is connected at deployment time; the schema and
  UI are ready, the transport requires real Cal.com credentials.
- Email retry is manual (admin button) rather than a scheduled queue — chosen
  deliberately to avoid extra infrastructure on the free tier.
- Team invitations are documented as planned; the role model (ADMIN/TEAM) and
  server-side enforcement exist today.
- The 14-day trend chart is a lightweight CSS chart; a richer charting library
  can be swapped in later if desired.
