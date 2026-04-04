---
name: page
description: Scaffold a new route with the correct filename and auth pattern.
---

# Scaffold a new route page

Use this when the user wants one new route or layout file. If they want list/create/edit pages for a resource, use `/crud` instead.

## Required inputs

- URL path
- Whether this is a page route or layout route
- Whether it needs auth protection

## Instructions

1. Ask the user for the URL path (e.g., `/app/notes`, `/about`).
2. Ask whether it is a page route or a layout route.
3. Ask if it needs auth protection.
4. Create the route file using dot notation for nested segments when the route stands alone:
   - `/app/notes` -> `app/routes/app/notes.tsx` (if `app/` folder exists)
   - `/app/notes/:id` -> `app/routes/app/notes.$id.tsx`
   - `/about` -> `app/routes/about.tsx`
   - `/oauth/google/callback` -> `app/routes/oauth/google.callback.ts`
5. When multiple routes share the same static or dynamic prefix, prefer a folder:
   - `/app/forms/:form_id` -> `app/routes/app/forms/$form_id/index.tsx`
   - `/app/forms/:form_id/submissions` -> `app/routes/app/forms/$form_id/submissions.tsx`
   - `/app/forms/:form_id/submissions/:submission_id` -> `app/routes/app/forms/$form_id/submissions/$submission_id.tsx`

## Route file pattern

**Protected route (under an existing middleware layout):**

```tsx
import { requireUser } from '~/.server/auth/middlewares'

export async function loader({ context }) {
  let user = requireUser(context)
  return { user }
}

export default function Page({ loaderData: { user } }) {
  return (
    <main>
      <h1>Page Title</h1>
    </main>
  )
}
```

**Public route (no auth):**

```tsx
export default function Page() {
  return (
    <main>
      <h1>Page Title</h1>
    </main>
  )
}
```

**Layout route (wraps child routes):**

```tsx
import { Outlet } from 'react-router'

export default function Layout() {
  return <Outlet />
}
```

## Rules

- Prefer a single route file for isolated routes.
- Prefer a folder when multiple sibling routes share the same static or dynamic prefix.
- Default export must be named `Page` (or `Layout` for layout files).
- Layout files are named `_layout.tsx`.
- Colocated helpers go in a `+/` folder at the same level.
- Dynamic segment naming:
  - Use `$id` only when there is a single dynamic identifier in scope and the meaning is obvious.
  - In simple Gista.js routes, `$id` commonly maps to `public_id` rather than the numeric database `id`.
  - Use descriptive `snake_case` names like `$form_id`, `$submission_id`, `$user_id` for nested routes or whenever multiple params could be in scope.
  - Match the filename segment name in `params`, for example `params.form_id`.
- Routes under `app/routes/app/` are already protected by the middleware in `app/routes/app/_layout.tsx` — use `requireUser(context)` in loaders, not `requireUser(request)`.
- Routes outside `app/` that need auth should use `requireUser(request)` from `~/.server/auth/cookie` directly.
- If the route does not need loader data, do not add a loader.
- Do not create unnecessary folders for one-off pages, but do use `index.tsx` route folders when a route group shares a prefix.
- Do not create schema, model, or multi-page CRUD flows here.
- Use daisyUI classes for styling. No inline styles.
