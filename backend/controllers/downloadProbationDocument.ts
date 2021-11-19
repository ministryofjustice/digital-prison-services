import telemetry from '../azure-appinsights'

const ensureAllowedPageAccess = (offenderInCaseload: boolean, userRoles) => {
  if (
    !(
      offenderInCaseload &&
      userRoles.find((role) => role.roleCode === 'VIEW_PROBATION_DOCUMENTS' || role.roleCode === 'POM')
    )
  ) {
    throw new Error('You do not have the correct role or caseload to access this page')
  }
}

export const trackEvent = (offenderNo, documentId, suffix, { username }) => {
  if (telemetry) {
    telemetry.trackEvent({
      name: `DownloadProbationDocument${suffix}`,
      properties: { username, documentId, offenderNo },
    })
  }
}

export const downloadProbationDocumentFactory = (oauthApi, communityApi, systemOauthClient, prisonApi) => {
  const downloadDocument = async (req, res) => {
    const { offenderNo, documentId } = req.params
    try {
      const [user, userRoles, caseloads, { agencyId }] = await Promise.all([
        oauthApi.currentUser(res.locals),
        oauthApi.userRoles(res.locals),
        prisonApi.userCaseLoads(res.locals),
        prisonApi.getDetails(res.locals, offenderNo),
      ])
      try {
        const offenderInCaseload =
          caseloads && (caseloads as [{ caseLoadId: string }]).some((caseload) => caseload.caseLoadId === agencyId)

        ensureAllowedPageAccess(offenderInCaseload, userRoles)
        const systemContext = await systemOauthClient.getClientCredentialsTokens()
        communityApi.pipeOffenderDocument(systemContext, { offenderNo, documentId, res })

        trackEvent(offenderNo, documentId, 'Success', user)
      } catch (error) {
        trackEvent(offenderNo, documentId, 'Failure', user)
        throw error
      }
    } catch (error) {
      res.locals.redirectUrl = `/offenders/${offenderNo}/probation-documents`
      throw error
    }
  }
  return { downloadDocument }
}

export default { downloadProbationDocumentFactory }
