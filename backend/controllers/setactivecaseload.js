const asyncMiddleware = require('../middleware/asyncHandler')

const activeCaseloadFactory = elite2Api => {
  const setActiveCaseload = asyncMiddleware(async (req, res) => {
    const { caseLoadId } = req.body

    await elite2Api.setActiveCaseload(res.locals, { caseLoadId })

    // eslint-disable-next-line no-param-reassign
    req.session.data.activeCaseLoadId = caseLoadId
    res.json({})
  })

  return {
    setActiveCaseload,
  }
}

module.exports = {
  activeCaseloadFactory,
}
