import { isRedirectCaseLoad } from '../utils'

export default () => async (req, res, next) => {
  res.locals.useNewProfile = isRedirectCaseLoad(req?.session?.userDetails?.activeCaseLoadId)
  return next()
}
