const asyncMiddleware = require('../middleware/asyncHandler')

const userLocationsFactory = elite2Api => {
  const userLocations = asyncMiddleware(async (req, res) => {
    const locations = await elite2Api.userLocations(res.locals)
    res.json(locations)
  })

  return {
    userLocations,
  }
}

module.exports = {
  userLocationsFactory,
}
