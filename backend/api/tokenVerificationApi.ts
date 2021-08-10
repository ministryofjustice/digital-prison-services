import config from '../config'
import log from '../log'

export const tokenVerificationApiFactory = (client) => {
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

export default { tokenVerificationApiFactory }
