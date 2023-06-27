import { isRedirectActive, isRedirectCaseLoad, isRedirectEnabled } from '../utils'

export default () => async (req, res, next) => {
  req.session.isRedirectActive = isRedirectActive(
    isRedirectEnabled(res),
    isRedirectCaseLoad(req?.session?.userDetails?.activeCaseLoadId)
  )
  return next()
}
