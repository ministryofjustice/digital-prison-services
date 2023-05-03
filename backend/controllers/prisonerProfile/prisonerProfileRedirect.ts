import config from '../../config'

export default ({ path, oauthApi, handler }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails
    const userRoles = oauthApi.userRoles(res.locals)

    // Either explicitly enable redirect for enabled prisons or check for the developer role
    const redirectEnabled =
      config.app.prisonerProfileRedirect.url &&
      (config.app.prisonerProfileRedirect.enabled ||
        userRoles.map((userRole) => userRole.roleCode).includes('DPS_APPLICATION_DEVELOPER'))

    const redirectCaseload = config.app.prisonerProfileRedirect.enabled_prisons?.split(',')?.includes(activeCaseLoadId)

    if (redirectEnabled && redirectCaseload) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
