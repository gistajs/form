# Add Auth Protection to a Route

Use this when a route already exists and needs login protection. Do not use it to scaffold a new page from scratch.

## Required inputs

- Route file to protect
- Whether it already lives under `app/routes/app/`
- Whether protection should apply to one route or a whole folder

## Instructions

1. Ask the user which route file to protect (or identify it from context).
2. Determine whether the route is already under a protected layout.
3. Apply the smallest change that matches the route location.

## Strategy A: Route is under `app/routes/app/`

These routes are already protected by the middleware in `app/routes/app/_layout.tsx`. Just access the user from context in the loader:

```tsx
import { requireUser } from '~/.server/auth/middlewares'

export async function loader({ context }) {
  let user = requireUser(context)
  return { user }
}
```

If the route has no loader, add one. If it already has a loader, add `let user = requireUser(context)` at the top.

## Strategy B: Route is outside `app/routes/app/`

Use the cookie helper directly:

```tsx
import { requireUser } from '~/.server/auth/cookie'

export async function loader({ request }) {
  let user = await requireUser(request)
  return { user }
}
```

Note: this is `await requireUser(request)` — async with request, not context.

## Strategy C: Protect an Entire Folder

Create or edit `_layout.tsx` in the folder:

```tsx
import { Outlet } from 'react-router'
import { requireUserMiddleware } from '~/.server/auth/middlewares'

export const middleware = [requireUserMiddleware]

export default function Layout() {
  return <Outlet />
}
```

Then child routes use `requireUser(context)` (Strategy A).

## Optional auth (show user if logged in)

```tsx
import { getUser } from '~/.server/auth/cookie'

export async function loader({ request }) {
  let user = await getUser(request)
  return { user }
}
```

## Rules

- Prefer protecting the smallest scope that solves the task. Do not add a new protected layout unless multiple sibling routes need it.
- Never use `requireUser(request)` inside a middleware-protected layout — use `requireUser(context)` instead.
- Never call both `requireUser(context)` and `requireUser(request)` for the same route.
- Do not move or rename routes just to protect them.
- For access denial on specific resources, throw `notFoundError()` from `~/lib/.server/errors`, not `data()`.
