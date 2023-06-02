import config from '../../config'

export default ({ path, oauthApi, handler }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails
    const userRoles = oauthApi.userRoles(res.locals)

    // Either explicitly enable redirect for enabled prisons or check for the developer role
    const redirectUrl = config.app.prisonerProfileRedirect.url
    const redirectDate = config.app.prisonerProfileRedirect.enabledDate

    const redirectEnabled =
      redirectUrl &&
      ((redirectDate && redirectDate < Date.now()) ||
        userRoles.map((userRole) => userRole.roleCode).includes('DPS_APPLICATION_DEVELOPER'))

    const redirectCaseload = config.app.prisonerProfileRedirect.enabledPrisons?.split(',')?.includes(activeCaseLoadId)

    if (redirectEnabled && redirectCaseload) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
