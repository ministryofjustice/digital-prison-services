const { logError } = require('../logError')

module.exports = (error, req, res, next) => {
  const pageData = {
    url: res.locals.redirectUrl || req.originalUrl,
    homeUrl: res.locals.homeUrl,
  }

  logError(req.originalUrl, error, `There was a problem loading ${pageData.url}`)

  res.status(500)

  return res.render('error.njk', pageData)
}
