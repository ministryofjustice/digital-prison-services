const config = require('../config')
const log = require('../log')

const processError = error => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return false
}

const tokenVerificationApiFactory = client => {
  const verifyToken = context => {
    if (!config.apis.tokenverification.enabled) {
      log.debug('Token verification disabled, returning token is valid')
      return true
    }
    log.debug(`Token verification enabled with context`)
    log.debug(context)
    return client
      .post(context, `/token/verify`)
      .then(response => {
        const result = (response.body && response.body.active) || false
        log.debug(`Token verification result is ${result}`)
        return result
      })
      .catch(processError)
  }

  return { verifyToken }
}

module.exports = { tokenVerificationApiFactory }
