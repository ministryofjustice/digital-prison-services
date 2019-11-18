const config = require('../config')

const changeCaseloadFactory = (oauthApi, elite2Api, logError) => {
  const index = async (req, res) => {
    try {
      const [user, caseloads] = await Promise.all([
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
      ])

      // In case someone goes directly to the URL
      // and they don't have more than 1 caseload
      if (caseloads.length <= 1) {
        res.redirect(config.app.notmEndpointUrl)
      }

      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const options = caseloads.map(caseload => ({ value: caseload.caseLoadId, text: caseload.description }))
      res.render('changeCaseload.njk', {
        title: 'Change caseload',
        options,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoad ? activeCaseLoad.caseLoadId : null,
          },
        },
        caseLoadId: activeCaseLoad.caseLoadId,
        backUrl: req.headers.referer,
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        url: '/change-caseload',
      })
    }
  }

  return { index }
}

module.exports = {
  changeCaseloadFactory,
}
