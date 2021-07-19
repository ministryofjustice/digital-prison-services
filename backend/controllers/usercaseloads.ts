// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
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
