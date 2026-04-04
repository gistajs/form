import { assert } from 'es-toolkit'
import type { Transporter } from 'nodemailer'
import nodemailer from 'nodemailer'
import { z } from 'zod'

// Update this once to match the sender you want on auth emails.
export const EMAIL_FROM = 'App <hello@example.com>'

let transport: Transporter | null = null

export const SMTP = {
  async send(options) {
    let transport = getTransport()
    assert(transport, 'SMTP_CONFIG is required to send emails')
    return await transport.sendMail(options)
  },
}

function getTransport() {
  if (transport) return transport

  let config = process.env.SMTP_CONFIG
  if (!config) {
    console.warn('SMTP_CONFIG not set - emails will not be sent')
    return null
  }

  transport = nodemailer.createTransport(schema.parse(JSON.parse(config)))
  return transport
}

const schema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean().optional(),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
})
