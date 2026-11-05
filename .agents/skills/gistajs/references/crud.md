# CRUD routes and forms

Build the requested operations using the resource's existing model and validators. Read [model](model.md) when they need changes and [protect](protect.md) for access control.

## Access and routes

Determine who can list, read, create, update and delete from the request and existing access rules. Ask only about unresolved operations before exposing them. Public reads do not imply public writes. If an operation needs an identified owner and the project lacks authentication, explain that prerequisite and leave that mutation unexposed.

Group related routes under a shared prefix, with index.tsx, new.tsx and $id/index.tsx as needed. Add a navigation link when the flow needs an entry point. Use public_id in resource URLs and descriptive snake_case params for nested resources. Match the layout to the access policy.

For user-owned notes under authenticated middleware:

- Scope the list to the authenticated user's id. On creation, derive user_id on the server.
- In both the detail loader and each mutation action, read the authenticated user and resolve the note with `Note.findByOrThrow({ public_id: params.id, user_id: user.id })`. A parent loader does not authorize child writes.
- Before calling update or delete, inspect the existing model method's identifier, argument order and side effects, including cleanup. Use that method with the authorized record.

## Example: notes owned by the signed-in user

These handlers assume the Note model and validators from [model](model.md), and a layout that already authenticates requests. Place the three files under `app/routes/app/notes/`. Import `Note` from `~/models/.server/note` and `requireUser` from `~/.server/auth/middlewares`. Actions use `payloadFromRequest` from `~/lib/data/payload`, `validate` from `~/lib/data/validate`, the indicated schemas from `~/.server/db/validators`, `badRequestError` from `~/lib/.server/errors`, and `redirectWithSuccess` from `remix-toast`.

**List — `index.tsx`.** Let the model infer the row type.

```ts
export async function loader({ context }) {
  let user = requireUser(context)
  let notes = await Note.findAllBy({ user_id: user.id })
  return { notes }
}
```

When a deletable DataTable posts `verb=delete` to the list action, authenticate the user, parse the posted row ID as a positive safe integer, and reject invalid input with `badRequestError()`. Resolve `let note = await Note.findByOrThrow({ id, user_id: user.id })` and await `Note.delete(note.id)`. After deletion, return `redirectWithSuccess('/app/notes', 'Note deleted')` to show the updated list.

**Create — `new.tsx`.** Accept only editable fields and assign ownership from the session.

```ts
export async function action({ request, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let fields = noteInsertSchema.pick({ title: true, body: true })
  let { data, errors } = validate(payload, fields)
  if (errors) return { errors }

  let note = await Note.create({ ...data, user_id: user.id })
  return redirectWithSuccess(`/app/notes/${note.public_id}`, 'Note created')
}
```

**Detail — `$id/index.tsx`.** Post to the detail URL with a `verb` field: `update` for the edit form or `delete` for the delete form. The route parameter identifies the note; resolve it for the signed-in user inside each handler.

```ts
export async function loader({ params, context }) {
  let user = requireUser(context)
  let note = await Note.findByOrThrow({
    public_id: params.id,
    user_id: user.id,
  })
  return { note }
}

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let note = await Note.findByOrThrow({
    public_id: params.id,
    user_id: user.id,
  })
  let payload = await payloadFromRequest(request)

  if (payload.verb === 'delete') {
    await Note.delete(note.id)
    return redirectWithSuccess('/app/notes', 'Note deleted')
  }
  if (payload.verb !== 'update') throw badRequestError()

  let { data, errors } = validate(payload, noteUpdateSchema)
  if (errors) return { errors }
  await Note.update(note.id, data)
  return redirectWithSuccess(`/app/notes/${note.public_id}`, 'Note updated')
}
```

## Field validation

Bind the title input with `name="title"`. When available, render `<InputError name="title" />` under it, passing the fetcher for a fetcher form. Otherwise render the messages in `actionData?.errors?.title` (or fetcher data) beside the input. Match every field to its validator key. Use Fieldset and Field when they exist. Populate edit inputs from the record. Reserve toast feedback for success and action-level failures.
