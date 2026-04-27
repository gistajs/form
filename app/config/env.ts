export const isBrowser = typeof document !== 'undefined'
export const Env = isBrowser ? window.ENV : process.env

export const isProd = process.env.NODE_ENV === 'production'
