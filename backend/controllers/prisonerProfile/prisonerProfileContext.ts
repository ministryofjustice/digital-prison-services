import { getClientCredentialsTokens } from '../../api/systemOauthClient'

const getContext = async ({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  if (res.locals.user === undefined) {
    return { context: res.locals, overrideAccess: false }
  }
  const {
    user: { allCaseloads },
  } = res.locals

  const { username } = req.session.userDetails
  const userRoles = oauthApi.userRoles(res.locals)

  if (userRoles.map((userRole) => userRole.roleCode).includes('POM')) {
    const isRestrictedPatient = await restrictedPatientApi.isCaseLoadRestrictedPatient(
      res.locals,
      offenderNo,
      allCaseloads.map((caseload) => caseload.caseLoadId)
    )
    if (isRestrictedPatient) {
      const context = await systemOauthClient.getClientCredentialsTokens(username)
      return { context, overrideAccess: true }
    }
  }
  return { context: res.locals, overrideAccess: false }
}

export const getContextWithClientTokenAndRoles = async ({
  offenderNo,
  res,
  req,
  oauthApi,
  systemOauthClient,
  restrictedPatientApi,
}) => {
  if (oauthApi) {
    const userRoles = oauthApi.userRoles(res.locals)
    res.locals = { ...res.locals, userRoles }
  }
  const { username } = req.session.userDetails
  const { access_token: clientToken } = await (
    systemOauthClient?.getClientCredentialsTokens || getClientCredentialsTokens
  )(username)

  if (restrictedPatientApi && systemOauthClient) {
    const { context, overrideAccess } = await getContext({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })
    return {
      context: {
        ...context,
        access_token: clientToken,
      },
      overrideAccess,
    }
  }

  return {
    context: {
      ...res.locals,
      access_token: clientToken,
    },
    overrideAccess: false,
  }
}

export default getContext
