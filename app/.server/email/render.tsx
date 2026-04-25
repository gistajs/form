import type { ReactElement } from 'react'
import { pretty, render, toPlainText } from 'react-email'

export async function renderEmail(component: ReactElement) {
  let base = await render(component)
  let text = toPlainText(base)
  let html = await pretty(base)
  return { html, text }
}
