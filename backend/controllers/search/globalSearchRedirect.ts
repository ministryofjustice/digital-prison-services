import config from '../../config'

export default ({ path }) => {
  return (req, res, next) => {
    const { activeCaseLoadId } = req.session.userDetails
    if (activeCaseLoadId) {
      const query = req.url.split('?')[1]
      return res.redirect(`${config.app.homepageRedirect.url}/${path}${query ? `?${query}` : ''}`)
    }
    // else probation user, run old code.
    return next()
  }
}
