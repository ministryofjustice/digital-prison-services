export default () => async (req, res, next) => {
  if (req.query?.returnUrl) req.session.returnUrl = req.query.returnUrl
  return next()
}
