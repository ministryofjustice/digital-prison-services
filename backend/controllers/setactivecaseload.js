const config = require('../config')

const activeCaseloadFactory = elite2Api => {
  const setActiveCaseload = async (req, res) => {
    const { caseLoadId } = req.body

    await elite2Api.setActiveCaseload(res.locals, { caseLoadId })

    if (req.session && req.session.userDetails) req.session.userDetails.activeCaseLoadId = caseLoadId
    if (req.session && req.session.data) req.session.data = null

    res.redirect(config.app.notmEndpointUrl)
  }

  return {
    setActiveCaseload,
  }
}

module.exports = {
  activeCaseloadFactory,
}
