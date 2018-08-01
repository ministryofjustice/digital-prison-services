const asyncMiddleware = require('../middleware/asyncHandler');

const factory = (activityListService, houseblockListService, updateAttendanceService) => {
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

  return {
    getActivityList,
    getHouseblockList,
    updateAttendance
  };
};

module.exports = {
  factory
};
