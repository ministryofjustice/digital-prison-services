const asyncMiddleware = require('../middleware/asyncHandler');

const getHouseblockLocationsFactory = (elite2Api) => {
  const getHouseblockLocations = asyncMiddleware(async (req, res) => {
    const response = await elite2Api.searchGroups(res.locals, req.query.agencyId);
    res.json(response);
  });

  return {
    getHouseblockLocations
  };
};

module.exports = { getHouseblockLocationsFactory };
