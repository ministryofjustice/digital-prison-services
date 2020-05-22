module.exports = ({ elite2Api, oauthApi, njkEnv }) => async (req, res, next) => {
  if (!req.xhr) {
    if (!req.session.userDetails) {
      const userDetails = await oauthApi.currentUser(res.locals)
      const allCaseloads = await elite2Api.userCaseLoads(res.locals)

      req.session.userDetails = userDetails
      req.session.allCaseloads = allCaseloads
    }

    const caseloads = req.session.allCaseloads
    const { name, activeCaseLoadId } = req.session.userDetails

    njkEnv.addGlobal('allCaseloads', caseloads)
    njkEnv.addGlobal('user', {
      displayName: name,
      activeCaseLoad: caseloads.find(cl => cl.caseLoadId === activeCaseLoadId),
    })
  }
  next()
}
