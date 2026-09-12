export function matchesCode(
  error: any,
  codes: Array<string | number>,
  keys: Array<string> = ['code', 'rawCode'],
) {
  let current = error

  while (current) {
    for (let key of keys) {
      if (codes.includes(current?.[key])) return true
    }
    current = current.cause
  }

  return false
}

// Can be used this way:
//
// catch (error) {
//   if (matchesCode(error, ['SQLITE_CONSTRAINT_UNIQUE'])) {
//     return { error: 'Email already exists' }
//   }
//   throw error
// }
