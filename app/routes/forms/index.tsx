import { useLoaderData } from 'react-router'
import { requireUser } from '~/.server/auth/middlewares'
import { Dashboard } from '~/features/form/dashboard'
import { buildDashboard } from '~/features/form/dashboard/helpers'
import { Form } from '~/models/.server/form'
import { Submission } from '~/models/.server/submission'

export async function loader({ context }) {
  let user = requireUser(context)
  let forms = await Form.findAllBy(user.id)
  let submissions = await Submission.findAllBy()

  return {
    forms: buildDashboard(forms, submissions),
  }
}

export default function Page() {
  let { forms } = useLoaderData<typeof loader>()
  return <Dashboard forms={forms} />
}
