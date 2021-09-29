export default (redirectUrlPrefix) => async (req, res) => {
  const targetUrl = req.originalUrl.substr(redirectUrlPrefix.length) || '/'

  return res.render('deprecatedUrlPage.njk', {
    originalUrl: targetUrl,
  })
}
