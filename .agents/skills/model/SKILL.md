---
name: model
description: Create or update a database table, its validators, and its server model, including changes to existing table-backed fields and behavior. Also covers Atlas migrations.
---

- `.agents/skills/model/migrate.md` — Atlas declarative migrations (no migration files, `atlas schema apply` only)

# Scaffold a new database model

Use this when the user needs a new database table or changes to an existing table-backed model. This skill covers schema, validators, and server model work. It does not create route files or UI.

Use this skill when a request:

- Adds or changes columns on an existing table
- Adds or changes model methods in `app/models/.server/*`
- Needs validator updates for a table-backed resource
- Touches model-layer behavior for an existing database-backed feature

Do not skip this skill just because the resource already exists.

## Required inputs

- Resource name
- Extra columns beyond the standard fields
- Whether the resource belongs to a user

## Instructions

1. Identify the resource being created or changed.
2. Identify what schema, validator, or model-layer changes are needed.
3. Confirm whether the resource belongs to a user when that affects the data shape.
4. Create or update the table, validators, and model.

## Step 1: Add table to schema

If the table already exists, update the existing schema file instead of creating a new one. Keep changes minimal and aligned with the request.

Edit `app/.server/db/schema.ts`. Import helpers from `./helpers` and add:

```ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { defaultHex, defaultNow, foreign, id, idx } from './helpers'

export const notes = sqliteTable(
  'notes',
  {
    id: id(),
    public_id: defaultHex(),
    user_id: foreign(() => users),
    title: text().notNull(),
    body: text(),
    bag: text({ mode: 'json' }).$type<NoteBag>(),
    created_at: defaultNow(),
    updated_at: defaultNow(),
  },
  (t) => [idx(t, 'user_id'), idx(t, 'created_at')],
)

export type NoteBag = {
  // add fields here as needed
}
```

**Column helpers from `./helpers`:**

- `id()` — auto-increment integer primary key
- `defaultHex(length?)` — unique hex string (default 12 chars), for public-facing IDs
- `defaultNow()` — timestamp that defaults to current time
- `timestamp()` — nullable timestamp
- `foreign(() => table)` — integer FK with cascade delete
- `idx(t, col)` — index on a column
- `unq(t, col)` — unique index on a column

**Always include:** `id`, `public_id`, `bag`, `created_at`, `updated_at`. Add `user_id: foreign(() => users)` if the resource belongs to a user.

**`bag` column:** A catch-all JSON column (`text({ mode: 'json' }).$type<{Resource}Bag>()`) included on every resource table. Use it to store loosely-structured data before the use case stabilizes — avoids ALTER TABLE churn. Define a `{Resource}Bag` type exported next to the table and add fields as needed.

**Naming:** The JS export name must match the SQL table name exactly. `createModel` uses `getTableName()` (which returns the SQL name) to look up the table in `db.query` (which is keyed by JS export name). If they differ, the model will fail at runtime with "Model {name} not found". Use `snake_case` for both: `export const forms = sqliteTable('forms', ...)`.

Keep the schema minimal. Do not add columns, indexes, or custom model methods the user did not ask for.

## Step 2: Add validators

If validators already exist, update them instead of recreating them.

Create `app/.server/db/validators/{name}.ts` and re-export from `app/.server/db/validators.ts`.

```ts
// app/.server/db/validators/notes.ts
import { createInsertSchema } from 'drizzle-zod'
import { notes } from '../schema'

export const noteInsertSchema = createInsertSchema(notes, {
  title: (z) => z.trim().min(1, 'Title is required'),
  body: (z) => z.trim(),
})

export const noteUpdateSchema = noteInsertSchema
  .pick({ title: true, body: true })
  .partial()
```

Then add the re-export to `app/.server/db/validators.ts`:

```ts
export * from './validators/notes'
```

Use `createInsertSchema` for the base, then derive the update schema with `.pick().partial()` instead of `createUpdateSchema`.

## Step 3: Create the model

If the model already exists, extend it in place and prefer going through the existing model/base-model layer rather than reaching directly for lower-level DB writes unless the user explicitly asks for that.

Create `app/models/.server/{name}.ts`:

```ts
import { notes } from '~/.server/db/schema'
import { createModel } from './base'

const base = createModel(notes)

export const Note = {
  ...base,
}
```

Add custom methods only if the user needs them. The base model provides: `findBy`, `findByID`, `findByPublicID`, `findByOrThrow`, `findAll`, `findAllBy`, `newest`, `oldest`, `create`, `createMany`, `update`, `delete`, `count`.

When updating nested JSON fields like `bag.*`, prefer the base model's `updateJson` helper over `update` with manual object spreads. Use `update` for top-level columns and `updateJson(self, 'bag.path', data)` for nested JSON writes unless there is a specific reason not to.

## Rules

- Do not create route files here. Use `/route` for that.
- Put tables in the starter's existing `app/.server/db/schema.ts` file. Do not invent a per-table schema directory if the starter does not already use one.
- Reuse helpers from `app/.server/db/helpers.ts`. Do not hand-roll IDs, timestamps, or FKs.
- Keep validators in `app/.server/db/validators/{name}.ts`, re-exported from `validators.ts`.
- Keep custom model methods out unless the user asked for behavior beyond the base model.
- For updates to existing resources, read the current schema/model files first and preserve the existing abstraction layers.
- Prefer `updateJson` for nested JSON changes instead of spread-merging JSON blobs through `update`.
