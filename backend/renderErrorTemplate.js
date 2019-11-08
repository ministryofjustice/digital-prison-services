module.exports = ({ error, req, res, logError, url, title }) => {
  if (error.code === 'ECONNABORTED') {
    logError(req.originalUrl, error, 'Request has timed out')
    return res.render('error.njk', {
      url: req.originalUrl,
      title: 'Your request has timed out.',
    })
  }

  logError(req.originalUrl, error, 'Sorry, the service is unavailable')
  return res.render('error.njk', {
    url,
  })
}
