import config from '../../config'

export default () => {
  return (req, res, next) => {
    const query = req.url.split('?')[1]
    return res.redirect(`${config.app.homepageRedirect.url}/prisoner-search${query ? `?${query}` : ''}`)
  }
}
