import { isXHRRequest } from '../utils'

export default ({ logError }) =>
  (error, req, res, next) => {
    const status = error?.response?.status || 500

    if (status >= 500) logError(req.originalUrl, error, 'There was a problem loading page')

    if (isXHRRequest(req)) {
      res.status(status)
      return res.end()
    }
    res.status(status)

    if (status === 403 || status === 404) return res.render('notFound.njk', { url: req.headers.referer || '/' })

    return res.render('error.njk', {
      url: res.locals?.redirectUrl || req.originalUrl,
      homeUrl: res.locals?.homeUrl,
    })
  }
