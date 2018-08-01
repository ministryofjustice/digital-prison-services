const asyncMiddleware = require('../middleware/asyncHandler');

const getActivityLocationsFactory = (elite2Api) => {
  const getActivityLocations = asyncMiddleware(async (req, res) => {
    const response = await elite2Api.searchActivityLocations(res.locals, req.query.agencyId);
    res.json(response);
  });

  return {
    getActivityLocations
  };
};

module.exports = { getActivityLocationsFactory };
