// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const { app } = require('../config')

module.exports =
  ({ contentfulService, logError }) =>
  async (req, res, next) => {
    try {
      if (!app.contentfulSpaceId) return next()
      const notificationContent = await contentfulService.getMostRecentNotificationAsHtml(req)

      if (!notificationContent) return next()

      res.locals.notification = notificationContent
    } catch (e) {
      logError(req.originalUrl, e, 'Error loading contentful content')
    }

    return next()
  }
