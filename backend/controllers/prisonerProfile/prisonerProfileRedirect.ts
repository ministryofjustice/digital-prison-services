import config from '../../config'
import { isRedirectCaseLoad, isRedirectEnabled } from '../../utils'

export default ({ path, handler }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const redirectEnabled = isRedirectEnabled(res, activeCaseLoadId)
    const redirectCaseload = isRedirectCaseLoad(activeCaseLoadId)

    if (redirectEnabled && redirectCaseload) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
