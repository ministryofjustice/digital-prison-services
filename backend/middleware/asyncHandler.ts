// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logError'.
const { logError } = require('../logError')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Note this is the final catch-all for backend errors
    logError(req.originalUrl, error, 'Error caught in asyncMiddleware')
    const data = error && error.response && error.response.body
    const errorStatusCode = (data && data.status) || (error.response && error.response.status) || 500
    const message =
      (data && (data.userMessage || data.error_description)) ||
      (error && (error.message || (error.response && error.response.statusText)))

    res.status(errorStatusCode)

    if (message) {
      res.json(message)
    } else {
      res.end()
    }
  })
}

module.exports = asyncMiddleware
