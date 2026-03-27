import { Link, redirect } from 'react-router'
import { getUser } from '~/.server/auth/cookie'

export async function loader({ request }) {
  let user = await getUser(request)
  if (user) throw redirect('/forms')
  return null
}

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-4">
        <p className="badge badge-outline">Gista.js Form Starter</p>
        <h1 className="text-5xl font-bold text-balance">
          Forms, submissions, and analytics are ready to ship.
        </h1>
        <p className="max-w-2xl text-base-content/70">
          Start with a real forms product: templates, builder, public share
          links, response tables, and availability polls on top of the auth
          foundation.
        </p>
      </header>

      <section className="grid gap-4 rounded-box border border-base-300 bg-base-100 p-6 md:grid-cols-3">
        <div>
          <h2 className="font-semibold">Build fast</h2>
          <p className="mt-2 text-sm text-base-content/70">
            Start from contact, feedback, bug report, and availability poll
            templates.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Share publicly</h2>
          <p className="mt-2 text-sm text-base-content/70">
            Publish forms under `/f/:public_id` while keeping editing under
            `/forms`.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Own the data</h2>
          <p className="mt-2 text-sm text-base-content/70">
            Everything is backed by starter-local SQLite tables, not demo
            lifecycle state.
          </p>
        </div>
      </section>

      <div className="flex gap-3">
        <Link to="/signup" className="btn btn-primary">
          Sign up
        </Link>
        <Link to="/login" className="btn">
          Log in
        </Link>
      </div>
    </main>
  )
}
