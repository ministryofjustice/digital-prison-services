import { isRedirectActive, isRedirectCaseLoad, isRedirectEnabled } from '../utils'

export default () => async (req, res, next) => {
  res.locals.isRedirectActive = isRedirectActive(
    isRedirectEnabled(res),
    isRedirectCaseLoad(req?.session?.userDetails?.activeCaseLoadId)
  )
  return next()
}
