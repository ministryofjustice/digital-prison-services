// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
const asyncMiddleware = require('../middleware/asyncHandler')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getConfigu... Remove this comment to see the full error message
const getConfiguration = asyncMiddleware(async (req, res) =>
  res.json({
    mailTo: config.app.mailTo,
    googleAnalyticsId: config.analytics.googleAnalyticsId,
    licencesUrl: config.app.licencesUrl,
    flags: config.app.featureFlags,
    supportUrl: config.app.supportUrl,
    authUrl: config.apis.oauth2.url,
  })
)

module.exports = {
  getConfiguration,
}
