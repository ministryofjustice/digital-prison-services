const config = require('../config')

const changeCaseloadFactory = (elite2Api, logError) => {
  const index = async (req, res) => {
    try {
      const caseloads = await elite2Api.userCaseLoads(res.locals)

      // In case someone goes directly to the URL
      // and they don't have more than 1 caseload
      if (caseloads.length <= 1) {
        return res.redirect(config.app.notmEndpointUrl)
      }

      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const options = caseloads.map(caseload => ({ value: caseload.caseLoadId, text: caseload.description }))
      return res.render('changeCaseload.njk', {
        title: 'Change caseload',
        options,
        allCaseloads: caseloads,
        user: {
          displayName: req.session.userDetails.name,
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
      return res.render('error.njk', {
        url: '/change-caseload',
      })
    }
  }

  const post = async (req, res) => {
    const { caseLoadId } = req.body

    // Don't call API if data is missing
    if (caseLoadId) {
      await elite2Api.setActiveCaseload(res.locals, { caseLoadId })

      if (req.session && req.session.userDetails) req.session.userDetails.activeCaseLoadId = caseLoadId
      if (req.session && req.session.data) req.session.data = null

      res.redirect(config.app.notmEndpointUrl)
    } else {
      logError(req.originalUrl, 'Caseload ID is missing')
      res.render('error.njk', {
        url: '/change-caseload',
      })
    }
  }

  return { index, post }
}

module.exports = {
  changeCaseloadFactory,
}
