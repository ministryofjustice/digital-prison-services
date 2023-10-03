import config from '../../config'
import { isRedirectCaseLoad, isRedirectEnabled } from '../../utils'

export default (handler) => async (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  const { service, returnPath, redirectPath, backLinkText } = req.query

  const redirectEnabled = isRedirectEnabled(res, activeCaseLoadId)
  const redirectCaseload = isRedirectCaseLoad(activeCaseLoadId)

  if (redirectEnabled && redirectCaseload) {
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
