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
  offenderActivitesService,
  referenceCodesService,
  elite2Api,
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

  const updateAttendance = asyncMiddleware(async (req, res) => {
    const attendanceRecord = await attendanceService.updateAttendance(res.locals, req.body)
    res.json(attendanceRecord)
  })

  const batchUpdateAttendance = asyncMiddleware(async (req, res) => {
    const batchAttendanceRecord = await attendanceService.batchUpdateAttendance(res.locals, req.body)
    res.json(batchAttendanceRecord)
  })

  const getAbsenceReasons = asyncMiddleware(async (req, res) => {
    const absenceReasons = await attendanceService.getAbsenceReasons(res.locals)
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

  const getOffenderListfromCsvValues = asyncMiddleware(async (req, res) => {
    const { file } = req.files
    const { location } = req.body

    csvParserService
      .loadAndParseCsvFile(file)
      .then(async fileContent => {
        const prisonersDetails = await offenderLoader.loadFromCsvContent(res.locals, fileContent, location)
        const prisonerList = prisonersDetails.map(prisoner => ({
          bookingId: prisoner.bookingNo,
          offenderNo: prisoner.offenderNo,
          firstName: prisoner.firstName,
          lastName: prisoner.lastName,
        }))

        req.flash('prisonersListed', prisonerList)
        // return res.redirect('/johnspage')
      })
      .catch(error => {
        req.flash('errors', { text: error.message, href: '#file' })
        return res.redirect('back')
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

  const getPrisonersUnaccountedFor = asyncMiddleware(async (req, res) => {
    const { agencyId, date, timeSlot } = req.query
    const viewModel = await offenderActivitesService.getPrisonersUnaccountedFor(res.locals, agencyId, date, timeSlot)
    res.json(viewModel)
  })

  const getAlertTypes = asyncMiddleware(async (req, res) => {
    const types = await referenceCodesService.getAlertTypes(res.locals)
    res.json(types)
  })

  const createAlert = async (req, res) => {
    const { bookingId } = req.params
    const { body } = req

    if (!body) {
      res.status(400)
      res.end()
      return
    }

    await elite2Api.createAlert(res.locals, bookingId, {
      alertType: body.alertType,
      alertCode: body.alertSubType,
      comment: body.comment,
      alertDate: body.effectiveDate,
    })

    res.status(201)
    res.end()
  }

  return {
    getActivityList,
    getAdjudications,
    getAdjudicationDetails,
    getHouseblockList,
    updateAttendance,
    batchUpdateAttendance,
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
    getOffenderListfromCsvValues,
    getBulkAppointmentsViewModel,
    addBulkAppointments,
    bulkAppointmentsCsvTemplate,
    changeIepLevel,
    getPossibleLevels,
    getPrisonersUnaccountedFor,
    getAlertTypes,
    createAlert,
  }
}

module.exports = {
  factory,
}
