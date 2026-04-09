# Form Starter

Ship a real forms product from day one. Builder, public sharing, submissions, and analytics — with user logins, database, and deployment included. All yours.

![Form Starter](https://public.gistajs.com/images/starters/form.png)

## Quick Start

Need help getting set up? Follow the step-by-step guide at https://gistajs.com/learn.

```bash
npx gistajs create <my-app> --starter form
cd <my-app>
pnpm dev
```

Two seeded users are ready to go:
`alice@example.com` / `password` and `bob@example.com` / `password`.

## What's included

**The forms product**

- Template-led form builder
- Public fill route at `/f/:public_id`
- Submissions table and built-in analytics
- Availability poll support

**The full stack underneath**

- React Router v7 SSR
- Drizzle ORM + SQLite + Atlas migrations
- Cookie session auth (email/password + Google & GitHub OAuth)

## Going to production

Provision a hosted Turso database, pick a shared region, and sync env vars to Vercel

```bash
pnpm provision
```

- `pnpm db:reset` — reset the local DB and re-seed Alice/Bob for a clean start
- Verify/reset links are logged to server output until you configure `SMTP_CONFIG`.
- Update `app/config/.server/email.ts` to a sender your SMTP provider accepts before shipping auth emails.

## Issues

Issues are welcome in this repository if something looks off.

Direct PRs are not accepted here.
