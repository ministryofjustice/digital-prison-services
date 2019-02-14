const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')

const asyncMiddleware = require('../middleware/asyncHandler')
const { CsvParseError, readFile } = require('../csv-parser')

const factory = ({
  activityListService,
  houseblockListService,
  updateAttendanceService,
  establishmentRollService,
  globalSearchService,
  movementsService,
  offenderLoader,
  bulkAppoinemtnsService,
}) => {
  const getActivityList = asyncMiddleware(async (req, res) => {
    const { agencyId, locationId, date, timeSlot } = req.query
    const viewModel = await activityListService.getActivityList(res.locals, agencyId, locationId, date, timeSlot)
    res.json(viewModel)
  })

  const getHouseblockList = asyncMiddleware(async (req, res) => {
    const { agencyId, groupName, date, timeSlot } = req.query
    const viewModel = await houseblockListService.getHouseblockList(res.locals, agencyId, groupName, date, timeSlot)
    res.json(viewModel)
  })

  const updateAttendance = asyncMiddleware(async (req, res) => {
    const { offenderNo, activityId } = req.query
    await updateAttendanceService.updateAttendance(res.locals, offenderNo, activityId, req.body)
    res.json({})
  })

  const getEstablishmentRollCount = asyncMiddleware(async (req, res) => {
    const { agencyId, unassigned } = req.query
    const viewModel = await establishmentRollService.getEstablishmentRollCount(res.locals, agencyId, unassigned)
    res.json(viewModel)
  })

  const globalSearch = asyncMiddleware(async (req, res) => {
    const { searchText, genderFilter, locationFilter, dateOfBirthFilter } = req.query
    const viewModel = await globalSearchService.globalSearch(
      res.locals,
      searchText,
      genderFilter,
      locationFilter,
      dateOfBirthFilter
    )
    res.set(res.locals.responseHeaders)
    res.json(viewModel)
  })

  const getMovementsIn = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getMovementsIn(res.locals, agencyId)
    res.json(viewModel)
  })

  const getMovementsOut = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getMovementsOut(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersInReception = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersInReception(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersCurrentlyOutOfLivingUnit = asyncMiddleware(async (req, res) => {
    const { livingUnitId } = req.params
    const viewModel = await movementsService.getOffendersCurrentlyOutOfLivingUnit(res.locals, livingUnitId)
    res.json(viewModel)
  })

  const getOffendersCurrentlyOutOfAgency = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersCurrentlyOutOfAgency(res.locals, agencyId)
    res.json(viewModel)
  })

  const getOffendersEnRoute = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.params
    const viewModel = await movementsService.getOffendersEnRoute(res.locals, agencyId)
    res.json(viewModel)
  })

  const uploadOffenders = asyncMiddleware(async (req, res) => {
    try {
      const { offenders } = req.files
      const { size } = fs.lstatSync(offenders.path)

      const mb200 = 200000000

      if (size > mb200) {
        res.status(400)
        res.send('The csv is to lage. Maximum file size is 200MB')
        return
      }

      const bytes = fs.readFileSync(offenders.path)
      if (isBinaryFileSync(bytes, size)) {
        res.status(400)
        res.send('Unsupported file type')
        return
      }

      const fileContent = await readFile(offenders.path)
      const viewModel = await offenderLoader.loadFromCsvContent(res.locals, fileContent)
      res.json(viewModel)
    } catch (error) {
      if (error.name === CsvParseError.name) {
        res.status(400)
        res.send(error.message)
        return
      }
      throw error
    }
  })

  const getBulkAppointmentsViewModel = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.query
    const viewModel = await bulkAppoinemtnsService.getBulkAppointmentsViewModel(res.locals, agencyId)
    res.json(viewModel)
  })

  return {
    getActivityList,
    getHouseblockList,
    updateAttendance,
    getEstablishmentRollCount,
    globalSearch,
    getMovementsIn,
    getMovementsOut,
    getOffendersInReception,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getOffendersEnRoute,
    uploadOffenders,
    getBulkAppointmentsViewModel,
  }
}

module.exports = {
  factory,
}
