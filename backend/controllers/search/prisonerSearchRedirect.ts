import config from '../../config'
import qs from 'querystring'

export const prisonerSearchGetRedirect = (req, res) => {
  const query = req.url.split('?')[1]
  return res.redirect(`${config.app.homepageRedirect.url}/prisoner-search${query ? `?${query}` : ''}`)
}

export const prisonerSearchPostRedirect = (req, res) => {
  const { alerts, ...queries } = req.query

  return res.redirect(
    `${req.baseUrl}?${qs.stringify({
      ...queries,
      ...(alerts ? { 'alerts[]': alerts } : {}),
      sortFieldsWithOrder: req.body.sortFieldsWithOrder,
    })}`
  )
}
