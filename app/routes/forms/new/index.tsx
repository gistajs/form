import { UnsavedFormPage } from './+/unsaved-form-page'

export { action } from './+/action'
export { loader } from './+/loader'

export default function Page({ loaderData }) {
  let { scaffold: initialScaffold, scaffoldKey } = loaderData

  return <UnsavedFormPage key={scaffoldKey} initialScaffold={initialScaffold} />
}
