import config from '../../config'
import { isRedirectCaseLoad } from '../../utils'

export default ({ path, handler }) => {
  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const redirectEnabled = isRedirectCaseLoad(activeCaseLoadId)

    if (redirectEnabled) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
}
