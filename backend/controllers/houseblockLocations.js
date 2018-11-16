const asyncMiddleware = require('../middleware/asyncHandler')

const getHouseblockLocationsFactory = elite2Api => {
  const getHouseblockLocations = asyncMiddleware(async (req, res) => {
    const response = await elite2Api.searchGroups(req.session, req.query.agencyId)
    res.json(response)
  })

  return {
    getHouseblockLocations,
  }
}

module.exports = { getHouseblockLocationsFactory }
