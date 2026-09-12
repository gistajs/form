import { buildFormScaffold } from '~/features/form/scaffold'
import { payloadFromSearch } from '~/lib/data/payload'

export async function loader({ request }) {
  let payload = payloadFromSearch(request)

  return {
    scaffold: buildFormScaffold({
      presetId: String(payload.preset_id || ''),
      availabilityPollStartAt: String(payload.availability_poll_start_at || ''),
      availabilityPollTimeZone: String(
        payload.availability_poll_time_zone || '',
      ),
    }),
    scaffoldKey: new URL(request.url).search,
  }
}
