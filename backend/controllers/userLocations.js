const asyncMiddleware = require('../middleware/asyncHandler')

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
