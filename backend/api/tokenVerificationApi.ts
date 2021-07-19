// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'log'.
const log = require('../log')

const tokenVerificationApiFactory = (client) => {
  const verifyToken = (context) => {
    if (!config.apis.tokenverification.enabled) {
      log.debug('Token verification disabled, returning token is valid')
      return true
    }
    return client
      .post(context, `/token/verify`)
      .then((response) => Boolean(response.body && response.body.active))
      .catch(() => false)
  }

  return { verifyToken }
}

module.exports = { tokenVerificationApiFactory }
