import pc from 'picocolors'

export const log = {
  start: (message) => {
    console.log(pc.yellow(message))
    return Date.now()
  },
  end: (message, start) => {
    let elapsed = ((Date.now() - start) / 1000).toFixed(3)
    console.log(pc.yellow(`${message} (${elapsed}s)`))
  },
  info: (message) => {
    console.log(pc.blue(message))
  },
  warn: (message) => {
    console.log(pc.magenta(message))
  },
  success: (message) => {
    console.log(pc.green(message))
  },
  error: (message, error) => {
    console.error(pc.red(message), error)
  },
}
