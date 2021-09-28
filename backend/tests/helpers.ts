export const makeError = (key, value) =>
  new (class TestError extends Error {
    constructor() {
      super()
      this[key] = value
    }
  })()

export const makeResetError = () => makeError('code', 'ECONNRESET')
export const makeResetErrorWithStack = () =>
  makeError(
    'stack',
    'Error: Timeout of 10000ms exceeded\n    at RequestBase._timeoutError (/app/node_modules/superagent/lib/request-base.js:727:13)\n    at Timeout.<anonymous> (/app/node_modules/superagent/lib/request-base.js:742:12)\n    at listOnTimeout (internal/timers.js:549:17)\n    at processTimers (internal/timers.js:492:7)'
  )

export const makeNotFoundError = () => makeError('response', { status: 404 })
export const makeServerError = () => makeError('response', { status: 500 })

export default { makeError, makeResetError, makeResetErrorWithStack, makeNotFoundError, makeServerError }
