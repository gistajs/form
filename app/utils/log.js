import chalk from 'chalk'

export const log = {
  start: (message) => {
    console.log(chalk.yellow(message))
    return Date.now()
  },
  end: (message, start) => {
    let elapsed = ((Date.now() - start) / 1000).toFixed(3)
    console.log(chalk.yellow(`${message} (${elapsed}s)`))
  },
  info: (message) => {
    console.log(chalk.blue(message))
  },
  warn: (message) => {
    console.log(chalk.magenta(message))
  },
  success: (message) => {
    console.log(chalk.green(message))
  },
  error: (message, error) => {
    console.error(chalk.red(message), error)
  },
}
