import asyncMiddleware from '../middleware/asyncHandler'
import config from '../config'

export const getConfiguration = asyncMiddleware(async (req, res) =>
  res.json({
    mailTo: config.app.mailTo,
    googleAnalyticsId: config.analytics.googleAnalyticsId,
    googleAnalyticsGa4Id: config.analytics.googleAnalyticsGa4Id,
    licencesUrl: config.app.licencesUrl,
    flags: (config.app as any).featureFlags,
    supportUrl: config.app.supportUrl,
    authUrl: config.apis.oauth2.url,
  })
)

export default {
  getConfiguration,
}
