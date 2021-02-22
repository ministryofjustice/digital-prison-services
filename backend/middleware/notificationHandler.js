module.exports = ({ contentfulService, logError }) => async (req, res, next) => {
  try {
    const notificationContent = await contentfulService.getMostRecentNotificationAsHtml(req)

    if (!notificationContent) return next()

    res.locals.notification = notificationContent
  } catch (e) {
    logError(req.originalUrl, e, 'Error loading contentful content')
  }

  return next()
}
