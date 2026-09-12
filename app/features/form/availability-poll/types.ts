export type AvailabilityPoll = {
  time_zone: string
  /** Multiline; each non-empty line → one vote column (option). */
  candidate_lines: string
  /** Public link can’t edit existing answers; organizer can in Submissions / Preview. */
  readonly_responses: boolean
}

export type AvailabilityPollSlot = {
  id: string
  label: string
  instantMs: number
  /** When set, column header shows a time range (organizer zone). */
  endInstantMs?: number
  /** Replaces wall-clock header (e.g. "All day", "—", or freeform note after the date). */
  timeDisplayOverride?: string
  /** Grouped under "Other" in day headers; instantMs is ordering only. */
  unparsed?: boolean
}
