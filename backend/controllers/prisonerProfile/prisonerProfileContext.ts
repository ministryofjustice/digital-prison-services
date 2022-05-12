const getContext = async ({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  const {
    user: { allCaseloads },
  } = res.locals
  const { username } = req.session.userDetails
  const userRoles = await oauthApi.userRoles(res.locals)

  if (userRoles.map((userRole) => userRole.roleCode).includes('POM')) {
    const isRestrictedPatient = await restrictedPatientApi.isCaseLoadRestrictedPatient(
      res.locals,
      offenderNo,
      allCaseloads.map((caseload) => caseload.caseLoadId)
    )
    if (isRestrictedPatient) {
      const context = await systemOauthClient.getClientCredentialsTokens(username)
      return context
    }
  }
  return res.locals
}

export default getContext
