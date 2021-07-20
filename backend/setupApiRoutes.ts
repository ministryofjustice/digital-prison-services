// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isBinaryFi... Remove this comment to see the full error message
const { isBinaryFileSync } = require('isbinaryfile')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logError'.
const { logError } = require('./logError')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'offenderAc... Remove this comment to see the full error message
const { offenderActivitesFactory } = require('./controllers/attendance/offenderActivities')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userLocati... Remove this comment to see the full error message
const { userLocationsFactory } = require('./controllers/userLocations')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userMeFact... Remove this comment to see the full error message
const { userMeFactory } = require('./controllers/userMe')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getConfigu... Remove this comment to see the full error message
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/attendance/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/attendance/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/attendance/activityList').getActivityListFactory
const houseblockListFactory = require('./controllers/attendance/houseblockList').getHouseblockListFactory
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'attendance... Remove this comment to see the full error message
const { attendanceFactory } = require('./controllers/attendance/attendance')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'imageFacto... Remove this comment to see the full error message
const { imageFactory } = require('./controllers/images')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'offenderLo... Remove this comment to see the full error message
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const getExistingEventsController = require('./controllers/attendance/getExistingEvents')
const getLocationExistingEventsController = require('./controllers/attendance/getLocationExistingEvents')
const endDateController = require('./controllers/appointments/endDate')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'existingEv... Remove this comment to see the full error message
const existingEventsService = require('./services/existingEventsService')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controllerFactory = require('./controllers/controller').factory

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'contextPro... Remove this comment to see the full error message
const contextProperties = require('./contextProperties')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'csvParserS... Remove this comment to see the full error message
const { csvParserService } = require('./csv-parser')
const handleErrors = require('./middleware/asyncHandler')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'setup'.
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
