const getContext = ({ res, oauthApi, systemContext, prisonerSearchDetails }) => {
  if (res.locals.user === undefined) {
    return { context: res.locals, overrideAccess: false }
  }
  const {
    user: { allCaseloads },
  } = res.locals
  const userRoles = oauthApi.userRoles(res.locals)

  if (userRoles.map((userRole) => userRole.roleCode).includes('POM')) {
    const agencyIds = allCaseloads.map((caseload) => caseload.caseLoadId)
    const isRestrictedPatient =
      prisonerSearchDetails.restrictedPatient && agencyIds.includes(prisonerSearchDetails.supportingPrisonId)

    if (isRestrictedPatient) {
      const context = systemContext
      return { context, overrideAccess: true }
    }
  }
  return { context: res.locals, overrideAccess: false }
}

export default getContext
