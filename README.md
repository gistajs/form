# Form Starter

Auth plus a complete forms product: builder, publish flow, public fill pages, submissions, and analytics.

## Quick Start

1. Setup

```bash
pnpm install
pnpm prep

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
- Verify/reset links are logged to server output until you configure `SMTP_CONFIG`.
- Update `app/config/.server/email.ts` to a sender your SMTP provider accepts before shipping auth emails.

## Issues

Issues are welcome in this repository if something looks off.

Direct PRs are not accepted here.
