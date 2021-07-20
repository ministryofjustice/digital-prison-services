// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'telemetry'... Remove this comment to see the full error message
const telemetry = require('../azure-appinsights')

const ensureAllowedPageAccess = (userRoles) => {
  if (!userRoles.find((role) => role.roleCode === 'VIEW_PROBATION_DOCUMENTS' || role.roleCode === 'POM')) {
    throw new Error('You do not have the correct role to access this page')
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'trackEvent... Remove this comment to see the full error message
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
      res.locals.redirectUrl = `/offenders/${offenderNo}/probation-documents`
      throw error
    }
  }
  return { downloadDocument }
}

module.exports = { downloadProbationDocumentFactory }
