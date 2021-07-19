// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'asyncMiddl... Remove this comment to see the full error message
const asyncMiddleware = require('../middleware/asyncHandler')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userLocati... Remove this comment to see the full error message
const userLocationsFactory = (prisonApi) => {
  const userLocations = asyncMiddleware(async (req, res) => {
    const locations = await prisonApi.userLocations(res.locals)
    res.json(locations)
  })

  return {
    userLocations,
  }
}

module.exports = {
  userLocationsFactory,
}
