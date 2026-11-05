import {
  BugIcon,
  CalendarCheck2Icon,
  ClipboardListIcon,
  FilePlus2Icon,
  MailIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { cn } from '~/lib/cn'
import { queryFromPayload } from '~/lib/data/payload'
import { FORM_TEMPLATES } from '../fields'

export function NewFormGallery() {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Start a new form
          </h1>
          <p className="mt-1 text-sm text-base-content/60">
            Pick a starter template or begin with a blank canvas.
          </p>
        </div>
      </div>

      <div className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pt-1 pb-2 [-webkit-overflow-scrolling:touch]">
        {FORM_GALLERY_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="flex w-[min(42vw,11rem)] shrink-0 snap-start flex-col sm:w-44"
          >
            <TemplateCard template={template} />
          </div>
        ))}
      </div>
    </section>
  )
}

function TemplateCard({ template }: { template: GalleryTemplate }) {
  let body = templateCardBody(template)
  let [availabilityPollReady, setAvailabilityPollReady] = useState(false)
  let [availabilityPollStartIso, setAvailabilityPollStartIso] = useState('')
  let [availabilityPollTimeZone, setAvailabilityPollTimeZone] = useState('')

  useEffect(() => {
    if (template.id !== 'availability_poll') return
    let now = new Date()
    let next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      9,
      0,
      0,
      0,
    )
    setAvailabilityPollStartIso(next.toISOString())
    setAvailabilityPollTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    )
    setAvailabilityPollReady(true)
  }, [template.id])

  if (template.id === 'blank') {
    return (
      <Link
        to="/forms/new"
        className={cn(templateShellClass, 'text-left no-underline')}
      >
        <TemplateThumb id={template.id} />
        {body}
      </Link>
    )
  }

  let href = `/forms/new?${queryFromPayload({
    preset_id: template.id,
    ...(template.id === 'availability_poll' && availabilityPollReady
      ? {
          availability_poll_start_at: availabilityPollStartIso,
          availability_poll_time_zone: availabilityPollTimeZone,
        }
      : {}),
  })}`

  if (template.id === 'availability_poll' && !availabilityPollReady) {
    return (
      <div className={cn(templateShellClass, 'opacity-60')}>
        <div className="flex min-h-0 w-full flex-1 cursor-not-allowed flex-col text-left">
          <TemplateThumb id={template.id} />
          {body}
        </div>
      </div>
    )
  }

  return (
    <Link
      to={href}
      className={cn(templateShellClass, 'text-left no-underline')}
    >
      <div className="flex min-h-0 w-full flex-1 cursor-pointer flex-col text-left">
        <TemplateThumb id={template.id} />
        {body}
      </div>
    </Link>
  )
}

function TemplateThumb({ id }: { id: GalleryTemplateId }) {
  let preview = TEMPLATE_PREVIEWS[id]
  let Icon = preview.icon

  return (
    <div className={cn('relative h-28 overflow-hidden', preview.bg)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_50%)]" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-base-100/80 px-2 py-0.5 text-[10px] font-medium text-base-content shadow-sm backdrop-blur-sm">
        <Icon className="size-3 text-primary" />
        {preview.label}
      </div>
      <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/50 bg-base-100/85 p-2 shadow-lg backdrop-blur-sm">
        <div className="h-1.5 w-1/2 rounded-full bg-base-300" />
        <div className="mt-2 space-y-1">
          {preview.lines.map((line, i) => (
            <div
              key={i}
              className="rounded-full bg-base-200/90"
              style={{ height: 6, width: line }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function templateCardBody(template: GalleryTemplate) {
  let preview = TEMPLATE_PREVIEWS[template.id]
  return (
    <div className="space-y-1 p-3">
      <h3 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">
        {template.name}
      </h3>
      <div className="text-[11px] font-medium text-primary">{preview.meta}</div>
    </div>
  )
}

let templateShellClass = cn(
  'group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md',
)

const FORM_GALLERY_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank form',
    description: 'Start from scratch and name it yourself',
  },
  {
    id: FORM_TEMPLATES.contact.id,
    name: FORM_TEMPLATES.contact.name,
    description: FORM_TEMPLATES.contact.description,
  },
  {
    id: FORM_TEMPLATES.availability_poll.id,
    name: FORM_TEMPLATES.availability_poll.name,
    description: FORM_TEMPLATES.availability_poll.description,
  },
  {
    id: FORM_TEMPLATES.feedback.id,
    name: 'Feedback survey',
    description: FORM_TEMPLATES.feedback.description,
  },
  {
    id: FORM_TEMPLATES.bug.id,
    name: 'Bug report',
    description: FORM_TEMPLATES.bug.description,
  },
] as const

const TEMPLATE_PREVIEWS = {
  blank: {
    icon: FilePlus2Icon,
    label: 'Blank',
    meta: 'Start from zero',
    bg: 'bg-[linear-gradient(135deg,#f9fafb,#eef2ff)] dark:bg-[linear-gradient(135deg,oklch(0.31_0.012_250),oklch(0.24_0.022_285))]',
    lines: ['45%', '78%', '64%'],
  },
  contact: {
    icon: MailIcon,
    label: 'Contact',
    meta: 'Every website needs one',
    bg: 'bg-[linear-gradient(135deg,#dcfce7,#dbeafe)] dark:bg-[linear-gradient(135deg,oklch(0.3_0.05_155),oklch(0.27_0.04_240))]',
    lines: ['42%', '88%', '70%'],
  },
  availability_poll: {
    icon: CalendarCheck2Icon,
    label: 'Availability',
    meta: 'Group scheduling',
    bg: 'bg-[linear-gradient(135deg,#fef3c7,#fee2e2)] dark:bg-[linear-gradient(135deg,oklch(0.31_0.05_85),oklch(0.28_0.045_25))]',
    lines: ['36%', '82%', '58%'],
  },
  feedback: {
    icon: ClipboardListIcon,
    label: 'Survey',
    meta: 'Capture client priorities',
    bg: 'bg-[linear-gradient(135deg,#ede9fe,#fce7f3)] dark:bg-[linear-gradient(135deg,oklch(0.3_0.05_295),oklch(0.28_0.045_340))]',
    lines: ['40%', '92%', '68%'],
  },
  bug: {
    icon: BugIcon,
    label: 'Internal',
    meta: 'Team issue tracker',
    bg: 'bg-[linear-gradient(135deg,#e2e8f0,#dbeafe)] dark:bg-[linear-gradient(135deg,oklch(0.28_0.03_225),oklch(0.31_0.05_255))]',
    lines: ['34%', '76%', '86%'],
  },
} as const

type GalleryTemplate = (typeof FORM_GALLERY_TEMPLATES)[number]
type GalleryTemplateId = GalleryTemplate['id']
