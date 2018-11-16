const asyncMiddleware = require('../middleware/asyncHandler')

const activeCaseloadFactory = elite2Api => {
  const setActiveCaseload = asyncMiddleware(async (req, res) => {
    await elite2Api.setActiveCaseload(res.locals, req.body)
    res.json({})
  })

  return {
    setActiveCaseload,
  }
}

module.exports = {
  activeCaseloadFactory,
}
