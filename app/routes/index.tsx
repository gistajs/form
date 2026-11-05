import {
  BarChart3Icon,
  BugIcon,
  CalendarCheck2Icon,
  ClipboardListIcon,
  DatabaseIcon,
  FilePlus2Icon,
  LinkIcon,
  MailIcon,
} from 'lucide-react'
import { Link, redirect } from 'react-router'
import { getUser } from '~/.server/auth/cookie'
import { cn } from '~/lib/cn'
import { AppShell } from '~/ui/app-shell'

export async function loader({ request }) {
  let user = await getUser(request)
  if (user) throw redirect('/forms')
  return null
}

export default function Page() {
  return (
    <AppShell>
      <Hero />
      <Templates />
      <Features />
      <Trust />
      <Cta />
      <Footer />
    </AppShell>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="max-w-xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Open-source form builder
          </p>
          <h1 className="mt-4 text-4xl leading-[1.1] font-bold tracking-tight text-balance md:text-6xl">
            Build forms. Collect responses. Own your data.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-base-content/70">
            Five templates, a drag-and-drop builder, public share links,
            response analytics, and availability polls — all backed by your own
            SQLite database.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn btn-lg btn-primary">
              Get started
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <MockFormCard />
        </div>
      </div>
    </section>
  )
}

function MockFormCard() {
  return (
    <div className="relative mx-auto w-80">
      <div className="rotate-2 rounded-2xl border border-base-300 bg-base-100 shadow-2xl">
        <div className="relative h-44 overflow-hidden rounded-t-2xl bg-[linear-gradient(135deg,#dcfce7,#dbeafe)] dark:bg-[linear-gradient(135deg,oklch(0.3_0.05_155),oklch(0.27_0.04_240))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_50%)]" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-base-100/80 px-2.5 py-1 text-xs font-medium text-base-content shadow-sm backdrop-blur-sm">
            <MailIcon className="size-3 text-primary" />
            Contact
          </div>
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/50 bg-base-100/85 p-3 shadow-lg backdrop-blur-sm">
            <div className="h-2 w-1/2 rounded-full bg-base-300" />
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-[42%] rounded-full bg-base-200/90" />
              <div className="h-1.5 w-[88%] rounded-full bg-base-200/90" />
              <div className="h-1.5 w-[70%] rounded-full bg-base-200/90" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <MockField label="Your name" />
          <MockField label="Email address" />
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-base-content/65">
              Message
            </div>
            <div className="h-16 rounded-xl bg-base-200/80" />
          </div>
          <div className="h-10 rounded-xl bg-primary/90" />
        </div>
      </div>
    </div>
  )
}

function MockField({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-base-content/65">{label}</div>
      <div className="h-10 rounded-xl bg-base-200/80" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

let templates = [
  {
    id: 'blank',
    name: 'Blank form',
    meta: 'Start from zero',
    icon: FilePlus2Icon,
    bg: 'bg-[linear-gradient(135deg,#f9fafb,#eef2ff)] dark:bg-[linear-gradient(135deg,oklch(0.31_0.012_250),oklch(0.24_0.022_285))]',
    lines: ['45%', '78%', '64%'],
  },
  {
    id: 'contact',
    name: 'Contact form',
    meta: 'Every website needs one',
    icon: MailIcon,
    bg: 'bg-[linear-gradient(135deg,#dcfce7,#dbeafe)] dark:bg-[linear-gradient(135deg,oklch(0.3_0.05_155),oklch(0.27_0.04_240))]',
    lines: ['42%', '88%', '70%'],
  },
  {
    id: 'availability',
    name: 'Availability poll',
    meta: 'Group scheduling',
    icon: CalendarCheck2Icon,
    bg: 'bg-[linear-gradient(135deg,#fef3c7,#fee2e2)] dark:bg-[linear-gradient(135deg,oklch(0.31_0.05_85),oklch(0.28_0.045_25))]',
    lines: ['36%', '82%', '58%'],
  },
  {
    id: 'feedback',
    name: 'Feedback survey',
    meta: 'Capture client priorities',
    icon: ClipboardListIcon,
    bg: 'bg-[linear-gradient(135deg,#ede9fe,#fce7f3)] dark:bg-[linear-gradient(135deg,oklch(0.3_0.05_295),oklch(0.28_0.045_340))]',
    lines: ['40%', '92%', '68%'],
  },
  {
    id: 'bug',
    name: 'Bug report',
    meta: 'Team issue tracker',
    icon: BugIcon,
    bg: 'bg-[linear-gradient(135deg,#e2e8f0,#dbeafe)] dark:bg-[linear-gradient(135deg,oklch(0.28_0.03_225),oklch(0.31_0.05_255))]',
    lines: ['34%', '76%', '86%'],
  },
] as const

function Templates() {
  return (
    <section className="border-t border-base-300/40 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight text-balance">
          Start from a template, or start from scratch
        </h2>
        <p className="mt-3 max-w-xl text-base-content/60">
          Five ready-made templates for the most common use cases. Pick one and
          customize, or begin with a blank canvas.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TemplateCard({ template }: { template: (typeof templates)[number] }) {
  let Icon = template.icon

  return (
    <div className="group overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <div className={cn('relative h-28 overflow-hidden', template.bg)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_50%)]" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-base-100/80 px-2 py-0.5 text-[10px] font-medium text-base-content shadow-sm backdrop-blur-sm">
          <Icon className="size-3 text-primary" />
          {template.name}
        </div>
        <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/50 bg-base-100/85 p-2 shadow-lg backdrop-blur-sm">
          <div className="h-1.5 w-1/2 rounded-full bg-base-300" />
          <div className="mt-2 space-y-1">
            {template.lines.map((line, i) => (
              <div
                key={i}
                className="rounded-full bg-base-200/90"
                style={{ height: 6, width: line }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="text-sm font-semibold">{template.name}</h3>
        <div className="text-[11px] font-medium text-primary">
          {template.meta}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

let features = [
  {
    icon: LinkIcon,
    title: 'Public share links',
    description:
      'Publish any form at a clean URL. Share the link and start collecting responses immediately.',
    accent: 'text-emerald-500',
    border: 'border-t-emerald-500/40',
  },
  {
    icon: BarChart3Icon,
    title: 'Response analytics',
    description:
      'Tables, summaries, and bar charts for every form. See who submitted what, and when.',
    accent: 'text-blue-500',
    border: 'border-t-blue-500/40',
  },
  {
    icon: CalendarCheck2Icon,
    title: 'Availability polls',
    description:
      'Built-in group scheduling with time slots, timezone support, and a live voting table.',
    accent: 'text-amber-500',
    border: 'border-t-amber-500/40',
  },
] as const

function Features() {
  return (
    <section className="border-t border-base-300/40 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={cn(
                'rounded-2xl border border-t-2 border-base-300 bg-base-100 p-6 shadow-sm',
                f.border,
              )}
            >
              <f.icon className={cn('size-6', f.accent)} />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Trust
// ---------------------------------------------------------------------------

function Trust() {
  return (
    <section className="border-t border-base-300/40 px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-base-200">
          <DatabaseIcon className="size-5 text-base-content/70" />
        </div>
        <h3 className="mt-5 text-xl font-semibold">
          Your data lives in SQLite
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-base-content/60">
          No vendor lock-in, no third-party analytics. Every form and submission
          is stored in your own database, on your own infrastructure.
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------

function Cta() {
  return (
    <section className="border-t border-base-300/40 px-6 py-20 md:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to build your first form?
        </h2>
        <p className="mt-3 text-base-content/60">
          Create an account and launch a form in under a minute.
        </p>
        <Link to="/signup" className="btn mt-8 btn-lg btn-primary">
          Get started
        </Link>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-base-300/40 px-6 py-8">
      <p className="text-center text-xs text-base-content/40">
        Built with Gista.js
      </p>
    </footer>
  )
}
