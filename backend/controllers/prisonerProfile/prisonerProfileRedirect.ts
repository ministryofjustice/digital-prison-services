import config from '../../config'
import logger from '../../log'
import { isRedirectCaseLoad } from '../../utils'

export default ({ path, handler }) => {
  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    logger.info(
      `Old prisoner profile disabled from: ${config.app.prisonerProfileRedirect.oldPrisonerProfileInaccessibleFrom}`
    )

    const redirectEnabled = isRedirectCaseLoad(activeCaseLoadId)

    if (activeCaseLoadId && redirectEnabled) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
}
