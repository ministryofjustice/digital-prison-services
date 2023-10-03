import telemetry from '../azure-appinsights'
import canAccessProbationDocuments from '../shared/probationDocumentsAccess'

const ensureAllowedPageAccess = (userRoles: [{ roleCode: string }], caseloads: [{ caseLoadId }], agencyId: string) => {
  if (!canAccessProbationDocuments(userRoles, caseloads, agencyId)) {
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

export const downloadProbationDocumentFactory = (
  oauthApi,
  hmppsManageUsersApi,
  communityApi,
  systemOauthClient,
  prisonApi
) => {
  const downloadDocument = async (req, res) => {
    const { offenderNo, documentId } = req.params
    try {
      const userRoles = oauthApi.userRoles(res.locals)
      const [user, caseloads, { agencyId }] = await Promise.all([
        hmppsManageUsersApi.currentUser(res.locals),
        prisonApi.userCaseLoads(res.locals),
        prisonApi.getDetails(res.locals, offenderNo),
      ])
      try {
        ensureAllowedPageAccess(userRoles, caseloads, agencyId)
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
