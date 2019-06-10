const asyncMiddleware = require('../middleware/asyncHandler')

const factory = ({
  activityListService,
  adjudicationHistoryService,
  iepDetailsService,
  houseblockListService,
  attendanceService,
  establishmentRollService,
  globalSearchService,
  movementsService,
  offenderLoader,
  bulkAppointmentsService,
  csvParserService,
  offenderService,
}) => {
  const getActivityList = asyncMiddleware(async (req, res) => {
    const { agencyId, locationId, date, timeSlot } = req.query
    const viewModel = await activityListService.getActivityList(res.locals, agencyId, locationId, date, timeSlot)
    res.json(viewModel)
  })

  const getAdjudications = asyncMiddleware(async (req, res) => {
    const { offenderNumber } = req.params
    const viewModel = await adjudicationHistoryService.getAdjudications(res.locals, offenderNumber, req.query)
    res.set(res.locals.responseHeaders)
    res.json(viewModel)
  })

  const getAdjudicationDetails = asyncMiddleware(async (req, res) => {
    const { offenderNumber, adjudicationNumber } = req.params
    const viewModel = await adjudicationHistoryService.getAdjudicationDetails(
      res.locals,
      offenderNumber,
      adjudicationNumber
    )
    res.json(viewModel)
  })

  const getHouseblockList = asyncMiddleware(async (req, res) => {
    const { agencyId, groupName, date, timeSlot } = req.query
    const viewModel = await houseblockListService.getHouseblockList(res.locals, agencyId, groupName, date, timeSlot)
    res.json(viewModel)
  })

  const getIepDetails = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const viewModel = await iepDetailsService.getIepDetails(res.locals, offenderNo, req.query)
    res.json(viewModel)
  })

  const getPossibleLevels = asyncMiddleware(async (req, res) => {
    const { currentIepLevel, agencyId } = req.query
    const viewModel = await iepDetailsService.getPossibleLevels(res.locals, currentIepLevel, agencyId)
    res.json(viewModel)
  })

  const postAttendance = asyncMiddleware(async (req, res) => {
    await attendanceService.postAttendance(res.locals, req.body)
    res.json({})
  })

  const getAbsenceReasons = asyncMiddleware(async (req, res) => {
    const absenceReasons = await attendanceService.getAbsenceReasons(res.locals, req.body)
    res.json(absenceReasons)
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

  const getOffender = asyncMiddleware(async (req, res) => {
    const { offenderNo } = req.params
    const viewModel = await offenderService.getOffender(res.locals, offenderNo)
    res.json(viewModel)
  })

  const uploadOffenders = asyncMiddleware(async (req, res) => {
    const { file } = req.files
    const { agencyId } = req.params

    csvParserService
      .loadAndParseCsvFile(file)
      .then(async fileContent => {
        const viewModel = await offenderLoader.loadFromCsvContent(res.locals, fileContent, agencyId)
        res.json(viewModel)
      })
      .catch(error => {
        res.status(400)
        res.send(error.message)
        res.end()
      })
  })

  const bulkAppointmentsCsvTemplate = asyncMiddleware(async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=offenders-for-appointments.csv')
    res.set('Content-Type', 'text/csv')
    res.status(200).send(`Prison number\n,\n`)
    res.end()
  })

  const getBulkAppointmentsViewModel = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.query
    const viewModel = await bulkAppointmentsService.getBulkAppointmentsViewModel(res.locals, agencyId)
    res.json(viewModel)
  })

  const addBulkAppointments = asyncMiddleware(async (req, res) => {
    await bulkAppointmentsService.addBulkAppointments(res.locals, req.body)
    res.end()
  })

  const changeIepLevel = asyncMiddleware(async (req, res) => {
    const { offenderNumber } = req.params
    await iepDetailsService.changeIepLevel(res.locals, offenderNumber, req.body)
    res.end()
  })

  return {
    getActivityList,
    getAdjudications,
    getAdjudicationDetails,
    getHouseblockList,
    postAttendance,
    getAbsenceReasons,
    getEstablishmentRollCount,
    globalSearch,
    getMovementsIn,
    getMovementsOut,
    getIepDetails,
    getOffender,
    getOffendersInReception,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getOffendersEnRoute,
    uploadOffenders,
    getBulkAppointmentsViewModel,
    addBulkAppointments,
    bulkAppointmentsCsvTemplate,
    changeIepLevel,
    getPossibleLevels,
  }
}

module.exports = {
  factory,
}
