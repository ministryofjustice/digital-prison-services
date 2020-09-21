module.exports = ({ elite2Api, oauthApi }) => async (req, res, next) => {
  if (!req.xhr) {
    if (!req.session.userDetails) {
      const userDetails = await oauthApi.currentUser(res.locals)
      const allCaseloads = await elite2Api.userCaseLoads(res.locals)

      req.session.userDetails = userDetails
      req.session.allCaseloads = allCaseloads
    }

    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }

    const caseloads = req.session.allCaseloads
    const { name, activeCaseLoadId } = req.session.userDetails

    res.locals.user = {
      ...res.locals.user,
      allCaseloads: caseloads,
      displayName: name,
      activeCaseLoad: caseloads.find(cl => cl.caseLoadId === activeCaseLoadId),
    }
  }
  next()
}
