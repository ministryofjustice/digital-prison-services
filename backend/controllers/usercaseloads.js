const asyncMiddleware = require('../middleware/asyncHandler')

const userCaseloadsFactory = (prisonApi) => {
  const userCaseloads = asyncMiddleware(async (req, res) => {
    const data = await prisonApi.userCaseLoads(res.locals)
    res.json(data)
  })

  return {
    userCaseloads,
  }
}

module.exports = {
  userCaseloadsFactory,
}
