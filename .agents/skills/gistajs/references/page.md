# Scaffold a New Route Page

Use this when the user wants one new route or layout file. Not for CRUD flows (use `crud.md`) or adding auth to existing routes (use `protect.md`).

## Required inputs

- URL path
- Whether this is a page route or layout route
- Whether it needs auth protection

## Instructions

1. Determine the URL, page or layout role, and required access from the request and nearby routes. Clarify only unresolved requirements.
2. Create the route file using dot notation for nested segments when the route stands alone:
   - `/app/notes` -> `app/routes/app/notes.tsx` (if it should live under the protected app layout)
   - `/app/notes/:id` -> `app/routes/app/notes.$id.tsx`
   - `/about` -> `app/routes/about.tsx`
   - `/oauth/google/callback` -> `app/routes/oauth/google.callback.ts`
3. When multiple routes share the same static or dynamic prefix, prefer a folder:
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
      <h1>Welcome, {user.name}</h1>
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
- For authentication, inspect matched middleware and apply [protect](protect.md).
- If the route does not need loader data, do not add a loader.
- Do not create unnecessary folders for one-off pages, but do use `index.tsx` route folders when a route group shares a prefix.
- Do not create schema, model, or multi-page CRUD flows here.
- Use daisyUI classes for styling. No inline styles.
