const asyncMiddleware = require('../middleware/asyncHandler')
const config = require('../config')

const getConfiguration = asyncMiddleware(async (req, res) =>
  res.json({
    notmEndpointUrl: config.app.notmEndpointUrl,
    mailTo: config.app.mailTo,
    googleAnalyticsId: config.analytics.googleAnalyticsId,
    licencesUrl: config.app.licencesUrl,
    updateAttendanceEnabled: config.app.updateAttendanceEnabled,
    flags: config.app.featureFlags,
  })
)

module.exports = {
  getConfiguration,
}
