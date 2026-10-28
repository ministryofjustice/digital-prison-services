import { getClientCredentialsTokens } from '../../api/systemOauthClient'

const getContextWithClientTokenAndRoles = async ({ res, req, oauthApi, systemOauthClient }) => {
  if (oauthApi) {
    const userRoles = oauthApi.userRoles(res.locals)
    res.locals = { ...res.locals, userRoles }
  }
  const { username } = req.session.userDetails
  const { access_token: clientToken } = await (
    systemOauthClient?.getClientCredentialsTokens || getClientCredentialsTokens
  )(username)

  return {
    context: {
      ...res.locals,
      access_token: clientToken,
    },
    overrideAccess: false,
  }
}

export default getContextWithClientTokenAndRoles
