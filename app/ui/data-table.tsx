import { isValidElement } from 'react'
import { Link } from 'react-router'

type KeyColumns = [string, string | [string, (row: any) => any]][]

export function DataTable({
  columns,
  rows,
  title = '',
  deletable = false,
  className = '',
  link = null as any,
  sticky = false,
}) {
  let keyColumns: KeyColumns = Object.entries(columns)

  if (!Array.isArray(rows)) console.error('rows is not an array:', rows)

  return (
    <div>
      {title && <h3 className="py-2">{title}</h3>}

      <div className={cx(sticky || 'overflow-x-auto')}>
        <table className={cx('table', sticky && 'table-pin-rows', className)}>
          <thead className="text-xs">
            <tr>
              {/* header cells */}
              {keyColumns.map(([key, column]) => (
                <th key={key}>
                  <Header column={column} />
                </th>
              ))}
              {deletable && <th></th>}
              {link && <th className="m-0 size-0 p-0"></th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="relative isolate"
                // Absolute positioning within table cells won't work on iOS.
                // For Safari 16.5 and later, create a stacked context using
                // transform: translate(0px) hack on the table row or cell
                // https://github.com/w3c/csswg-drafts/issues/1899
                style={{ transform: 'translate(0px)' }}
              >
                {/* data cells */}
                {keyColumns.map(([key, column], idx) => (
                  <td key={idx}>
                    <Cell
                      keyName={key}
                      column={column}
                      row={row}
                      rowIndex={rowIndex}
                    />
                  </td>
                ))}
                {/* deletable */}
                {deletable && (
                  <td>
                    <form method="post" onSubmit={confirmDelete}>
                      <input type="hidden" name="verb" value="delete" />
                      <input type="hidden" name="id" value={row.id ?? ''} />
                      <button
                        type="submit"
                        className="btn btn-soft btn-xs btn-error"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                )}
                {/* link */}
                {/* The clickable overlay is positioned absolutely over the entire row */}
                {/* https://www.youtube.com/watch?v=-h9rH539x1k */}
                {link && (
                  <td className="m-0 h-16 w-0 p-0">
                    <Link
                      to={link(row)}
                      className="absolute inset-0 z-10 hover:bg-primary/10"
                      aria-label={`View details for row ${rowIndex + 1}`}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Header({ column }) {
  if (typeof column === 'string') return column
  let [first, second] = column // array destructuring
  if (second === 'integer') {
    return <div className="text-right">{first}</div>
  }
  return first
}

function Cell({ keyName, column, row, rowIndex }) {
  let key = keyName
  let cell = row[key]

  if (typeof column === 'string') {
    if (isValidElement(cell)) return cell
    if (key.endsWith('_at')) return formatTime(cell, 'whitespace-nowrap')
    if (key.endsWith('_on')) return formatDate(cell)
    return cell
  }

  // Non-string column
  let [, second] = column

  if (typeof second === 'string') {
    let value
    let className = ''

    if (second === 'integer') {
      className = 'text-right whitespace-nowrap'
      value = formatInteger(cell)
    }
    return <div className={className}>{value}</div>
  }
  if (typeof second === 'function') return second(row, rowIndex)

  // Catch-all
  return JSON.stringify(cell)
}

function cx(...parts: any[]) {
  return parts.filter(Boolean).join(' ')
}

function confirmDelete(e: React.FormEvent<HTMLFormElement>) {
  if (!confirm('Are you sure you want to delete?')) {
    e.preventDefault()
  }
}

function formatInteger(value: number | undefined | null, fallback = '—') {
  if (typeof value !== 'number') return fallback
  return value.toLocaleString('en-US')
}

function formatDate(value: string | number | Date | undefined | null) {
  let date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return value || '—'
  return date.toISOString().slice(0, 10)
}

function formatTime(
  value: string | number | Date | undefined | null,
  className = '',
) {
  let date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime()))
    return <time className={className}>—</time>

  let iso = date.toISOString()
  let full = date.toLocaleString()

  return (
    <time dateTime={iso} title={full} className={className}>
      {full}
    </time>
  )
}
