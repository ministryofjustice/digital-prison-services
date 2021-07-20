// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'log'.
const log = require('../log')

module.exports = function ensureSec(req, res, next) {
  if (req.secure) {
    next()
    return
  }
  const redirectUrl = `https://${req.hostname}${req.url}`
  log.info(`Redirecting to ${redirectUrl}`)

  res.redirect(redirectUrl)
}
