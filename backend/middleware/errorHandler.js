const { logError } = require('../logError')

module.exports = (error, req, res, next) => {
  if (error?.response?.status === 404) {
    res.status(404)
    return res.render('notFound.njk', { url: req.headers.referer || '/' })
  }

  const pageData = {
    url: res.locals.redirectUrl || req.originalUrl,
    homeUrl: res.locals.homeUrl,
  }

  logError(req.originalUrl, error, `There was a problem loading ${pageData.url}`)
  res.status(500)

  return res.render('error.njk', pageData)
}
