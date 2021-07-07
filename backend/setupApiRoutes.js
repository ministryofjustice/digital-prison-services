const express = require('express')
const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')

const { logError } = require('./logError')
const config = require('./config')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const { offenderActivitesFactory } = require('./controllers/attendance/offenderActivities')
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/attendance/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/attendance/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/attendance/activityList').getActivityListFactory
const houseblockListFactory = require('./controllers/attendance/houseblockList').getHouseblockListFactory
const { attendanceFactory } = require('./controllers/attendance/attendance')
const { imageFactory } = require('./controllers/images')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const getExistingEventsController = require('./controllers/attendance/getExistingEvents')
const getLocationExistingEventsController = require('./controllers/attendance/getLocationExistingEvents')
const endDateController = require('./controllers/appointments/endDate')

const existingEventsService = require('./services/existingEventsService')

const controllerFactory = require('./controllers/controller').factory

const contextProperties = require('./contextProperties')
const { csvParserService } = require('./csv-parser')
const handleErrors = require('./middleware/asyncHandler')

const router = express.Router()

const setup = ({ prisonApi, whereaboutsApi, oauthApi, caseNotesApi }) => {
  const controller = controllerFactory({
    activityListService: activityListFactory(prisonApi, whereaboutsApi, config),
    houseblockListService: houseblockListFactory(prisonApi, whereaboutsApi, config),
    attendanceService: attendanceFactory(whereaboutsApi),
    offenderLoader: offenderLoaderFactory(prisonApi),
    csvParserService: csvParserService({ fs, isBinaryFileSync }),
    offenderActivitesService: offenderActivitesFactory(prisonApi, whereaboutsApi),
    caseNotesApi,
    logError,
  })

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      authUrl: config.apis.oauth2.url,
      currentUrlPath: req.originalUrl,
      hostname: req.hostname,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  // Extract pagination header information from requests and set on the 'context'
  router.use('/api', (req, res, next) => {
    contextProperties.setRequestPagination(res.locals, req.headers)
    next()
  })

  router.use('/api/config', getConfiguration)
  router.use('/api/userroles', userMeFactory(oauthApi).userRoles)
  router.use('/api/me', userMeFactory(oauthApi).userMe)
  router.use('/api/usercaseloads', userCaseLoadsFactory(prisonApi).userCaseloads)
  router.use('/api/userLocations', userLocationsFactory(prisonApi).userLocations)
  router.use(
    '/api/houseblockLocations',
    houseblockLocationsFactory({ whereaboutsApi, logError }).getHouseblockLocations
  )
  router.use('/api/activityLocations', activityLocationsFactory({ prisonApi, logError }).getActivityLocations)
  router.use('/api/houseblocklist', controller.getHouseblockList)
  router.use('/api/activityList', controller.getActivityList)
  router.use('/api/attendance/absence-reasons', controller.getAbsenceReasons)
  router.use('/api/attendance/batch', controller.batchUpdateAttendance)
  router.use('/api/attendance', controller.updateAttendance)
  router.use('/api/appointments/upload-offenders/:agencyId', controller.uploadOffenders)
  router.get('/app/images/:offenderNo/data', imageFactory(prisonApi).prisonerImage)
  router.get('/app/image/:imageId/data', imageFactory(prisonApi).image)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/prisoners-unaccounted-for', controller.getPrisonersUnaccountedFor)
  router.get('/api/get-case-note/:offenderNumber/:caseNoteId', handleErrors(controller.getCaseNote))
  router.get(
    '/api/get-offender-events',
    getExistingEventsController({ prisonApi, existingEventsService: existingEventsService(prisonApi), logError })
  )
  router.get(
    '/api/get-location-events',
    getLocationExistingEventsController({
      prisonApi,
      logError,
      existingEventsService: existingEventsService(prisonApi),
    })
  )
  router.get('/api/get-recurring-end-date', endDateController)

  return router
}

module.exports = (dependencies) => setup(dependencies)
