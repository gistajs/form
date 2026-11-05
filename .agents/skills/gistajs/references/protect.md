# Authentication and resource access

Inspect the middleware exported by the matched route and its ancestor layouts. Confirm the application provides the helpers below before using them.

- **Inside a protected layout** such as `app/routes/app/_layout.tsx`, requireUserMiddleware authenticates the cookie and sets the user in context. Loaders and actions that need the user call the synchronous `requireUser(context)` from `~/.server/auth/middlewares`. A child that needs no loader data can omit its loader.
- **Outside protected layouts**, authenticate each protected loader and action with `await requireUser(request)` from `~/.server/auth/cookie`, or export route middleware to cover both. For optional authentication use `getUser(request)`.
- **Protecting a section**, export `middleware = [requireUserMiddleware]` on its layout using `~/.server/auth/middlewares`. Use the smallest scope that fits the request and preserve public siblings.
- **Resource ownership**, scope reads and writes to the authenticated owner. Check in the action even if a parent or detail loader checked the same resource. Use a scoped model lookup that throws 404, or the existing notFoundError helper for inaccessible records.
