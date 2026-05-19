/** Every HH:mm on the quarter hour, 00:00 … 23:45. */
let quarterHmValues = (() => {
  let out: string[] = []
  for (let m = 0; m < 24 * 60; m += 15) {
    let h = Math.floor(m / 60)
    let mi = m % 60
    out.push(`${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`)
  }
  return out
})()

/** Latest start so a later quarter-hour end exists (23:45). */
export let quarterHmStartValues = quarterHmValues.filter(
  (hm) => minutesOfDay(hm) <= 23 * 60 + 30,
)

function minutesOfDay(hm: string): number {
  let parts = hm.split(':').map((x) => parseInt(x, 10))
  let h = Number.isFinite(parts[0]) ? parts[0] : 0
  let m = Number.isFinite(parts[1]) ? parts[1] : 0
  return h * 60 + m
}

export function endHmChoicesAfter(startHm: string): string[] {
  return quarterHmValues.filter(
    (hm) => minutesOfDay(hm) > minutesOfDay(startHm),
  )
}
