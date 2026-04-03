---
name: crud
description: Scaffold CRUD routes and UI for an existing model and table.
---

# Scaffold a full CRUD feature

Use this when the user wants list/create/edit/delete pages for a resource that already has a table, model, and validators.

## Required inputs

- Resource name (e.g. `notes`, `projects`, `tasks`)
- Confirmation that the table, insert/update model, and validators already exist
- Whether the resource belongs to a user

## Instructions

1. Ask the user what the resource is (e.g., "notes", "projects", "tasks").
2. Confirm the table, insert/update model, and validators already exist.
3. If they do not exist yet, stop and use the `/model` skill first.
4. Ask if it belongs to a user (most do).
5. Create everything below.

## Step 1: Confirm the model exists

Before writing routes, verify these already exist:

- Table in `app/.server/db/schema.ts`
- Insert/update validators in `app/.server/db/validators/{name}.ts` (re-exported from `app/.server/db/validators.ts`)
- Model in `app/models/.server/{name}.ts`

If any are missing, create them with the `/model` skill first, then continue.

## Step 2: Routes

Create routes under `app/routes/app/` (already protected by middleware).

- For a real CRUD feature, prefer a folder-based route group from the start.
- Use flat dot-notation files only when the route is truly isolated and unlikely to gain siblings.

For a resource called "notes", create these files:

- `app/routes/app/notes/index.tsx` — list page (`/app/notes`)
- `app/routes/app/notes/new.tsx` — create page (`/app/notes/new`)
- `app/routes/app/notes/$id/index.tsx` — detail/edit page (`/app/notes/:id`)

If the feature grows, add sibling routes inside the same group instead of reorganizing later:

- `app/routes/app/notes/$id/history.tsx`
- `app/routes/app/notes/$id/settings.tsx`

### List page: `app/routes/app/notes/index.tsx`

```tsx
import { requireUser } from '~/.server/auth/middlewares'
import { Note } from '~/models/.server/note'

export async function loader({ context }) {
  let user = requireUser(context)
  let notes = await Note.newest({ where: { user_id: user.id } })
  return { notes }
}

export default function Page({ loaderData: { notes } }) {
  return (...)
}
```

### Create page: `app/routes/app/notes/new.tsx`

```tsx
import { redirectWithSuccess } from 'remix-toast'
import { requireUser } from '~/.server/auth/middlewares'
import { noteInsertSchema } from '~/.server/db/validators'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { Note } from '~/models/.server/note'

export async function action({ request, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let { data, errors } = validate(payload, noteInsertSchema)
  if (errors) return { errors }

  let note = await Note.create({ ...data, user_id: user.id })
  return redirectWithSuccess(`/app/notes/${note.public_id}`, 'Note created')
}

export default function Page({ actionData }) {
  // Form with fields, show actionData?.errors per field
  return (...)
}
```

### Detail/edit page: `app/routes/app/notes/$id/index.tsx`

```tsx
import { redirectWithSuccess } from 'remix-toast'
import { requireUser } from '~/.server/auth/middlewares'
import { noteUpdateSchema } from '~/.server/db/validators'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { Note } from '~/models/.server/note'

export async function loader({ params, context }) {
  let user = requireUser(context)
  let note = await Note.findByOrThrow({ public_id: params.id, user_id: user.id })
  return { note }
}

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let note = await Note.findByOrThrow({ public_id: params.id, user_id: user.id })
  let payload = await payloadFromRequest(request)

  if (payload.intent === 'delete') {
    await Note.delete(note.id)
    return redirectWithSuccess('/app/notes', 'Note deleted')
  }

  let { data, errors } = validate(payload, noteUpdateSchema)
  if (errors) return { errors }

  await Note.update(note.id, data)
  return redirectWithSuccess(`/app/notes/${note.public_id}`, 'Note updated')
}

export default function Page({ loaderData: { note }, actionData }) {
  return (...)
}
```

## Step 3: Navigation

Add a link to the list page in the app layout or navbar if one exists.

## Rules

- Always scope queries by `user_id` for user-owned resources.
- Use `public_id` in URLs, never numeric `id`.
- Use `findByOrThrow` with both `public_id` and `user_id` to prevent unauthorized access.
- Dynamic route param naming:
  - For a simple single-resource CRUD route, `$id` is fine.
  - In Gista.js, that simple `$id` route param will often map to `public_id` in queries, not the numeric database `id`.
  - If the CRUD flow is nested under another dynamic route or multiple params could coexist, use descriptive `snake_case` names like `$note_id`, `$project_id`, `$task_id`.
  - Match the param name you choose in loader/action code instead of assuming `params.id`.
- Reuse the existing insert/update schemas from `app/.server/db/validators.ts` instead of redefining route-level validation.
- Prefer grouped folders for CRUD resources so list, create, and detail routes share one clear prefix from the start.
- Use `redirectWithSuccess` / `redirectWithError` from `remix-toast` for feedback.
- Use `payloadFromRequest` to parse form data, `validate` with the Zod schema.
- Return `{ errors }` from actions for form validation — components read `actionData?.errors`.
- Use daisyUI classes for all UI.
