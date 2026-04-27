/** IANA id → single URL/form-safe segment (no `@`; used inside slot ids). */
export function availabilityPollZoneToken(zone: string): string {
  let t = zone
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return t || 'z'
}
