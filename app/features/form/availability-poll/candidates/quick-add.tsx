import { DayPicker } from 'react-day-picker'
import { availabilityPollDayjs } from '../dayjs'
import { AVAILABILITY_POLL_MAX_CANDIDATE_LINES } from '../parse-candidates'
import { quarterHmStartValues } from './quarter-hours'

type QuickAddProps = {
  timeZone: string
  appendTime: boolean
  setAppendTime: (v: boolean) => void
  startHm: string
  endHm: string
  setEndHm: (v: string) => void
  onStartHmChange: (v: string) => void
  endOptions: string[]
  timeRangeLabel: string
  onCalendarSelectLine: (line: string) => void
  atLineCap: boolean
}

export function QuickAdd({
  timeZone,
  appendTime,
  setAppendTime,
  startHm,
  endHm,
  setEndHm,
  onStartHmChange,
  endOptions,
  timeRangeLabel,
  onCalendarSelectLine,
  atLineCap,
}: QuickAddProps) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold tracking-tight text-base-content/80">
        Quick add
      </h3>
      <div className="mb-3 overflow-x-auto">
        <DayPicker
          className="react-day-picker"
          mode="single"
          timeZone={timeZone}
          noonSafe
          onSelect={(selected, triggerDate) => {
            let d = triggerDate ?? selected
            if (!d) return
            let ymd = availabilityPollDayjs(d).tz(timeZone).format('YYYY-MM-DD')
            let dow = availabilityPollDayjs(d).tz(timeZone).format('ddd')
            let core = `${ymd} (${dow})`
            let line =
              appendTime && endOptions.length > 0
                ? `${core} ${timeRangeLabel}`
                : core
            onCalendarSelectLine(line)
          }}
        />
      </div>
      <label className="label cursor-pointer justify-start gap-2 py-1">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={appendTime}
          onChange={(e) => setAppendTime(e.target.checked)}
        />
        <span className="label-text text-xs">Append time when inserting</span>
      </label>
      <div
        className={`mt-2 grid grid-cols-2 gap-2 ${!appendTime ? 'pointer-events-none opacity-40' : ''}`}
      >
        <label className="form-control">
          <span className="label-text text-[11px] text-base-content/55">
            Start
          </span>
          <select
            value={startHm}
            onChange={(e) => onStartHmChange(e.target.value)}
            className="select-bordered select w-full select-sm font-mono text-xs"
          >
            {quarterHmStartValues.map((hm) => (
              <option key={hm} value={hm}>
                {hm}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text text-[11px] text-base-content/55">
            End
          </span>
          <select
            value={endHm}
            onChange={(e) => setEndHm(e.target.value)}
            className="select-bordered select w-full select-sm font-mono text-xs"
          >
            {endOptions.map((hm) => (
              <option key={hm} value={hm}>
                {hm}
              </option>
            ))}
          </select>
        </label>
      </div>
      {appendTime ? (
        <p className="mt-1 text-[10px] text-base-content/45">
          Inserts <span className="font-mono">{timeRangeLabel}</span> (15-minute
          steps).
        </p>
      ) : (
        <p className="mt-1 text-[10px] text-base-content/45">
          Inserts date only; the grid shows{' '}
          <span className="font-medium">—</span> instead of a clock time. Add{' '}
          <code className="text-[10px]">All day</code> on the line for that
          meaning.
        </p>
      )}
      {atLineCap ? (
        <p className="mt-2 text-xs text-warning">
          Line limit reached ({AVAILABILITY_POLL_MAX_CANDIDATE_LINES}). Remove
          lines to add more.
        </p>
      ) : null}
    </div>
  )
}
