export default () => async (req, res) => {
  const { returnUrl = '/' } = req.session
  delete req.session.returnUrl

  return res.redirect(returnUrl)
}
