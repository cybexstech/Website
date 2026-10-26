# Project Worklog — Cybexs Tech Website

This file is the shared coordination log. Every agent MUST read it before working and append their section after finishing.

---

Task ID: 1
Agent: lead (Z.ai Code orchestrator)
Task: Foundation — environment, database, design system, shared libraries, shared components, API layer

Work Log:
- Read master build prompt (upload/Pasted Content_1792909169820.txt) and brand assets (upload/)
- Key spec adaptations for this sandbox (documented, production path preserved):
  - Database: spec asks Supabase Postgres → not available in sandbox. Using **Prisma + SQLite** (`db/custom.db`) with an identical data model. Migrating to Supabase later = change `datasource provider` + `DATABASE_URL`, run `prisma db push`. No other code changes.
  - Auth: custom credentials auth with **jose JWT in httpOnly cookie + bcryptjs** (NextAuth v4 risky on Next 16/React 19). Server-side session verification on every admin API route.
  - Email: **Resend via plain fetch** (`RESEND_API_KEY`). Unconfigured = status `SKIPPED_NO_PROVIDER`, lead still saved, admin can retry. Never fabricates delivery.
  - Cal.com: config via `NEXT_PUBLIC_CALCOM_BOOKING_URL` env. Unconfigured = professional setup-required state (no fake calendar).
  - CMS: built into admin dashboard (Article model in DB) instead of external CMS — decision note in README.
- Copied brand assets → `public/brand/` (logo-main, logo-inverted, logo-transparent, logo-white derived, favicons, campaign-infrastructure.png)
- Defined Prisma schema: Lead, Note, Article, AdminUser. Ran db push. Seed script `prisma/seed.ts`.

Stage Summary:
- BRAND / DESIGN SYSTEM (all agents MUST follow):

## Brand tokens
- Colors: black `#0A0A0A`, white `#FFFFFF`, off-white `#FAFAF8`, coral accent `#FF3B30` (the brand red dot), grays via Tailwind neutral.
- Accent usage: restrained — dots, highlights, key words, active states, primary CTA.
- Fonts (loaded in root layout): `Inter_Tight` (display, class `font-display`, tracking-tight) + `Inter` (body). CSS vars `--font-display`, `--font-sans`.
- Tailwind theme extensions in `globals.css`: `font-display`, `text-accent`→`--accent` (#FF3B30), custom utilities `.container-site`, `.section`, `.eyebrow`, `.text-balance`, `.link-underline`, `.noise-overlay`.
- Buttons: primary = black bg/white text (or white bg/black text on dark), rounded-full; accent CTA = `bg-[#FF3B30]`. shadcn Button available.
- Radii: shadcn radius set small (0.375rem) for editorial feel; pill buttons rounded-full.
- Imagery: `next/image` everywhere; brand logos in `public/brand/`.

## Motion primitives (src/components/motion/*)
- `<Reveal>` — scroll-triggered fade+rise (framer-motion `whileInView`, respects `useReducedMotion`, `once: true`, custom `delay`/`y`).
- `<AnimatedText>` — per-word staggered headline reveal.
- `<Counter>` — animated number counter on inView.
- `<Marquee>` — infinite marquee row.
- Use these instead of hand-rolling animation. framer-motion is installed. Respect `prefers-reduced-motion`.

## Shared site components (src/components/site/*)
- `SiteNavbar` (mega dropdown for Services, Industries dropdown, mobile Sheet menu) — used by `(site)` layout.
- `SiteFooter` (nav columns, contact email business@cybexs.tech, LinkedIn placeholder only if configured, legal links).
- `CtaSection` — final "Book Free Consultation" section (links `/book`).
- `SectionHeading` (eyebrow + title + description), `Logo`, `JsonLd`, `FaqAccordion`, `Breadcrumbs`.
- Route groups: `src/app/(site)/...` marketing pages with shared layout (navbar+footer). Demos have their own layouts. Admin its own.

## Data layer (src/data/*)
- `services.ts` — 7 services, each: slug, name, shortName, tagline, description, outcomes, subservices[] (slug, name, tagline, description, bullets, useCases), faqs[], process steps, relatedServices. Powers `/services`, `/services/[slug]`, `/services/[slug]/[sub]`, navbar, home, footer.
- `industries.ts` — industries with problem-oriented content; powers `/industries` + `/industries/[slug]`.
- `demos.ts` — demo registry powering `/work` (concept projects, clearly labeled fictional).
- `articles.ts` — 12 seed articles (Task 2-e writes this; seed imports it).
- `faqs.ts` — general site FAQs for `/faqs`.

## API contracts (src/app/api/*, built in Task 1 by lead)
- `POST /api/leads` — body: {fullName, email, companyName, companyWebsite?, serviceInterest, source?: "consultation"|"contact", message?, website?} → creates Lead (dedup by email within 24h → returns existing with `existing: true`), sends email notification (non-blocking, records status). Zod-validated. Returns `{ok, leadId, existing?}`.
- `POST /api/contact` — alias of leads with source "contact" (same validation, message required).
- `POST /api/admin/login` — {email, password} → httpOnly JWT cookie session.
- `POST /api/admin/logout`
- `GET /api/admin/me` — session check.
- `GET /api/admin/stats` — counts by status, recent leads, 14-day trend.
- `GET /api/admin/leads?query=&status=&owner=&page=` — list; `PATCH /api/admin/leads/[id]` — update status/owner/followUpDate; `POST /api/admin/leads/[id]/notes`; `GET /api/admin/leads/export` — CSV (admin only); `POST /api/admin/leads/[id]/resend-email`.
- `GET/POST /api/admin/articles`, `GET/PATCH/DELETE /api/admin/articles/[id]` — CMS CRUD.
- All /api/admin/* verify session server-side via `requireAdmin()`.

## DB models (prisma/schema.prisma)
- Lead: id, fullName, email, companyName, companyWebsite?, serviceInterest, source, inquiryType?, message?, status (NEW/CONTACTED/QUALIFIED/MEETING_BOOKED/WON/LOST), ownerName?, bookingRef?, bookingDetails?, followUpDate?, emailStatus?, emailError?, timestamps, notes[]
- Note: id, leadId, body, author, createdAt
- Article: id, slug(unique), title, excerpt, content(md), category, tags, status(DRAFT/PUBLISHED), seoTitle?, seoDescription?, featuredImage?, author, publishedAt?, timestamps
- AdminUser: id, email(unique), name, passwordHash, role(ADMIN/TEAM), createdAt
- Access via `import { db } from "@/lib/db"`.

## Env (see .env.example after Task 9)
DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_CALCOM_BOOKING_URL (optional), RESEND_API_KEY (optional), EMAIL_FROM (optional), NOTIFY_EMAIL (optional), NEXT_PUBLIC_LINKEDIN_URL (optional).

## Content truth rules (ALL agents)
- No fabricated testimonials, client logos, awards, statistics, addresses, phone numbers, or registration details.
- Contact email: business@cybexs.tech only. LinkedIn: config placeholder only.
- Demos/portfolio are clearly labeled "Concept / Demo projects — fictional brands".
- Primary CTA everywhere: "Book Free Consultation" → `/book`.
- Voice: premium, consultative, concrete. No guaranteed outcomes. Explain what/how/for whom/next step.

## Demo imagery (public/demo-assets/, generated in Task 2)
- perfume/: hero.jpg, p1.jpg, p2.jpg, p3.jpg
- automotive/: hero.jpg, m1.jpg, m2.jpg
- incubator/: hero.jpg, space.jpg
- footwear/: hero.jpg, s1.jpg, s2.jpg, s3.jpg, s4.jpg
- masala/: hero.jpg, m1.jpg, m2.jpg, m3.jpg
Use next/image with these; if an image is missing, use a tasteful CSS/gradient fallback (never a broken img).

---

Task ID: 2-b
Agent: frontend-styling-expert (services & industries pages)
Task: Build /services, /services/[slug], /services/[slug]/[sub], /industries, /industries/[slug] — fully data-driven from src/data/services.ts and src/data/industries.ts

Work Log:
- Read worklog.md design system + data layer, services.ts (7 services × 4 subservices = 28), industries.ts (8 industries), shared components (PageHero, SectionHeading, FaqAccordion, JsonLd, Breadcrumbs, CtaSection, ServiceIcon, Reveal/StaggerGroup/StaggerItem/PopIn), lib/site.ts, globals.css utilities.
- Created all 5 routes as Server Components with Next 16 async `params` (Promise), generateStaticParams + generateMetadata with notFound() for unknown slugs.
- /services: PageHero (dark) with 7/28 stat line; editorial numbered index (border-t rows, 01–07 large indices, icon, name, tagline, intro, subservice chips → /services/[slug]/[sub], "Explore service" arrows) — not uniform cards; dark "Technology + people" band with 3 mini-points + mid-page /book CTA; industries teaser strip with all 8 industry chips; CtaSection.
- /services/[slug]: PageHero crumbs [Services → name], outcomes (3 cards, per-service lucide icon map), narrative paragraphs (max-w-3xl), subservices rows on #FAFAF8 (number, name, tagline, 3-bullet preview, "Full details →"), dark process section (grid-lines-dark, text-stroke step numbers), FAQ 2-col accordion, related-services cards (relatedSlugs), "industries where this does heavy lifting" chips (computed by matching industry.solutions serviceSlug === slug or slug/*), mid CTA bordered panel ("Not sure where to start?" → /book), CtaSection. Service JSON-LD (provider Organization, no ratings/addresses); BreadcrumbList comes from Breadcrumbs inside PageHero.
- /services/[slug]/[sub]: nested generateStaticParams (28 pages). PageHero crumbs [Services → Service → Sub]; overview large paragraph + "How it works in practice" checklist panel (Check in solid coral circle); use cases on #FAFAF8 as numbered quote-style blockquote rows; dark parent-service strip (link back + tagline + View service + /book CTA, sibling chips, 2 related-service chips); FAQ = first 3 of parent service faqs; CtaSection. Service JSON-LD with canonical sub URL.
- /industries: PageHero; 8-card grid (icon, group, name, headline, "N challenges we address" chip, arrow); "Don't see your industry?" centered band with btn-accent → /book; CtaSection.
- /industries/[slug]: PageHero (eyebrow = group, title = headline, desc = summary); "What hurts right now" 2×2 numbered challenge cards; dark "How we address it" solution rows linking resolved service URLs — combined paths like "ai-automation/document-data-processing" → /services/ai-automation/document-data-processing, bare slugs → /services/<slug> (solutionHref helper); firstStep in bordered panel with btn-accent → /book; FAQ accordion; other-industries chips + all-industries link; CtaSection. WebPage JSON-LD.
- New shared component: src/components/site/industry-icon.tsx (maps Building2/Rocket/Factory/Stethoscope/ShoppingCart/Users/Wrench/Target from industries.ts icon keys).
- Metadata: unique per page, e.g. "AI Automation Services — Automate Repetitive Work", "Business Process Automation — AI Automation", "HVAC Business Automation & Call Answering". IMPORTANT: root layout defines title.template "%s | Cybexs Tech", so page titles deliberately OMIT the "| Cybexs Tech" suffix (template appends it — verified rendered <title>).
- Fixed a pre-existing shared-component bug (1-line, documented): src/components/site/cta-section.tsx called trackEventClient() (a "use client" module function) inside onClick while rendering as a Server Component → threw "Attempted to call trackEventClient() from the server" and 500'd EVERY page using CtaSection (all my pages triggered it). Fix: added "use client" to cta-section.tsx (leaf component, string-only props, tracking preserved). Lead should review.
- Verified on the running dev server: all 5 routes 200 (spot-checked /services/ai-automation, /services/ai-voice-agents, /services/ai-automation/document-data-processing, /industries/hvac, /industries/manufacturing), unknown slugs → 404, <title> correct, Service/BreadcrumbList/WebPage JSON-LD present, combined-path solution links rendered. `bunx eslint` on my dirs + site components: clean. `tsc --noEmit`: no errors in my files.

Stage Summary:
- Files created:
  - src/app/(site)/services/page.tsx
  - src/app/(site)/services/[slug]/page.tsx
  - src/app/(site)/services/[slug]/[sub]/page.tsx
  - src/app/(site)/industries/page.tsx
  - src/app/(site)/industries/[slug]/page.tsx
  - src/components/site/industry-icon.tsx
- Files modified (minimal, flagged for lead): src/components/site/cta-section.tsx — added "use client" to fix server-side trackEventClient crash that broke every CtaSection page.
- Decisions: titles rely on root template (no manual "| Cybexs Tech"); BreadcrumbList JSON-LD delegated to Breadcrumbs component (already emitted there) so no duplicate scripts; services overview links every subservice chip; service↔industry cross-links computed from data (industries whose solutions reference the service slug incl. combined paths); subservice pages link parent + all siblings + first 2 related services; use cases rendered as editorial numbered blockquotes (no fake metrics per content rules).
- Heads-up for lead / home agent: src/app/page.tsx (old Z.ai scaffold placeholder) still exists alongside the new src/app/(site)/page.tsx (created by task 2-a). Both resolve to "/" — `next build` will fail with "two parallel pages that resolve to the same path" until src/app/page.tsx is deleted.

---

Task ID: 2-d
Agent: admin-ui (Z.ai Code)
Task: Secure admin dashboard UI — layout/login gate, Overview, Leads (list + detail), Content manager, Team foundation page

Work Log:
- Read worklog.md (API contracts + DB models) and all admin API routes, src/lib/auth.ts, src/lib/db.ts, prisma/schema.prisma, src/lib/validations.ts before writing any UI.
- Verified UI kit in src/components/ui (Table, Select, Sheet, Popover+Calendar/react-day-picker, Dialog, AlertDialog, Switch, Tabs, Tooltip bundles its own provider) and that root layout mounts the Toaster (use-toast hook).
- Implemented the auth gate: src/app/admin/layout.tsx is a server component calling getSession() from "@/lib/auth"; no session → renders <AdminLogin /> full-screen inline (no redirect) for every /admin/* route; session → renders <AdminShell user={session}> (dark #0A0A0A sidebar w/ "Cybexs Tech." coral-dot wordmark, Overview/Leads/Content/Team nav, user card + Sign out → POST /api/admin/logout then location=/admin; mobile = top bar + left Sheet).
- Shared admin client layer (src/components/admin/shared.tsx): apiFetch<T>() wrapper (same-origin cookies; 401 → "Session expired — reloading…" toast + redirect to /admin; ApiError carries status + fieldErrors), useAdminUser() hook on GET /api/admin/me, STATUS_META (exact labels New/Contacted/Qualified/Meeting Booked/Won/Lost with tasteful badge colors incl. coral MEETING_BOOKED), StatusBadge/SourceBadge/EmailStatusBadge, CopyButton, date-fns formatters, TableSkeletonRows.
- Overview (src/app/admin/page.tsx + overview-client.tsx): GET /api/admin/stats → 8 stat cards (Total leads + 6 statuses + Follow-ups due), 14-day trend bar chart built from plain divs (height %, title-attr hover tooltips, coral hover), recent-8 leads list linking to /admin/leads/[id]; skeleton loading + error/retry states.
- Leads (leads-table.tsx): debounced 300ms search, status/source/owner selects (owners from response.owners), fixed pageSize 25, columns Name(+company)/Email(copyable)/Service/Source/Status/Follow-up/Created/inline quick-status Select (optimistic PATCH + toast, revert on error)/Open action; Prev/Next + "Showing x–y of z"; CSV export <a href="/api/admin/leads/export"> ADMIN-only (TEAM gets disabled button + "Administrator role required" tooltip).
- Lead detail (leads/[id]/page.tsx await params → lead-detail.tsx): GET /api/admin/leads/[id]; left column contact card (name, email copy, company/website link, source, service, created/updated, message as quoted block), 6-stage segmented pipeline control (optimistic PATCH + refetch lead so the API-created system note appears), owner assign (Input+datalist of owners from /api/admin/leads?pageSize=100 + "Assign to me"), follow-up Popover+Calendar (local-noon ISO) with Clear, booking section with honest empty state, email notification status (SENT/FAILED+error+ADMIN retry via POST resend-email/SKIPPED_NO_PROVIDER hint); right column notes (POST notes, prepend, .scrollbar-slim max-h-[420px] list) + consultation-info reminder when source==="consultation".
- Content (content-manager.tsx): GET /api/admin/articles; ADMIN-only New/Edit/Delete (AlertDialog confirm; DELETE /api/admin/articles/[id]); Dialog editor (max-w-4xl) with title, auto-slug (regenerates until touched, lowercase-hyphen validation), excerpt w/ /400 counter, category/tags/author/readMinutes, Published Switch, datetime-local publishedAt, SEO title/description counters, featuredImage input with /demo-assets hint, markdown Textarea (min 50) + Write/Preview Tabs rendering react-markdown; POST/PATCH maps response.fieldErrors to fields; "View live" → /insights/[slug] for published; TEAM = read-only.
- Team (team-panel.tsx): GET /api/admin/me user card; static ADMIN-vs-TEAM capability table (Check/X, "Invite team members" marked Planned w/ Clock icon); disabled invite input+button with the exact production-provisioning note (no faked functionality).
- Login (login-form.tsx): centered white card on bg-[#0A0A0A]; POST /api/admin/login; ok → window.location="/admin"; 401 → "Invalid email or password."; 429 → server rate-limit message; error has role="alert"; footer hint present.
- All pages export unique metadata (e.g. "Overview | Cybexs Tech Admin") + robots noindex; relative times via date-fns formatDistanceToNow; no `any`, no emojis; loading skeletons + destructive toasts everywhere.
- Smoke-tested end-to-end with curl: ran existing prisma/seed.ts (provisioned admin@cybexs.tech from env + 12 articles) since AdminUser table was empty; login → cookie → all four admin pages 200; stats/leads/articles/patch/notes/resend/export API contracts verified; created 1 smoke-test lead via POST /api/leads (Amelia Turner / Northlane & Co, consultation source, status QUALIFIED, 1 test note) so the dashboard preview has data — delete at will.
- Note for other agents: pre-existing `trackEventClient()` server/client error in dev.log comes from the site CtaSection (Task 2-a scope), not from admin.

Stage Summary:
- Files created (ALL inside src/app/admin + src/components/admin — no API/lib/prisma/site files touched):
  - src/app/admin/layout.tsx, page.tsx, leads/page.tsx, leads/[id]/page.tsx, content/page.tsx, team/page.tsx
  - src/components/admin/types.ts, shared.tsx, stat-cards.tsx, login-form.tsx, sidebar.tsx, overview-client.tsx, leads-table.tsx, lead-detail.tsx, content-manager.tsx, team-panel.tsx
- Fetch contracts consumed (exact):
  - POST /api/admin/login {email,password} → {ok,user:{id,email,name,role}} | 401 {ok:false,error} | 429
  - POST /api/admin/logout → {ok:true}; GET /api/admin/me → {ok,user}
  - GET /api/admin/stats → {ok,stats:{total,byStatus,followUpsDue,trend:[{date,count}],recent:[8 leads]}}
  - GET /api/admin/leads?query&status&source&owner&page&pageSize → {ok,leads:LeadRecord[],total,page,pageSize,owners[]}; LeadRecord has lastNote, notes:undefined
  - PATCH /api/admin/leads/[id] {status|ownerName|followUpDate(ISO datetime, null clears)} → {ok,lead}; status change creates System note server-side
  - POST /api/admin/leads/[id]/notes {body} → 201 {ok,note}; POST /api/admin/leads/[id]/resend-email → {ok,result:{status,error?}} (ADMIN only, 403 for TEAM)
  - GET /api/admin/leads/export → text/csv (ADMIN only, 403 TEAM / 401 anon)
  - GET /api/admin/articles → {ok,articles[]}; POST /api/admin/articles, PATCH/DELETE /api/admin/articles/[id] → {ok,article} | 422 {ok,error,fieldErrors} | 409 slug conflict
  - Every client fetch: 401 → "Session expired — reloading…" toast + window.location="/admin"
- Role gating: TEAM hides CSV export, article create/edit/delete, email retry; server 403s are surfaced via toasts.
- ESLint + tsc clean for src/app/admin and src/components/admin.

---

Task ID: 2-a
Agent: frontend-styling-expert (core marketing pages)
Task: Homepage, About, Contact, FAQs, Privacy, Terms, Book flow + consultation/contact forms + home hero

Work Log:
- Read worklog.md (Task 1 contract), all motion primitives, site components, data files (services/industries/faqs/demos), validations, analytics, siteConfig, both lead API routes and the Prisma schema before writing anything.
- Homepage `/` — server component with 9 sections: cinematic client hero (home-hero.tsx: full-viewport ink surface, grid-lines-dark, coral radial glow, HeroEntrance choreography, .text-stroke on "busywork.", dual CTAs, animated scroll indicator, 7-service coral-dot Marquee); numbered outcomes rows; services grid with featured dark first card (AI Automation spans 2 cols) + 6 standard cards; dark 4-step engagement timeline; industry pill cloud from INDUSTRIES; work teaser with 3 DEMO_PROJECTS cards, transparently labeled "Selected Concepts — Demo Projects" + "Fictional brands… Not client work" note; insights teaser querying db for 3 latest PUBLISHED articles (try/catch → empty fallback, section hidden when empty); FAQ teaser (5 GENERAL_FAQS); CtaSection. JSON-LD @graph: Organization + WebSite. Metadata uses title.absolute to avoid template suffix.
- About — PageHero (crumbs []), "Why we exist" 3 paragraphs, /brand/campaign-infrastructure.png figure with caption, 4 value cards, 4-step engagement (dark), honest "What we are not" section (not a recruitment agency / not a licensed financial-legal advisor / no guaranteed outcomes), CtaSection.
- Contact — PageHero + two-column: info card (mailto business@cybexs.tech, one-business-day note, 3-step "what happens next", LinkedIn only if siteConfig.linkedinUrl) + ContactForm.
- contact-form.tsx — RHF + zodResolver over a client schema reusing contactLeadSchema.shape (friendlier z.enum message on serviceInterest); shadcn Input/Textarea/Select/Label/Button; POST /api/contact; handles response.fieldErrors → setError, server error box with retry (role="alert"), loading spinner (Loader2), success card with leadId reference; trackEvent("contact_form_submitted"); full a11y (htmlFor, aria-invalid, aria-describedby, noValidate).
- Book `/book` — PageHero, left reassurance column (what we'll cover / 30 minutes / free no obligation / one-business-day follow-up), right consultation-form.tsx, plus "After you book" 4-step strip.
- consultation-form.tsx — two-step client flow with step indicator (1 Details → 2 Schedule). Step 1: exactly the 5 specced fields, zodResolver over consultationLeadSchema.shape, POST /api/leads; on ok → advance (existing:true still advances with "We already have your request — pick a time below."); fieldErrors mapped back; trackEvent("consultation_form_submitted"). Step 2 reads process.env.NEXT_PUBLIC_CALCOM_BOOKING_URL at module level: if set → Cal.com iframe (width 100% / height 720 / border 0, title "Schedule your consultation", ?embed=true) + provider-confirmation note + "I've booked — what's next?" reveal (tracks booking_confirmed); if not set → "Online scheduling is being connected" card + mailto CTA + "Your request is already saved" note. trackEvent("scheduling_opened") on step-2 mount. Back-to-details keeps RHF state (step 1 hidden, not unmounted).
- FAQs — PageHero "Straight answers.", full GENERAL_FAQS accordion, "Working with us" card grid linking each service's FAQ anchor (/services/[slug]#faqs), FAQPage JSON-LD (mainEntity from GENERAL_FAQS), CtaSection.
- Privacy & Terms — honest legal pages describing implemented functionality only (form data collected, purpose, app database storage, Resend-compatible email notifications, Cal.com booking policy link, no analytics/tracking cookies at launch, no data sale, retention, access/deletion via email, international transfers, children, changes, contact; terms: services description, free no-obligation consultation ≠ contract, fictional demo brands disclaimer, IP, acceptable use, no warranties/guaranteed outcomes, liability limits, third-party services, governing-law placeholder, contact). Both carry the visible bordered Editor's note aside. Unique metadata + canonicals per page.

Stage Summary:
- Files created (exact list):
  - src/app/(site)/page.tsx
  - src/app/(site)/about/page.tsx
  - src/app/(site)/contact/page.tsx
  - src/app/(site)/faqs/page.tsx
  - src/app/(site)/privacy/page.tsx
  - src/app/(site)/terms/page.tsx
  - src/app/(site)/book/page.tsx
  - src/components/forms/consultation-form.tsx
  - src/components/forms/contact-form.tsx
  - src/components/site/home-hero.tsx
- Also removed src/app/page.tsx (the Z.ai scaffold placeholder): it resolved to "/" and conflicted with the required (site)/page.tsx — Next.js refuses two pages on one path ("two parallel pages that resolve to the same path"). Deletion was required for the homepage to build; nothing else outside scope was touched.
- Decisions: (1) Forms use RHF + zodResolver against client-side schemas that reuse the shared schema shapes (z.enum gets a friendly "Please select…" message; zod v4 confirmed via runtime check). (2) Homepage metadata uses title.absolute so the title renders without the "| Cybexs Tech" template suffix. (3) Hero headline uses the .text-stroke utility on "busywork." (coral reserved for dots/CTA/glow). (4) demo_opened tracked on work-teaser concept clicks; consultation CTA clicks tracked with location props (home_hero / home_process); no form values ever sent as analytics props. (5) Insights teaser auto-hides while zero PUBLISHED articles exist; /insights/[slug] links assume Task 2-e's route. (6) Service FAQ cards link to /services/[slug]#faqs — Task 2-b should keep an id="faqs" anchor on service detail pages (graceful degradation to the page top if absent).
- Verification: `bunx tsc --noEmit` → zero errors in src/ (remaining diagnostics are pre-existing in examples/, skills/, scripts/ scaffolding); `bunx eslint` on all 10 files + directories → clean (exit 0). Dev server intentionally not run.

---

Task ID: 2-e
Agent: content-engineer (Insights blog — content + public pages)
Task: Insights launch article set (12 articles in src/data/articles.ts) + public /insights index and /insights/[slug] article pages

Work Log:
- Read worklog.md (design system, data layer, content rules), prisma/schema.prisma (Article model), prisma/seed.ts, src/lib/site.ts, src/lib/db.ts, shared components (PageHero, SectionHeading, JsonLd, Breadcrumbs, CtaSection, Reveal) and src/data/services.ts + industries.ts to verify every internal link target (7 service slugs, 28 subservice slugs, 8 industry slugs).
- Wrote src/data/articles.ts (replaced empty placeholder, kept ArticleSeed type + ARTICLES_SEED export exactly): 12 original articles, 7 PUBLISHED / 5 DRAFT, each 696-834 words (validated by script), ## / ### hierarchy, 2-4 contextual internal links to real service/subservice/industry//book pages, scenario-framed examples only (no fabricated statistics, studies, named companies, quotes or client results), 2-4 tags each, readMinutes 5-7, staggered publishedAt 2025-11-04 → 2025-12-16 for published, drafts omit publishedAt + SEO fields. seoTitle ≤ 51 chars, seoDescription ≤ 148 chars (all verified ≤ limits).
- Built src/components/site/insight-card.tsx: CategoryPill, formatInsightDate (date-fns "MMMM d, yyyy"), InsightCard (featured + related variant, stretched-link pattern), InsightRow (list row: date · category · title · excerpt · read time · arrow), shared InsightTeaser type.
- Built src/components/site/insight-prose.tsx: react-markdown v10 with manual editorial typography (no typography plugin) — display headings, neutral-700 paragraphs, coral-marker lists, blockquote border-l-2 border-[var(--coral)] italic, .link-underline anchors (internal → next/link, external → rel=noopener).
- Built src/app/(site)/insights/page.tsx: server component; db.article.findMany(PUBLISHED, desc) in try/catch → []; searchParams as Promise (?category=, validated against derived categories, filtered in memory); PageHero with specced copy; Blog JSON-LD (absoluteUrl); featured editorial card + InsightRow list; honest empty state ("First articles are being finalized."); service chips for all 7 services; CtaSection. Drafts can never render here (query filters status).
- Built src/app/(site)/insights/[slug]/page.tsx: generateStaticParams over PUBLISHED (try/catch → []); generateMetadata with seoTitle/seoDescription fallbacks, canonical, OG type=article + publishedTime, basic fallback for missing/draft; page queries slug AND status=PUBLISHED → notFound() for drafts/missing (verified 404); light-band header (Breadcrumbs [Insights, title], category pill, display H1, lede excerpt, author "Cybexs Tech Team" + time dateTime + read minutes, divider); InsightProse body; "Related reading" = 2 same-category published articles (any-category fallback); custom dark CTA band ("Want this implemented in your business?") with btn-accent → /book + link to the category-mapped service page; BlogPosting JSON-LD (author Organization "Cybexs Tech Team", publisher Cybexs Tech) — BreadcrumbList emitted by the shared Breadcrumbs component, so no duplicate structured data.
- Fixed during QA: title-template duplication (root layout appends "| Cybexs Tech" — index now uses plain title, fallback uses absolute), Tailwind arbitrary grid-cols syntax (commas → underscores).

Stage Summary:
- Article slugs + status (category):
  1. which-business-processes-to-automate-first — PUBLISHED 2025-12-16 (AI Automation)
  2. human-in-the-loop-ai-automation-trust — DRAFT (AI Automation)
  3. ai-voice-agent-small-business-phone — PUBLISHED 2025-12-02 (Voice AI)
  4. reactivate-dormant-leads-compliantly — PUBLISHED 2025-11-25 (Lead Generation)
  5. reminder-sequences-missed-appointments — DRAFT (Lead Generation)
  6. outbound-pipeline-consistency — PUBLISHED 2025-11-11 (Lead Generation)
  7. building-icp-team-uses — DRAFT (Lead Generation)
  8. automate-or-outsource-support — PUBLISHED 2025-12-09 (Customer Support)
  9. support-slas-growing-companies — DRAFT (Customer Support)
  10. crm-integration-patterns-double-entry — PUBLISHED 2025-11-18 (Integrations)
  11. what-a-business-website-must-do — PUBLISHED 2025-11-04 (Web Development; body kept evergreen)
  12. website-redesign-redirect-checklist — DRAFT (Web Development)
- Files created/modified (exact list):
  - src/data/articles.ts (rewritten — content only, exports unchanged)
  - src/app/(site)/insights/page.tsx (new)
  - src/app/(site)/insights/[slug]/page.tsx (new)
  - src/components/site/insight-card.tsx (new)
  - src/components/site/insight-prose.tsx (new)
- No other files/directories touched. Seed run verified: "[seed] articles: 7 published, 5 drafts."
- Verification: bunx eslint on insights routes + articles.ts + components/site → clean (exit 0); bunx tsc --noEmit → zero errors in src/ (remaining diagnostics are pre-existing in examples/, skills/, scripts/ scaffolding); dev-server smoke test: /insights 200 (7 published cards, 0 drafts in markup, category filter works, Blog JSON-LD present), /insights/[published] 200 (BlogPosting + BreadcrumbList JSON-LD, time dateTime, OG article metadata, body markdown links verified), /insights/[draft] 404, /insights/[unknown] 404.
- Notes for other agents: homepage Insights teaser can rely on /insights + /insights/[slug] (this task). Category filter uses ?category= with exact category strings ("AI Automation", "Voice AI", "Lead Generation", "Customer Support", "Integrations", "Web Development").

---

Task ID: 2-c
Agent: frontend-styling-expert (portfolio + 5 concept demo sites)
Task: /work portfolio page, demos root layout (persistent concept-demo banner) and five fully interactive noindex demo sites: Maison Élore (perfume), AURION (automotive), Northbeam (business incubator), SOLSTICE (footwear), Garam Theory (masala)

Work Log:
- Read worklog.md, src/data/demos.ts (registry drives /work), PageHero, CtaSection, Breadcrumbs (Crumb = {name, href}), motion primitives (Reveal/StaggerGroup/StaggerItem/HeroEntrance/PopIn in reveal.tsx; Counter; Marquee), globals.css utilities, root layout (title template "%s | Cybexs Tech" → demos use metadata title.absolute to avoid "| Cybexs Tech | Cybexs Tech" duplication), and shadcn primitives (Dialog/Drawer/Tabs/Accordion/Select/Input/Label — vaul drawer is bottom-anchored by default).
- Created ONE shared demo component outside the per-demo folders: src/components/demos/demo-image.tsx — client next/image wrapper (fill) with onError fallback: if an asset is still generating, the container's CSS gradient (passed via `style`) shows with an uppercase label instead of a broken image. Used by all demos + /work.
- /work: server component inside (site) layout. PageHero (crumbs [Work], eyebrow "Selected work", transparent description); bordered coral-left aside with the exact required honesty note; 5 alternating editorial showcases (12-col grid, lg:order flip) from DEMO_PROJECTS — image with group-hover CSS scale over an accent-tinted gradient, number/category/year rule, display-font brand, accent title (volt #C6FF3E remapped to readable #55700A for text via ACCENT_TEXT map), checklist highlights, accent "Explore the interactive demo →" links; CtaSection("Want work like this for your business?").
- demos/layout.tsx: sticky top-0 z-50 slim dark banner with the exact copy "Concept demo — fictional brand created by Cybexs Tech to demonstrate our design & engineering craft." + pill link "Back to Cybexs Tech" → /work; layout-level robots noindex inherited by all demo pages. Demo pages use `relative` wrappers so their absolute demo-brand headers sit BELOW the banner (banner stays in flow — no overlap math).
- Per-demo art direction (own next/font/google fonts + inline arbitrary palettes, own header/footer, no SiteNavbar/SiteFooter): perfume Cormorant_Garamond+Jost on ivory #F7F3EC/#1C1917/#B49B6C; automotive Oswald+Archivo on #0B0D0C with volt #C6FF3E; incubator Inter+Spectral, white/#FAF7F0/#1E5C3F; footwear Archivo_Black+Inter on #F4F1EA/#FF4D2E; masala Fraunces(italic axis)+Karla alternating #1A0F08/#FBF3E4 with turmeric #E8A020 + chili #C2410C.
- All 5 pages export metadata: { title: { absolute: "Brand — Concept Demo | Cybexs Tech" }, robots: { index: false, follow: false } } and each footer carries the exact note "Fictional concept brand. No real products, orders or payments." + a "More concept work" link to /work.
- Client interactivity (all state local, nothing submitted anywhere):
  - Perfume: PerfumeCartProvider context → collection cards (hover "View" overlay, keyboard-visible via focus-within) open shadcn Dialog with top/heart/base note table + "Add to Discovery Set (demo)" (inline aria-live confirmation); NotesExplorer — 6 note chips (aria-pressed) highlight/dim the 3 fragrances + live count sentence; DiscoverySet panel — items list (scrollbar-slim), remove, total, "Checkout (demo)" → "Demo checkout — no real order is placed…"; editorial story with serif pull-quote.
  - Automotive: hero "SILENT. / VIOLENT." + Counter row (2.4 s / 745 kW / 920 km); Lineup = shadcn Tabs (GT/S/R) with per-model image, specs dl-grid, mount fade via framer-motion (initial={reduce ? false : …}); Performance bars animate width whileInView with a reduced-motion static branch; briefing form (native required validation + shadcn Select) → "Demo form — no data is sent."
  - Incubator: hero + Counter program facts (64/120/12, captioned "Illustrative figures for a fictional organization"); Programs = shadcn Tabs All/Pre-seed/Growth/Sector over 6 cards (featured Foundry spans 2 cols for variation; "View program" expands details with aria-expanded/controls); "A week at Northbeam" schedule rows + space.jpg; ApplicationJourney — 3-step form with progress indicator, per-step validation (role=alert), review step, submit → "Concept demo — applications are not collected…"; 3-item FAQ Accordion.
  - Footwear: FootwearCartProvider; header cart button with count badge opens vaul Drawer (line items, qty +/−, remove, subtotal, "Checkout (demo)" → "Demo checkout — no real order."); marquee strip via shared Marquee (includes "Demo store — nothing is for sale"); shop grid with category filter buttons, per-card EU 39–45 size radiogroup, "Add to cart" disabled until size chosen, brief "Added ✓" state via timeout (cleaned up on unmount), ink promo tile for grid variation; honest About section.
  - Masala: 5-step heat selector (Mild→Fiery) live-filters (hides blends above heat + "Show everything" reset) and re-sorts by closeness, cards show 5 heat dots + "Add to tin (demo)" inline confirm; recipe pairing Tabs (3 methods + "Pairs with" aside); theory editorial with PopIn pull-quote; newsletter form → "Demo — not subscribed anywhere."
- QA fix found during smoke test: absolute demo headers originally anchored to the initial containing block (would have slid under the sticky banner) → added `relative` to the three demo wrappers; added italic style axis to Fraunces for the hero em/pull-quote.
- Verification: `bunx eslint src/app/demos src/components/demos "src/app/(site)/work"` → exit 0 (clean); `bunx tsc --noEmit` → zero errors in src/ (remaining diagnostics pre-existing in examples/, skills/, scripts/ scaffolding — image-gen script belongs to the imagery task); dev-server smoke test of all routes → /work 200 + "Selected Work — Concept Demo Projects | Cybexs Tech" title; all five /demos/* 200 with correct titles, "noindex, nofollow" robots meta, banner text + "Back to Cybexs Tech" present, and the footer note present on every demo. No errors in dev.log for my routes. (GET / 500 in dev.log is Task 2-a/2-d territory: trackEventClient() called from a server component in src/app/(site)/page.tsx — NOT touched from here.) Dev server stopped after checks.

Stage Summary:
- Files created (exact list; no other files/directories touched):
  - src/app/(site)/work/page.tsx
  - src/app/demos/layout.tsx
  - src/app/demos/perfume/page.tsx
  - src/app/demos/automotive/page.tsx
  - src/app/demos/business-incubator/page.tsx
  - src/app/demos/footwear/page.tsx
  - src/app/demos/masala/page.tsx
  - src/components/demos/demo-image.tsx (shared, new)
  - src/components/demos/perfume/{data.ts, cart.tsx, collection.tsx, notes-explorer.tsx, discovery-set.tsx}
  - src/components/demos/automotive/{data.ts, lineup.tsx, performance.tsx, briefing-form.tsx}
  - src/components/demos/business-incubator/{programs.tsx, application.tsx}
  - src/components/demos/footwear/{data.ts, cart.tsx, cart-drawer.tsx, header.tsx, shop.tsx}
  - src/components/demos/masala/{data.ts, spice-shop.tsx, recipes.tsx, newsletter.tsx}
- Notes for other agents: (1) demo pages import motion primitives from reveal.tsx (Reveal/Stagger*/HeroEntrance/PopIn) — no new motion files created; (2) demo cart state is in-memory only, deliberately not persisted; (3) images are coded against public/demo-assets/<slug>/… exactly as specced — until Task 2's generator finishes, DemoImage renders the gradient fallback by design; (4) the / route 500 (trackEventClient in server HomePage) predates this task and was not repaired here to respect file ownership.

---
Task ID: 9-10 (integration + verification)
Agent: lead (Z.ai Code orchestrator)
Task: Integration, SEO layer, seeding, lint, full browser verification

Work Log:
- Fixed cross-agent issues: homepage server-component onClick handlers → created src/components/site/tracked-link.tsx (client wrapper) and replaced usages; confirmed cta-section.tsx converted to client component by 2-b; deleted scaffold src/app/page.tsx (duplicate / route, done by 2-a, verified).
- Reduced-motion lint fix in motion/counter.tsx (setState in effect → rAF).
- Generated all 18 demo/portfolio images via image-generation SDK (scripts/generate-demo-images.ts; sizes corrected to 32px multiples: 1440x704/1344x768/1024x1024) in public/demo-assets/<slug>/.
- Generated branded OG image 1200x630 from white wordmark on ink grid (scripts/generate-og.ts) and wired into root layout OpenGraph/Twitter metadata.
- SEO layer: src/app/sitemap.ts (61 URLs: statics + 7 services + 28 subservices + 8 industries + 7 published articles; demos/admin excluded), robots.ts (admin/api/demos disallowed), manifest.ts, branded not-found.tsx; removed conflicting static public/robots.txt.
- Seeded DB (admin + 7 published/5 draft articles). Full-project lint clean; tsc clean in src/.
- Browser verification (agent-browser): homepage hero/scroll reveals, services/service-detail/industries/insights/article/contact/about/faqs/work all render; mobile 390px homepage + menu + /book + demo verified; /book 2-step flow → lead persisted (status NEW, emailStatus SKIPPED_NO_PROVIDER honest); dedup returns existing lead; contact form → success card with reference; /admin login → overview stats → leads table filters/quick-status → lead detail (status change + note + system note) → CSV export (auth 200 with notes, anon 401) → CMS 12 articles listed → team page; all 5 demos render with distinct art direction + concept banner; footwear filter→size→cart drawer→demo checkout verified; masala heat filter verified; demos noindex meta confirmed; BlogPosting JSON-LD confirmed; validation field errors confirmed; no runtime errors in dev.log.

Stage Summary:
- All 10 routes groups + 5 demos + admin verified working end-to-end in the browser.
- Honest states confirmed: email SKIPPED_NO_PROVIDER, Cal.com "being connected" panel, no fabricated testimonials/stats anywhere.
- Handover docs: README.md (architecture, run/deploy steps, verified-vs-pending), .env.example.
- Pending external setup: Supabase Postgres, Cal.com event URL, Resend keys, production DNS, LinkedIn URL.

---
Task ID: 6 (debug session)
Agent: lead (Z.ai Code orchestrator)
Task: Debug Vercel 404 NOT_FOUND at https://cybexs.tech/

Work Log:
- Diagnosed: Vercel-branded 404 (bom1 edge) means DNS reaches Vercel but NO successful production deployment serves the domain; the Next.js app is never reached
- Found repo-breaking issues for Vercel builds:
  - next.config.ts had output:"standalone" (self-host mode; breaks Vercel build output → whole-deployment 404)
  - package.json build script chained sandbox-only `cp -r .next/standalone` steps that fail the build when the dir is absent
  - Prisma client was constructed at module import → missing DATABASE_URL in fresh CI would crash the build
- SECURITY: .env with real SESSION_SECRET/ADMIN_PASSWORD/DATABASE_URL was committed to git → untracked via git rm --cached (secrets must be rotated if the repo was pushed)
- Fixes committed (c17b22f): conditional standalone (skipped when VERCEL=1), clean `build` script + new `build:selfhost`, postinstall prisma generate, import-safe lazy db Proxy
- Verified: lint clean, dev server restarted on new config, GET / 200, Prisma queries healthy
- NOTE: repo has NO git remote — deployment must be re-imported/pushed from GitHub with this commit; production DB must move SQLite → Supabase Postgres (runtime SQLite is read-only/ephemeral on Vercel)

Stage Summary:
- Vercel 404 root cause: no successful production deployment for cybexs.tech; repo-side blockers fixed in commit c17b22f
- Remaining user-side steps: push to GitHub → re-import on Vercel → set env vars (DATABASE_URL Postgres, SESSION_SECRET, NEXT_PUBLIC_SITE_URL=https://cybexs.tech) → switch prisma provider to postgresql + db push + seed → assign cybexs.tech domain in Vercel → rotate leaked secrets

---
Task ID: 7 (drag-and-drop deployment prep)
Agent: lead (Z.ai Code orchestrator)
Task: Make the project compatible with Vercel drag-and-drop ("Vercel Drop") deployment

Work Log:
- Verified via browser: Vercel Drop (vercel.com/drop) = drag file/folder/.zip, "no configuration"; Vercel also ships "Vercel Plugin" (new agent tooling) and tmp.now no-account CLI deploys; `npx plugins add vercel/vercel-plugin` was NOT a valid deploy step
- Added prisma binaryTargets ["native", "rhel-openssl-3.0.x"] — engines verified emitted for both sandbox and Vercel/Amazon Linux 2023 runtimes
- Added outputFileTracingIncludes for .prisma client + engines on all DB routes (runtime-selected binaries are invisible to the static tracer)
- Fabricated .vercel/project.json placeholder settings → `vercel build --prod` SUCCEEDED in 33s, producing a valid Build Output API bundle (.vercel/output: config.json v3, static/, functions/ with Next 16 shared-function symlinks + deploy-manifest v2.0)
- Noted: Prisma engines are not copied into Next 16 shared-function layout — resolved at deploy time via the dependency manifest (or when Vercel builds source natively)
- Packaged artifacts: cybexs-tech-source.zip (3.2MB clean project: src/public/prisma/db/configs/bun.lock; excludes node_modules/.next/.git/.env/sandbox folders) + cybexs-tech-prebuilt.zip (16MB BOAPI bundle)
- Fixed lint regression: added .vercel/** to eslint ignores; lint clean again; dev server healthy (GET / 200)

Stage Summary:
- User-facing plan: login at vercel.com → drop cybexs-tech-source.zip (primary; Vercel detects Next.js and builds) → fallback cybexs-tech-prebuilt.zip → then attach cybexs.tech domain + set env vars (SESSION_SECRET etc.) → connect Supabase Postgres for live forms/admin
- Local .vercel/project.json is a placeholder for offline vercel build only; never commit real link data
