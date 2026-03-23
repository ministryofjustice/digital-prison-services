import config from '../../config'

export default ({ path }) => {
  return (req, res, next) => {
    const query = req.url.split('?')[1]
    return res.redirect(`${config.app.homepageRedirect.url}/${path}${query ? `?${query}` : ''}`)
  }
}
