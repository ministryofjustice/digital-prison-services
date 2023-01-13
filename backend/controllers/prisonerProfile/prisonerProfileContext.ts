const getContext = async ({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  if (res.locals.user === undefined) {
    return { context: res.locals, restrictedPatientDetails: undefined }
  }
  const {
    user: { allCaseloads },
  } = res.locals

  const { username } = req.session.userDetails
  const userRoles = oauthApi.userRoles(res.locals)

  if (userRoles.map((userRole) => userRole.roleCode).includes('POM')) {
    const restrictedPatient = await restrictedPatientApi.getRestrictedPatientDetails(
      res.locals,
      offenderNo,
      allCaseloads.map((caseload) => caseload.caseLoadId)
    )
    if (restrictedPatient) {
      const { isCaseLoadRestrictedPatient, hospital } = restrictedPatient
      const context = await systemOauthClient.getClientCredentialsTokens(username)
      return {
        context,
        restrictedPatientDetails: {
          isRestrictedPatient: true,
          isPomCaseLoadRestrictedPatient: isCaseLoadRestrictedPatient,
          hospital: hospital.description,
        },
      }
    }
  }
  return { context: res.locals, restrictedPatientDetails: undefined }
}

export default getContext
