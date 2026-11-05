import {
  submissions,
  type SubmissionInsert,
  type SubmissionSelect,
} from '~/.server/db/schema'
import { createModel } from './base'

const base = createModel(submissions)

export const Submission = {
  ...base,

  async findAllBy(where: Partial<SubmissionSelect> = {}) {
    return await base.findAllBy(where)
  },

  async create(data: SubmissionInsert & Partial<Pick<SubmissionSelect, 'id'>>) {
    return await base.create(data)
  },

  async update(
    submissionId: number,
    data: Partial<Pick<SubmissionSelect, 'data'>>,
  ) {
    return await base.update(submissionId, data)
  },

  async count(options?: { where?: Partial<SubmissionSelect> }) {
    return await base.count({ where: options?.where })
  },
}
