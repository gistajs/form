import { createInsertSchema } from 'drizzle-zod'
import { users } from '../schema'

export const userInsertSchema = createInsertSchema(users, {
  email: (z) => z.trim().toLowerCase(),
  name: (z) => z.trim().min(1, 'Enter your name'),
  password: (z) =>
    z
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
})

export const userUpdateSchema = userInsertSchema
  .pick({ name: true, email: true, password: true })
  .partial()
