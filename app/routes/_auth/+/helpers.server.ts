import { createElement } from 'react'
import { redirectWithError } from 'remix-toast'
import { renderEmail } from '~/.server/email/render'
import ResetPassword from '~/.server/email/templates/reset-password'
import Verify from '~/.server/email/templates/verify'
import { EMAIL_FROM, SMTP } from '~/config/.server/email'
import { User } from '~/models/.server/user'

export async function requireUserByToken(token: string) {
  let user = await User.findBy({ token })
  if (!user) throw await redirectWithError('/', 'Invalid token')
  return user
}

export async function sendAuthLink(
  email: string,
  path: string,
  type: 'verify' | 'reset',
  name?: string | null,
) {
  let origin = process.env.ORIGIN || 'http://localhost:5173'
  let url = new URL(path, origin).toString()

  if (!process.env.SMTP_CONFIG) {
    logAuthLink(url)
    return false
  }

  let subject = type === 'verify' ? 'Verify your email' : 'Reset your password'
  let mail = await buildMail({ email, path: url, type, name })

  try {
    await SMTP.send({
      from: EMAIL_FROM,
      to: email,
      subject: mail.subject || subject,
      html: mail.html,
      text: mail.text,
    })
    return true
  } catch (error) {
    console.error('[email] send failed:', error)
    logAuthLink(url)
    return false
  }
}

function logAuthLink(url: string) {
  console.log(`[auth-link] ${url}`)
}

async function buildMail({ email, path, type, name }: BuildMailOptions) {
  if (type === 'verify') {
    let props = {
      user: { email, name: name || null },
      url: path,
    }

    return {
      subject: Verify.Subject(props),
      ...(await renderEmail(createElement(Verify, props))),
    }
  }

  let props = { url: path }

  return {
    subject: ResetPassword.Subject(props),
    ...(await renderEmail(createElement(ResetPassword, props))),
  }
}

type BuildMailOptions = {
  email: string
  name?: string | null
  path: string
  type: 'verify' | 'reset'
}
