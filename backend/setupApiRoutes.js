const express = require('express')
const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')

const { logError } = require('./logError')
const config = require('./config')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const adjudicationHistoryFactory = require('./services/adjudicationHistory')
const offenderServiceFactory = require('./services/offenderService')
const { offenderActivitesFactory } = require('./controllers/attendance/offenderActivities')
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/attendance/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/attendance/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/attendance/activityList').getActivityListFactory
const iepDetailsFactory = require('./controllers/incentiveLevelDetails').getIepDetailsFactory
const houseblockListFactory = require('./controllers/attendance/houseblockList').getHouseblockListFactory
const { attendanceFactory } = require('./controllers/attendance/attendance')
const establishmentRollFactory = require('./controllers/establishmentRollCount').getEstablishmentRollCountFactory
const { movementsServiceFactory } = require('./services/movementsService')
const { globalSearchFactory } = require('./controllers/globalSearch')
const { imageFactory } = require('./controllers/images')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const { appointmentsServiceFactory } = require('./services/appointmentsService')
const getExistingEventsController = require('./controllers/attendance/getExistingEvents')
const getLocationExistingEventsController = require('./controllers/attendance/getLocationExistingEvents')
const endDateController = require('./controllers/appointments/endDate')

const existingEventsService = require('./services/existingEventsService')

const currentUser = require('./middleware/currentUser')

const controllerFactory = require('./controllers/controller').factory

const contextProperties = require('./contextProperties')
const systemOauthClient = require('./api/systemOauthClient')
const { csvParserService } = require('./csv-parser')
const handleErrors = require('./middleware/asyncHandler')

const router = express.Router()

const setup = ({ elite2Api, whereaboutsApi, oauthApi, caseNotesApi, offenderSearchApi }) => {
  const controller = controllerFactory({
    activityListService: activityListFactory(elite2Api, whereaboutsApi, config),
    adjudicationHistoryService: adjudicationHistoryFactory(elite2Api),
    iepDetailsService: iepDetailsFactory(elite2Api),
    houseblockListService: houseblockListFactory(elite2Api, whereaboutsApi, config),
    attendanceService: attendanceFactory(whereaboutsApi),
    establishmentRollService: establishmentRollFactory(elite2Api),
    globalSearchService: globalSearchFactory(offenderSearchApi),
    movementsService: movementsServiceFactory(elite2Api, systemOauthClient),
    offenderLoader: offenderLoaderFactory(elite2Api),
    appointmentsService: appointmentsServiceFactory(elite2Api),
    csvParserService: csvParserService({ fs, isBinaryFileSync }),
    offenderService: offenderServiceFactory(elite2Api),
    offenderActivitesService: offenderActivitesFactory(elite2Api, whereaboutsApi),
    caseNotesApi,
    logError,
  })

  router.use(currentUser({ elite2Api, oauthApi }))

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
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
  router.use('/api/usercaseloads', userCaseLoadsFactory(elite2Api).userCaseloads)
  router.use('/api/userLocations', userLocationsFactory(elite2Api).userLocations)
  router.use(
    '/api/houseblockLocations',
    houseblockLocationsFactory({ whereaboutsApi, logError }).getHouseblockLocations
  )
  router.use('/api/activityLocations', activityLocationsFactory({ elite2Api, logError }).getActivityLocations)
  router.use('/api/bookings/:offenderNo/iepSummary', controller.getIepDetails)
  router.use('/api/houseblocklist', controller.getHouseblockList)
  router.use('/api/activityList', controller.getActivityList)
  router.use('/api/offenders/:offenderNumber/adjudications/:adjudicationNumber', controller.getAdjudicationDetails)
  router.use('/api/offenders/:offenderNumber/adjudications', controller.getAdjudications)
  router.use('/api/offenders/:offenderNumber/iep-details', controller.getIepDetails)
  router.use('/api/iep-levels', controller.getPossibleLevels)
  router.post('/api/offenders/:offenderNumber/change-incentive-level', controller.changeIepLevel)
  router.use('/api/attendance/absence-reasons', controller.getAbsenceReasons)
  router.use('/api/attendance/batch', controller.batchUpdateAttendance)
  router.use('/api/attendance', controller.updateAttendance)
  router.use('/api/offenders/:offenderNo', controller.getOffender)
  router.use('/api/establishmentRollCount', controller.getEstablishmentRollCount)
  router.use('/api/movements/:agencyId/in', controller.getMovementsIn)
  router.use('/api/movements/:agencyId/out', controller.getMovementsOut)
  router.use('/api/movements/:agencyId/in-reception', controller.getOffendersInReception)
  router.use('/api/movements/livingUnit/:livingUnitId/currently-out', controller.getOffendersCurrentlyOutOfLivingUnit)
  router.use('/api/movements/agency/:agencyId/currently-out', controller.getOffendersCurrentlyOutOfAgency)
  router.use('/api/movements/:agencyId/en-route', controller.getOffendersEnRoute)
  router.use('/api/globalSearch', controller.globalSearch)
  router.use('/api/appointments/upload-offenders/:agencyId', controller.uploadOffenders)
  router.get('/app/images/:offenderNo/data', imageFactory(elite2Api).prisonerImage)
  router.get('/app/image/:imageId/data', imageFactory(elite2Api).image)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/prisoners-unaccounted-for', controller.getPrisonersUnaccountedFor)
  router.get('/api/get-case-note/:offenderNumber/:caseNoteId', handleErrors(controller.getCaseNote))
  router.get(
    '/api/get-offender-events',
    getExistingEventsController({ elite2Api, existingEventsService: existingEventsService(elite2Api), logError })
  )
  router.get(
    '/api/get-location-events',
    getLocationExistingEventsController({
      elite2Api,
      logError,
      existingEventsService: existingEventsService(elite2Api),
    })
  )
  router.get('/api/get-recurring-end-date', endDateController)

  return router
}

module.exports = dependencies => setup(dependencies)
