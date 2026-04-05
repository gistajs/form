# Form Starter

Auth plus a complete forms product: builder, publish flow, public fill pages, submissions, and analytics.

## Quick Start

1. Setup

```bash
pnpm install
pnpm prep

# Optional: provision a hosted Turso database, pick a shared region,
# and optionally run production setup before syncing Vercel env vars
pnpm provision

# Run production Atlas and seed initial users only when the hosted DB is empty
pnpm prep:prod

# Reset the local DB anytime you want a clean start
pnpm db:reset
```

2. Run locally

```bash
pnpm dev
```

## What's included

- React Router v7 SSR
- Drizzle ORM + Atlas migration flow
- Cookie session auth and OAuth
- Forms and submissions tables
- Template-led form builder
- Public fill route at `/f/:public_id`
- Submissions table and analytics
- Availability poll support
- `pnpm prep` and `pnpm db:reset` seed verified local users:
  `alice@example.com` / `password` and `bob@example.com` / `password`
- `pnpm prep:prod` applies production Atlas and seeds Alice/Bob only when the hosted database is empty.
- `pnpm provision` picks a shared deploy region, uses your nearest Turso region by default when available, creates a Turso group in that region when needed, can run `pnpm prep:prod`, and syncs `COOKIE_SECRET`, `DB_URL`, and `DB_AUTH_TOKEN` to Vercel production envs.
- Verify/reset links are logged to server output until you configure `SMTP_CONFIG`.
- Update `app/config/.server/email.ts` to a sender your SMTP provider accepts before shipping auth emails.

## Issues

Issues are welcome in this repository if something looks off.

Direct PRs are not accepted here.
