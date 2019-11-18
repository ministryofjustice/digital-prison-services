const config = require('../config')

const activeCaseloadFactory = (elite2Api, logError) => {
  const setActiveCaseload = async (req, res) => {
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

  return {
    setActiveCaseload,
  }
}

module.exports = {
  activeCaseloadFactory,
}
