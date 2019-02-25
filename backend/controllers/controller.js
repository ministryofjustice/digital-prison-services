const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')
const logger = require('../log')

const asyncMiddleware = require('../middleware/asyncHandler')
const { readFile } = require('../csv-parser')

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
        logger.error(`A file exceeding ${mb200} was rejected, filename ${offenders.originalFilename} size ${size}`)
        res.status(400)
        res.send('The csv is too large. Maximum file size is 200MB')
        return
      }

      const bytes = fs.readFileSync(offenders.path)
      if (isBinaryFileSync(bytes, size)) {
        logger.error(`Unsupported file type rejected, filename ${offenders.originalFilename}`)
        res.status(400)
        res.send('There was a problem importing your file, please use the template provided')
        return
      }

      const fileContent = await readFile(offenders.path)
      const viewModel = await offenderLoader.loadFromCsvContent(res.locals, fileContent)
      res.json(viewModel)
    } catch (error) {
      logger.error(
        `There was parsing error - ${error && error.message}, filename ${req.files &&
          req.files.offenders &&
          req.files.offenders.originalFilename}`
      )
      res.status(400)
      res.send('There was a problem importing your file, please use the template provided')
    }
  })

  const bulkAppointmentsCsvTemplate = asyncMiddleware(async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=offenders-for-appointments.csv')
    res.set('Content-Type', 'text/csv')

    const exampleTimes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
      .map(minutes => `22:${minutes}`)
      .join(' - ')

    res.status(200).send(`offenderNo, start time (example: ${exampleTimes})\n,\n`)
    res.end()
  })

  const getBulkAppointmentsViewModel = asyncMiddleware(async (req, res) => {
    const { agencyId } = req.query
    const viewModel = await bulkAppoinemtnsService.getBulkAppointmentsViewModel(res.locals, agencyId)
    res.json(viewModel)
  })

  const addBulkAppointments = asyncMiddleware(async (req, res) => {
    await bulkAppoinemtnsService.addBulkAppointments(res.locals, req.body)
    res.end()
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
    addBulkAppointments,
    bulkAppointmentsCsvTemplate,
  }
}

module.exports = {
  factory,
}
