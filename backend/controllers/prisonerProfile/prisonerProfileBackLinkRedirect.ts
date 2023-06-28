import config from '../../config'

export default (handler) => async (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  const { service, returnPath, redirectPath, backLinkText } = req.query

  // Either explicitly enable redirect for enabled prisons or check for the developer role
  const redirectUrl = config.app.prisonerProfileRedirect.url
  const redirectDate = config.app.prisonerProfileRedirect.enabledDate

  const redirectEnabled =
    redirectUrl &&
    !redirectPath.includes('add-case-note') && // DPS currently still provides this page so just pass through for now
    ((redirectDate && redirectDate < Date.now()) ||
      res.locals.user?.userRoles?.some((role) => role === 'ROLE_DPS_APPLICATION_DEVELOPER'))

  const redirectCaseload = config.app.prisonerProfileRedirect.enabledPrisons?.split(',')?.includes(activeCaseLoadId)

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
