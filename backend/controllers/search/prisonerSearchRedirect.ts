import config from '../../config'

export default () => {
  return (req, res, next) => {
    const query = req.url.split('?')[1]
    const { activeCaseLoadId } = req.session.userDetails
    const redirectEnabledPrisons = config.app.homepageRedirect.searchRedirect.enabledPrisons.split(',')

    if (redirectEnabledPrisons.includes('***') || redirectEnabledPrisons.includes(activeCaseLoadId)) {
      return res.redirect(`${config.app.homepageRedirect.url}prisoner-search${query ? `?${query}` : ''}`)
    }
    return next()
  }
}
