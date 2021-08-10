import jwtDecode from 'jwt-decode'
import contextProperties from './contextProperties'
import logger from './log'

/**
 * Does the supplied JWT token expire before the supplied time, expressed as seconds since the Posix Epoch?
 * Note that  Date.now() is is expressed in milliseconds since the Posix Epoch, not seconds.
 * A JWT token's expiry time is the value of the 'exp' attribute of its payload. 'exp' is also expressed in seconds
 * since the Posix Epoch.
 * @param encodedToken An Encoded JWT token.  It is assumed that the token has an 'exp' (expiration time) claim.
 * @param timeSinceTheEpochInSeconds
 */
export const tokenExpiresBefore = (encodedToken, timeSinceTheEpochInSeconds) => {
  const token = jwtDecode(encodedToken)
  if ((token as any).exp < timeSinceTheEpochInSeconds) {
    logger.info(
      `Token expiring: user_name '${(token as any).user_name}', exp ${
        (token as any).exp
      } >= ${timeSinceTheEpochInSeconds}`
    )
  } else {
    logger.debug(
      `Token OK: user_name '${(token as any).user_name}', exp ${(token as any).exp} < ${timeSinceTheEpochInSeconds}`
    )
  }
  return (token as any).exp < timeSinceTheEpochInSeconds
}

/**
 * Return a function that checks and refreshes the OAuth tokens if the access token is approaching expiry or has expired.
 *
 * @param refreshFunction A function with a signature like api/oauthApi.refresh (Takes a context, returns a Promise).
 * @param secondsToExpiry The token will be refreshed at this number of seconds before the tokens 'exp' time.
 * @returns A Function which takes a 'context' object holding JWT auth and refresh tokens.  Returns a Promise which settles when
 * the check and refresh are complete.
 */
export const factory =
  (refreshFunction, secondsToExpiry) =>
  /**
   * Refresh the JWT tokens in context if the access token has less than secondsToExpiry before it expires.
   *
   * @param context A context object which holds the current OAuth accessToken and refreshToken. If a refresh is
   * performed and succeeds the new accessToken and refreshToken will be set on this object.
   * @param nowInSecondsSincePosixEpoch The current time, as 'posix seconds since the epoch'. An optional parameter which may be overriden (
   * useful for testing)
   * @returns a Promise that is settled when decisions and refresh are complete.
   */
  async (context, nowInSecondsSincePosixEpoch = Date.now() / 1000) => {
    if (tokenExpiresBefore(contextProperties.getAccessToken(context), nowInSecondsSincePosixEpoch + secondsToExpiry)) {
      const response = await refreshFunction(contextProperties.getRefreshToken(context))
      contextProperties.setTokens(response, context)
    }
  }

export default {
  factory,
  tokenExpiresBefore,
}
