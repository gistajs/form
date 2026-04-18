# Changelog

Release history for the Form starter.

## 2026-04-18

Updated auth email tooling to React Email 6

- Auth email templates and server-side rendering now use React Email 6's unified `react-email` package.

Breaking change.

Upgrade notes:
If you customized the shipped email templates or render helpers, replace imports from `@react-email/components` and `@react-email/render` with `react-email`, and replace `@react-email/preview-server` with `@react-email/ui`.

## 2026-04-17

Smaller starter install footprint

- Starter repos no longer ship a committed `pnpm-lock.yaml`, so your first `pnpm install` generates a fresh lockfile pinned to the current versions.
- Some starters no longer depend on `vite-plugin-devtools-json`; the Chrome DevTools workspace endpoint is now served by a small built-in plugin.

Fixed a dark mode hydration warning in form and AI starters

- Removed a rare React hydration warning that could appear in the browser console on first load.

## 2026-04-11

Made auth email links single-use

- Verification and password reset links now rotate after a successful use, so the same email link cannot be reused until it expires.
- Email verification keeps its confirm step, but only the final submit consumes the token.

## 2026-04-09

Simplified starter Vite path resolution

- Starter projects now rely on Vite's built-in tsconfig path resolution for `~/*` imports instead of an extra plugin dependency.
- New starter installs no longer include `vite-tsconfig-paths`, reducing one piece of Vite setup to maintain.

## 2026-04-06

Added a route error boundary to the form starter

- The form starter now exports an app-level error boundary with a friendlier 404 state and a fallback message for unexpected failures.

## 2026-04-05

Standardized Claude instructions across starters

- Starter repos now consistently include `CLAUDE.md`, so Claude can find the same project instructions already provided in `AGENTS.md`.

Simplified starter route skills

- Starter skills now use a single `/route` entry point for single-route scaffolding, CRUD route flows, and auth protection guidance.
- The `/model` skill now points Atlas setup and apply guidance to a colocated migration reference.

## 2026-04-04

Made production Atlas apply non-interactive

- `pnpm prep:prod` now auto-approves `atlas:prod` instead of stopping at an approval prompt.

Fixed production prep database targeting

- `pnpm prep:prod` now checks and seeds your hosted database instead of local `dev.db`.

Added production prep for hosted setup

- `pnpm provision` can now run `pnpm prep:prod` before syncing Vercel env vars.
- `pnpm prep:prod` applies production Atlas and seeds initial users only when the hosted database is empty.

Added shared Turso and Vercel provisioning

- `pnpm provision` now asks for a shared deployment region and remembers it for later runs.
- Provisioning creates a matching Turso group when needed, saves database credentials to `.env`, and syncs app secrets to Vercel production.

## 2026-04-03

Moved Turso provisioning out of prep

- `pnpm prep` is now focused on repeatable local setup: `.env`, `COOKIE_SECRET`, Atlas, seed users, and optional `SMTP_CONFIG`.
- Added `pnpm db:provision` so you can create a Turso database on demand and write `DB_URL` plus `DB_AUTH_TOKEN` to `.env`.

Upgraded all starters to Vite 8

- New starter projects now ship with Vite 8
- Companion tooling was refreshed alongside the Vite upgrade so starter dev, build, and typecheck workflows stay aligned.

## 2026-04-02

Added Turso and email provisioning to setup

- Running `pnpm prep` now optionally creates a Turso database and can capture `SMTP_CONFIG`, writing credentials directly to `.env`.
- Auth emails (verification, password reset) now use email configuration from `SMTP_CONFIG`. Without it, links are still logged to the console.
- Added a starter-local auth sender in `app/config/.server/email.ts`.

Breaking change.

Starter templates now ship upgrade pin metadata

- Exported starter `package.json` files now include `gistajs.pin`, so projects created from GitHub templates and CLI scaffolds start with the same upgrade baseline metadata.

## 2026-04-01

Polished the form starter shell and theme controls

- Added dark mode with system preference detection and a manual light, dark, or system switcher.
- Added a global navigation progress bar during page transitions.
- Added snappier control transitions, and custom indigo light/dark theme tokens.
- Added a sticky navbar with user avatar dropdown and logout across form starter pages.
- Redesigned the landing page from scaffold to a product-forward layout with hero.

## 2026-03-30

Added name field to starter skills for CLI compatibility

- Skills now include a `name` field in SKILL.md frontmatter, required by `npx skills add` for discovery and installation.

## 2026-03-29

Aligned the new-form builder on large screens

- The new-form toolbar now stays visually aligned with the live preview column on large screens, making the builder layout feel steadier while editing.

Smoothed auth history behavior

- Auth flows now use replace-style navigation for auth success and auth-internal form submits, so transient login and signup steps collapse out of browser history more cleanly.

## 2026-03-28

Improved auth and form starter setup

- `pnpm prep` now applies Atlas automatically and seeds verified local users Alice and Bob in the `form` starter.
- Added `pnpm db:reset` to recreate `data/dev.db`, reapply Atlas, and reseed the local users.
- Improved shared starter auth behavior while keeping each starter's product pages and setup flow tailored to its use case.

## 2026-03-27

Added the Form starter and shared auth composition

- Added a new free `form` starter with forms, submissions, public fill pages, and analytics.
- `auth` and `form` now share the same auth foundation and auth flow behavior.
- Added sync and release coverage for `gistajs/form`.

Added starter release tags and sync polish

- Starter repos now publish release tags.
- Removed generated README timestamps so unchanged starter exports can skip no-op branch publishes.
- Starter READMEs now direct contributors to open issues and not direct PRs.

## 2026-03-17

Updated starter skills

- Updated route and CRUD skills to prefer grouped folders for route clusters.
- Clarified dynamic route param naming, including when to use `$id` versus descriptive snake_case params.
- Documented that simple `$id` params often map to `public_id` in Gista.js starters.

## 2026-03-16

Started publishing starter changelogs

- Added generated CHANGELOG.md output to exported starter repos.
