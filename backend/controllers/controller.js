const asyncMiddleware = require('../middleware/asyncHandler');

const factory = (activityListService, houseblockListService,
  updateAttendanceService, establishmentRollService, globalSearchService) => {
  const getActivityList = asyncMiddleware(async (req, res) => {
    const { agencyId, locationId, date, timeSlot } = req.query;
    const viewModel = await activityListService.getActivityList(res.locals, agencyId, locationId, date, timeSlot);
    res.json(viewModel);
  });

  const getHouseblockList = asyncMiddleware(async (req, res) => {
    const { agencyId, groupName, date, timeSlot } = req.query;
    const viewModel = await houseblockListService.getHouseblockList(res.locals, agencyId, groupName, date, timeSlot);
    res.json(viewModel);
  });

  const updateAttendance = asyncMiddleware(async (req, res) => {
    const { offenderNo, activityId } = req.query;
    await updateAttendanceService.updateAttendance(res.locals, offenderNo, activityId, req.body);
    res.json({});
  });

  const getEstablishmentRollCount = asyncMiddleware(async (req, res) => {
    const { agencyId, unassigned } = req.query;
    const viewModel = await establishmentRollService.getEstablishmentRollCount(res.locals, agencyId, unassigned);
    res.json(viewModel);
  });

  const globalSearch = asyncMiddleware(async (req, res) => {
    const { searchText } = req.query;
    const viewModel = await globalSearchService.globalSearch(res.locals, searchText);
    res.set(res.locals.responseHeaders);
    res.json(viewModel);
  });

  return {
    getActivityList,
    getHouseblockList,
    updateAttendance,
    getEstablishmentRollCount,
    globalSearch
  };
};

module.exports = {
  factory
};
