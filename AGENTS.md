# Agent Guidelines

Always prefer simplicity over pathological correctness. YAGNI, KISS, DRY. No backward-compat shims or fallback paths unless they come free without adding cyclomatic complexity.

## Commands

- `pnpm tsc` - Run quick type check
- `pnpm dev` - Run dev server
- NEVER run `drizzle-kit` commands (`generate`, `migrate`, `push`) or `atlas schema apply`. Schema migrations are applied manually by the user

## Tech Stack

- React Router v7 (SSR mode)
- daisyUI v5 + Tailwind CSS v4

## Routing and layouts

- File-based Routing with [react-router-auto-routes](https://github.com/kenn/react-router-auto-routes)
- Dots in filenames map to `/` segments relative to the parent folder — e.g. `routes/app/notes.$id.tsx` → `/app/notes/:id`
- A `_layout.tsx` with `<NavLink>` and `<Outlet>` in the same folder creates a nested layout with navigation
- Colocated modules (helpers, hooks, components) go in a `+` folder at the same level as the route
- default export of a route file should be named `Page` or `Layout` for consistency

## Code Style

- **Casing**: Use `camelCase` for variables and functions, `PascalCase` or `SNAKE_CASE` for types and classes, `kebab-case` for file and folder names, `snake_case` for API and persistence keys including DB
- **Formatting**: No semicolons, single quotes, 2-space indent
- **Variables**: Use `let` inside functions, use `const` for top module-level constants only
- **Types**: `any` allowed (`noImplicitAny: false`), especially for routes and React props. Keep function signatures uncluttered; extract complex types above the function rather than inline
- **Naming**: Prefer fewer words — e.g. `name` over `userName`
- **Imports**: NEVER use dynamic imports
- **Tests**: Vitest for testing, tests should be colocated with the code and have `.test.ts` suffix
- **Error Handling**: Minimal try/catch, prefer handling at higher levels
- **Comments**: Preserve existing comments
- **JSX**: Use double quotes for JSX attributes. Always use type aliases for component props (not inline types). Define types at the bottom of the file
- **React 19**: useMemo and useCallback are not needed as they are handled by the React compiler.
- **Colocation**: Single-use components and helpers should be colocated at the bottom of the same file they are used in so that it reveals the details from top to bottom. Extract hooks as much as possible to be self-contained.

## Utilities

- `import { TriangleAlertIcon } from 'lucide-react'` - use lucide-react icons

Follow structure and patterns in existing code when making changes.

## Workflow

- At the end of a session with heavy edits, suggest a one-liner succinct git commit message.
- Default branch is `dev`. Run `pnpm ship` to merge dev→main and deploy to Vercel

## Auth

- Session helpers live in `app/.server/auth/cookie.ts`:
- `requireUser(request)` for protected routes
- `getUser(request)` for optional auth in loaders
- User model lives in `app/models/.server/user.ts`
- Auth routes live under `app/routes/_auth/*`
- OAuth routes live under `app/routes/oauth/*`
- Throw `notFoundError()` instead of `data()` for access denial to avoid incorrect status text
