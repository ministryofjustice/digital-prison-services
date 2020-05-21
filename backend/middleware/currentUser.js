module.exports = ({ elite2Api, oauthApi, njkEnv }) => async (req, res, next) => {
  if (!req.session.userDetails) {
    const userDetails = await oauthApi.currentUser(res.locals)
    const allCaseloads = await elite2Api.userCaseLoads(res.locals)

    req.session.userDetails = userDetails
    req.session.allCaseloads = allCaseloads

    njkEnv.addGlobal('allCaseloads', allCaseloads)
    njkEnv.addGlobal('user', {
      displayName: userDetails.name,
      activeCaseLoad: allCaseloads.find(cl => cl.caseLoadId === userDetails.activeCaseLoadId),
    })
  }
  next()
}
