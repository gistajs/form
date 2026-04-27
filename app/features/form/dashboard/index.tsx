import { FormCard } from './form-card'
import { NewFormGallery } from './template-gallery'
import type { DashboardForm } from './types'

export type { DashboardForm } from './types'

export function Dashboard({ forms }: { forms: DashboardForm[] }) {
  return (
    <div className="space-y-12">
      <NewFormGallery />

      {forms.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your forms</h2>
              <p className="mt-1 text-sm text-base-content/60">
                Open a form to edit fields, preview responses, or review
                submissions.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard key={form.public_id} form={form} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
