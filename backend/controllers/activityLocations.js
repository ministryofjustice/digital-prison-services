const asyncMiddleware = require('../middleware/asyncHandler');
const switchDateFormat = require('../utils');

const getActivityLocationsFactory = (elite2Api) => {
  const getActivityLocations = asyncMiddleware(async (req, res) => {
    const date = switchDateFormat(req.query.bookedOnDay);
    const response = await elite2Api.searchActivityLocations(res.locals, req.query.agencyId, date, req.query.timeSlot);
    res.json(response);
  });

  return {
    getActivityLocations
  };
};

module.exports = { getActivityLocationsFactory };
