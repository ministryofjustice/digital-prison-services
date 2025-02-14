import config from '../../config'
import logger from '../../log'

export default ({ path, handler }) => {
  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails
    const isInaccessibleFrom = config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom
    const isInaccessible = isInaccessibleFrom && isInaccessibleFrom < Date.now()

    if (activeCaseLoadId) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    if (isInaccessible) {
      logger.info(`User '${res.locals?.user?.username}' has no caseload, presenting no caseload message`)
      return res.render('prisonerProfile/noCaseLoads.njk')
    }

    return handler(req, res, next)
  }
}
