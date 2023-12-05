import config from '../../config'
import { isRedirectCaseLoad } from '../../utils'

export default (handler) => async (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  const { service, returnPath, redirectPath, backLinkText } = req.query

  const redirectCaseload = isRedirectCaseLoad(activeCaseLoadId)

  if (redirectCaseload) {
    let url = `${
      config.app.prisonerProfileRedirect.url
    }/save-backlink?service=${service}&returnPath=${encodeURIComponent(returnPath)}&redirectPath=${redirectPath}`
    if (backLinkText) {
      url += `&backLinkText=${backLinkText}`
    }
    return res.redirect(url)
  }

  return handler(req, res, next)
}
