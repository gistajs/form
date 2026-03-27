import bcrypt from 'bcryptjs'
import {
  users,
  type Insert,
  type Select,
  type Update,
} from '~/.server/db/schema'
import { hexid } from '~/lib/data/hexid'
import { createModel } from './base'

const TOKEN_EXPIRES_DAYS = 7
const base = createModel(users)

export const User = {
  ...base,

  async findByEmail(email: string) {
    return await this.findBy({ email: normalizeEmail(email) })
  },

  async create(data: Insert) {
    return await base.create({
      ...data,
      email: normalizeEmail(data.email),
      token: hexid(),
      token_expires_at: nextTokenExpiry(),
      ...(data.password && { password: await hashPassword(data.password) }),
    })
  },

  async update(id: number, data: Update) {
    return await base.update(id, {
      ...data,
      ...(data.email && { email: normalizeEmail(data.email) }),
      ...(data.password && { password: await hashPassword(data.password) }),
    })
  },

  async verify(token: string) {
    let user = await this.findBy({ token })
    if (!user || user.token_expires_at! < new Date()) return null

    if (!user.verified_at) {
      user = await this.update(user.id, { verified_at: new Date() })
    }

    return user
  },

  async authenticate(email: string, password: string) {
    let user = await this.findByEmail(email)
    if (!user?.password) return null

    let valid = await bcrypt.compare(password, user.password)
    if (!valid) return null

    return await this.findByID(user.id)
  },

  async refreshToken(id: number) {
    return await this.update(id, {
      token: hexid(),
      token_expires_at: nextTokenExpiry(),
    })
  },
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

function nextTokenExpiry() {
  return new Date(Date.now() + TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
}

export function tokenExpired(user: Select) {
  return user.token_expires_at! < new Date()
}
