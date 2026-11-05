import { DEFAULT_GRID_COLUMNS, DEFAULT_GRID_ROWS } from './grid'
import {
  DEFAULT_RADIO_LAYOUT,
  DEFAULT_RADIO_OPTIONS,
  type RadioLayout,
  type RadioOption,
} from './radio/utils'

export const FIELD_TYPE_META = {
  text: { label: 'Text', desc: 'Short text input', defaultLabel: 'Text Field' },
  textarea: {
    label: 'Long Text',
    desc: 'Multi-line input',
    defaultLabel: 'Description',
  },
  email: {
    label: 'Email',
    desc: 'Email address',
    defaultLabel: 'Email Address',
  },
  radio: {
    label: 'Radio',
    desc: 'Pick from a few options',
    defaultLabel: 'Choose one',
  },
  select: {
    label: 'Dropdown',
    desc: 'Pick from a long list',
    defaultLabel: 'Select Option',
  },
  checkbox: {
    label: 'Checkbox',
    desc: 'Yes / no toggle',
    defaultLabel: 'Agree to Terms',
  },
  grid_radio: {
    label: 'Grid (radio)',
    desc: 'One selection per row',
    defaultLabel: 'Rate each statement',
  },
  grid_checkbox: {
    label: 'Grid (checkbox)',
    desc: 'Multiple selections per row',
    defaultLabel: 'Select all that apply per row',
  },
  date: {
    label: 'Date',
    desc: 'Date picker',
    defaultLabel: 'Date',
  },
} satisfies Record<
  string,
  { label: string; desc: string; defaultLabel: string }
>

export type FieldType = keyof typeof FIELD_TYPE_META

export const FIELD_TYPES = Object.keys(FIELD_TYPE_META) as FieldType[]

type FieldShape = {
  key: string
  label: string
  type: FieldType
  required: boolean
  options?: string[] | RadioOption[] | null
  radio_layout?: RadioLayout | null
  rows?: string[] | null
  columns?: string[] | null
}

export function buildFormField(type: FieldType, key: string): FieldShape {
  return {
    key,
    label: FIELD_TYPE_META[type].defaultLabel,
    type,
    required: false,
    options:
      type === 'select'
        ? ['Option 1', 'Option 2', 'Option 3']
        : type === 'radio'
          ? [...DEFAULT_RADIO_OPTIONS]
          : null,
    ...(type === 'radio' ? { radio_layout: DEFAULT_RADIO_LAYOUT } : {}),
    ...(type === 'grid_radio' || type === 'grid_checkbox'
      ? {
          rows: [...DEFAULT_GRID_ROWS],
          columns: [...DEFAULT_GRID_COLUMNS],
        }
      : {}),
  }
}

export const FORM_TEMPLATE_IDS = [
  'contact',
  'availability_poll',
  'feedback',
  'bug',
] as const

export type FormTemplateId = (typeof FORM_TEMPLATE_IDS)[number]

type FormTemplateField = {
  label: string
  type: FieldType
  required: boolean
  options?: string[] | RadioOption[]
  radio_layout?: RadioLayout
  rows?: string[]
  columns?: string[]
}

type FormTemplate = {
  id: FormTemplateId
  name: string
  description: string
  fields: FormTemplateField[]
}

export const FORM_TEMPLATES: Record<FormTemplateId, FormTemplate> = {
  contact: {
    id: 'contact',
    name: 'Contact Form',
    description: 'Tell us how we can help and how to reach you',
    fields: [
      { label: 'Name', type: 'text', required: true },
      { label: 'Email', type: 'email', required: true },
      { label: 'Company', type: 'text', required: false },
      { label: 'Message', type: 'textarea', required: true },
    ],
  },
  availability_poll: {
    id: 'availability_poll',
    name: 'Availability Poll',
    description: 'Choose the time slots that work best for everyone',
    fields: [],
  },
  feedback: {
    id: 'feedback',
    name: 'Client Survey',
    description: 'Share your priorities, feedback, and any launch blockers',
    fields: [
      { label: 'Name', type: 'text', required: true },
      {
        label: 'Primary goal',
        type: 'radio',
        required: true,
        radio_layout: 'horizontal',
        options: [
          { primary: 'Leads' },
          { primary: 'Sales' },
          { primary: 'Support' },
        ],
      },
      {
        label: 'Area Review',
        type: 'grid_radio',
        required: true,
        rows: ['Onboarding', 'Performance', 'Docs', 'Error handling'],
        columns: ['Blocked', 'Needs work', 'Ready'],
      },
      {
        label: 'Impacted surfaces',
        type: 'grid_checkbox',
        required: false,
        rows: ['Web app', 'Marketing site', 'Email flow'],
        columns: ['Copy', 'Visual polish', 'Functionality', 'Analytics'],
      },
      { label: 'Launch blocker?', type: 'checkbox', required: false },
      { label: 'Notes', type: 'textarea', required: false },
    ],
  },
  bug: {
    id: 'bug',
    name: 'Bug Report',
    description: 'Describe the bug, its impact, and how to reproduce it',
    fields: [
      { label: 'Reporter', type: 'text', required: true },
      {
        label: 'Severity',
        type: 'select',
        required: true,
        options: ['Low', 'Medium', 'High', 'Critical'],
      },
      { label: 'Title', type: 'text', required: true },
      { label: 'Steps to Reproduce', type: 'textarea', required: true },
      { label: 'Expected Behavior', type: 'textarea', required: false },
    ],
  },
}
