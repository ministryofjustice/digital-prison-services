import config from '../../config'
import { isRedirectCaseLoad } from '../../utils'

export default () => {
  return function (req, res, next) {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const redirectEnabled = isRedirectCaseLoad(activeCaseLoadId)

    if (activeCaseLoadId && redirectEnabled) {
      return res.redirect(`${config.apis.incentives.ui_url}/incentive-reviews/prisoner/${offenderNo}`)
    }
    return next()
  }
}
