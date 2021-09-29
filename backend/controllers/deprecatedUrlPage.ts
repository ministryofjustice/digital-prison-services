export default (redirectUrlPrefix) => async (req, res) => {
  const targetUrl = req.baseUrl.substr(redirectUrlPrefix.length) || '/'

  return res.render('deprecatedUrlPage.njk', {
    originalUrl: targetUrl,
  })
}
