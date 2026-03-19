import config from '../config'

export default ({ path }) => {
  return (req, res, next) => {
    const query = req.url.split('?')[1]
    const { activeCaseLoadId } = req.session.userDetails
    const redirectEnabledPrisons = config.app.homepageRedirect.changeCaseloadRedirect.enabledPrisons.split(',')

    if (redirectEnabledPrisons.includes('***') || redirectEnabledPrisons.includes(activeCaseLoadId)) {
      const referer = req.get('Referer')
      if (referer) {
        res.set('Referer', referer)
      }
      return res.redirect(`${config.app.homepageRedirect.url}/${path}${query ? `?${query}` : ''}`)
    }
    return next()
  }
}
