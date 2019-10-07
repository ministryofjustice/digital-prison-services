const { logError } = require('../logError')
const telemetry = require('../azure-appinsights')

const ensureAllowedPageAccess = userRoles => {
  if (!userRoles.find(role => role.roleCode === 'VIEW_PROBATION_DOCUMENTS' || role.roleCode === 'POM')) {
    throw new Error('You do not have the correct role to access this page')
  }
}

const trackEvent = (offenderNo, documentId, suffix, { username }) => {
  if (telemetry) {
    telemetry.trackEvent({
      name: `DownloadProbationDocument${suffix}`,
      properties: { username, documentId, offenderNo },
    })
  }
}

const downloadProbationDocumentFactory = (oauthApi, communityApi, systemOauthClient) => {
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
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')

      res.render('error.njk', {
        url: `/offenders/${offenderNo}/probation-documents`,
      })
    }
  }
  return { downloadDocument }
}

module.exports = { downloadProbationDocumentFactory }
