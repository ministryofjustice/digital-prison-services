const config = require('../config')
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
