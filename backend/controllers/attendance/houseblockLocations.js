const asyncMiddleware = require('../../middleware/asyncHandler')

const getHouseblockLocationsFactory = whereaboutsApi => {
  const getHouseblockLocations = asyncMiddleware(async (req, res) => {
    const response = await whereaboutsApi.searchGroups(res.locals, req.query.agencyId)
    res.json(response)
  })

  return {
    getHouseblockLocations,
  }
}

module.exports = { getHouseblockLocationsFactory }
