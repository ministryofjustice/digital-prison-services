const { logError } = require('../logError')

const downloadProbationDocumentFactory = (oauthApi, communityApi, systemOauthClient) => {
  const downloadDocument = async (req, res) => {
    const ensureAllowedPageAccess = userRoles => {
      if (!userRoles.find(role => role.roleCode === 'VIEW_PROBATION_DOCUMENTS')) {
        throw new Error('You do not have the correct role to access this page')
      }
    }

    const { offenderNo, documentId } = req.params
    try {
      const userRoles = await oauthApi.userRoles(res.locals)
      ensureAllowedPageAccess(userRoles)
      const systemContext = await systemOauthClient.getClientCredentialsTokens()
      communityApi.pipeOffenderDocument(systemContext, { offenderNo, documentId, res })
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
