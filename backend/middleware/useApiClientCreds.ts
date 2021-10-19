import { NextFunction } from 'express'

const useApiClientCreds =
  ({ systemOauthClient }) =>
  async (req: any, res: any, next: NextFunction): Promise<void | Error> => {
    const { username } = req.session?.userDetails || {}

    if (!username) {
      return next(
        new Error(
          'No user session available. Make sure that the middleware is inserted after auth and current user middleware'
        )
      )
    }
    // eslint-disable-next-line camelcase
    const { access_token, refresh_token, authSource } = await systemOauthClient.getClientCredentialsTokens(username)

    res.locals = {
      ...res.locals,
      // eslint-disable-next-line camelcase
      access_token,
      // eslint-disable-next-line camelcase
      refresh_token,
      authSource,
    }

    return next()
  }

export default useApiClientCreds
