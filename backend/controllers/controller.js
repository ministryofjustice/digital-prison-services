const asyncMiddleware = require('../middleware/asyncHandler')

const factory = (
  activityListService,
  houseblockListService,
  updateAttendanceService,
  establishmentRollService,
  globalSearchService
) => {
  const getActivityList = asyncMiddleware(async (req, res) => {
    const { agencyId, locationId, date, timeSlot } = req.query
    const viewModel = await activityListService.getActivityList(req.session, agencyId, locationId, date, timeSlot)
    res.json(viewModel)
  })

  const getHouseblockList = asyncMiddleware(async (req, res) => {
    const { agencyId, groupName, date, timeSlot } = req.query
    const viewModel = await houseblockListService.getHouseblockList(req.session, agencyId, groupName, date, timeSlot)
    res.json(viewModel)
  })

  const updateAttendance = asyncMiddleware(async (req, res) => {
    const { offenderNo, activityId } = req.query
    await updateAttendanceService.updateAttendance(req.session, offenderNo, activityId, req.body)
    res.json({})
  })

  const getEstablishmentRollCount = asyncMiddleware(async (req, res) => {
    const { agencyId, unassigned } = req.query
    const viewModel = await establishmentRollService.getEstablishmentRollCount(req.session, agencyId, unassigned)
    res.json(viewModel)
  })

  const globalSearch = asyncMiddleware(async (req, res) => {
    const { searchText } = req.query
    const viewModel = await globalSearchService.globalSearch(req.session, searchText)
    res.set(req.session.responseHeaders)
    res.json(viewModel)
  })

  return {
    getActivityList,
    getHouseblockList,
    updateAttendance,
    getEstablishmentRollCount,
    globalSearch,
  }
}

module.exports = {
  factory,
}
