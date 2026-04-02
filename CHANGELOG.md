# Changelog

Release history for the Form starter.

## 2026-04-02

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
