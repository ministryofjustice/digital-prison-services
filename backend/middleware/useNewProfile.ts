import { useNewProfile, isRedirectCaseLoad, isRedirectEnabled } from '../utils'

export default () => async (req, res, next) => {
  res.locals.useNewProfile = useNewProfile(
    isRedirectEnabled(res),
    isRedirectCaseLoad(req?.session?.userDetails?.activeCaseLoadId)
  )
  return next()
}
