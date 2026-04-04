import { forms, type FormInsert, type FormSelect } from '~/.server/db/schema'
import { createModel } from './base'

const base = createModel(forms)

export const Form = {
  ...base,

  async findPublicBy(where: Partial<FormSelect>) {
    return await base.findBy(where)
  },

  async findBy(userId: number, where: Omit<Partial<FormSelect>, 'user_id'>) {
    return await base.findBy({ ...where, user_id: userId })
  },

  async findByOrThrow(
    userId: number,
    where: Omit<Partial<FormSelect>, 'user_id'>,
  ) {
    return await base.findByOrThrow({ ...where, user_id: userId })
  },

  async findAllBy(
    userId: number,
    where: Omit<Partial<FormSelect>, 'user_id'> = {},
  ) {
    return await base.findAllBy({ ...where, user_id: userId })
  },

  async create(
    userId: number,
    data: Omit<FormInsert, 'user_id'> & Partial<Pick<FormSelect, 'id'>>,
  ) {
    return await base.create({ ...data, user_id: userId })
  },

  async update(
    userId: number,
    id: number,
    data: Omit<Partial<FormSelect>, 'user_id'>,
  ) {
    await this.findByOrThrow(userId, { id })
    return await base.update(id, data)
  },

  async delete(userId: number, id: number) {
    await this.findByOrThrow(userId, { id })
    return await base.delete(id)
  },

  async count(
    userId: number,
    options?: { where?: Omit<Partial<FormSelect>, 'user_id'> },
  ) {
    return await base.count({ where: { ...options?.where, user_id: userId } })
  },
}
