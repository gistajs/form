import { merge } from 'es-toolkit'
import { get, set, unset } from 'es-toolkit/compat'

export const Lens = {
  setOrMerge(target: any, path: string | number, value: any) {
    // Replace entirely if value is array or primitive
    if (Array.isArray(value) || typeof value !== 'object' || value === null) {
      return Lens.set(target, path, value)
    }
    // Replace entirely if existing value is not an object
    let existing = get(target, path)
    if (typeof existing !== 'object' || existing === null) {
      return Lens.set(target, path, value)
    }
    return Lens.merge(target, path, value)
  },

  set(object: any, path: string | number, value: any) {
    return set(object || getDefault(path), path, value)
  },

  unset(object: any, path: string | number) {
    let target = object || getDefault(path)

    // Array: unset element at index and compact
    // Lens.unset({ items: [1, 2, 3] }, 'items.1') => { items: [1, 3] }
    let parts = path.toString().split('.')
    let last = parts.pop()
    let parent = parts.reduce((obj, part) => obj?.[part], target) // obj['2'] === obj[2] in JavaScript
    if (parent && Array.isArray(parent)) {
      let index = Number(last)
      if (Number.isInteger(index) && index >= 0) {
        parent.splice(index, 1)
        return target
      }
    }

    // Object: unset key
    // Lens.unset({ a: { b: 1 } }, 'a.b') => { a: {} }
    unset(target, path)
    return target
  },

  // Merge data into target at the specified path
  // Lens.merge({ a: 1 }, 'b', { c: 2 }) => { a: 1, b: { c: 2 } }
  merge(object: any, path: string | number, data: any) {
    let target = Lens.deepInit(object, path)
    merge(get(target, path), data)
    return target
  },

  deepInit(object: any, path: string | number) {
    let target = object || getDefault(path)

    if (!get(target, path)) {
      set(target, path, {})
    }
    return target
  },
}

// Helper function to get the appropriate default object based on path
function getDefault(path: string | number) {
  let isArray =
    typeof path === 'number' ||
    (typeof path === 'string' && /^\d+(\.)/.test(path))
  return isArray ? [] : {}
}
