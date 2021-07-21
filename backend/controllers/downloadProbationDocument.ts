import telemetry from '../azure-appinsights'

export const ensureAllowedPageAccess = (userRoles) => {
  if (!userRoles.find((role) => role.roleCode === 'VIEW_PROBATION_DOCUMENTS' || role.roleCode === 'POM')) {
    throw new Error('You do not have the correct role to access this page')
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

export const downloadProbationDocumentFactory = (oauthApi, communityApi, systemOauthClient) => {
  const downloadDocument = async (req, res) => {
    const { offenderNo, documentId } = req.params
    try {
      const [user, userRoles] = await Promise.all([oauthApi.currentUser(res.locals), oauthApi.userRoles(res.locals)])
      try {
        ensureAllowedPageAccess(userRoles)
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
