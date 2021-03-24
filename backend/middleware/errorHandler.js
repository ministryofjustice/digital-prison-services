const { isXHRRequest } = require('../utils')

module.exports = ({ logError }) => (error, req, res, next) => {
  const status = error?.response?.status || 500

  if (status >= 500) logError(req.originalUrl, error, 'There was a problem loading page')

  if (isXHRRequest(req)) {
    res.status(status)
    return res.end()
  }

  res.status(status)

  if (status === 404) return res.render('notFound.njk', { url: req.headers.referer || '/' })

  return res.render('error.njk', {
    url: res.locals?.redirectUrl || req.originalUrl,
    homeUrl: res.locals?.homeUrl,
  })
}
