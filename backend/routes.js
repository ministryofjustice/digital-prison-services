const express = require('express')
const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')

const { logError } = require('./logError')
const config = require('./config')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const adjudicationHistoryFactory = require('./controllers/adjudicationHistory')
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
const { prisonerImageFactory } = require('./controllers/prisonerImage')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const { appointmentsServiceFactory } = require('./services/appointmentsService')
const { alertFactory } = require('./controllers/alert')
const { probationDocumentsFactory } = require('./controllers/probationDocuments')
const { downloadProbationDocumentFactory } = require('./controllers/downloadProbationDocument')
const { attendanceStatisticsFactory } = require('./controllers/attendance/attendanceStatistics')
const referenceCodesService = require('./controllers/reference-codes-service')

const bulkAppointmentsAddDetailsRouter = require('./routes/appointments/bulkAppointmentsAddDetailsRouter')
const bulkAppointmentsConfirmRouter = require('./routes/appointments/bulkAppointmentsConfirmRouter')
const bulkAppointmentsInvalidNumbersRouter = require('./routes/appointments/bulkAppointmentsInvalidNumbersRouter')
const bulkAppointmentsAddedRouter = require('./routes/appointments/bulkAppointmentsAddedRouter')
const bulkAppointmentsSlipsRouter = require('./routes/appointments/bulkAppointmentsSlipsRouter')
const bulkAppointmentsUploadRouter = require('./routes/appointments/bulkAppointmentsUploadRouter')
const bulkAppointmentsClashesRouter = require('./routes/appointments/bulkAppointmentsClashesRouter')

const changeCaseloadRouter = require('./routes/changeCaseloadRouter')
const addAppointmentRouter = require('./routes/appointments/addAppointmentRouter')
const addCourtAppointmentRouter = require('./routes/appointments/courtRouter')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const prepostAppointmentRouter = require('./routes/appointments/prepostAppointmentsRouter')
const selectCourtAppointmentRooms = require('./routes/appointments/selectCourtAppointmentRoomsRouter')
const selectCourtAppointmentCourt = require('./routes/appointments/selectCourtAppointmentCourtRouter')
const viewAppointmentsRouter = require('./routes/appointments/viewAppointmentsRouter')

const retentionReasonsRouter = require('./routes/retentionReasonsRouter')

const requestBookingRouter = require('./routes/appointments/requestBookingRouter')

const prisonerSearchController = require('./controllers/search/prisonerSearch')
const getExistingEventsController = require('./controllers/attendance/getExistingEvents')
const getLocationExistingEventsController = require('./controllers/attendance/getLocationExistingEvents')
const endDateController = require('./controllers/appointments/endDate')

const controllerFactory = require('./controllers/controller').factory

const contextProperties = require('./contextProperties')
const oauthClientId = require('./api/oauthClientId')
const { csvParserService } = require('./csv-parser')
const handleErrors = require('./middleware/asyncHandler')
const { notifyClient } = require('./shared/notifyClient')

const router = express.Router()

const setup = ({ elite2Api, whereaboutsApi, oauthApi, communityApi, dataComplianceApi }) => {
  const controller = controllerFactory({
    activityListService: activityListFactory(elite2Api, whereaboutsApi, config),
    adjudicationHistoryService: adjudicationHistoryFactory(elite2Api),
    iepDetailsService: iepDetailsFactory(elite2Api),
    houseblockListService: houseblockListFactory(elite2Api, whereaboutsApi, config),
    attendanceService: attendanceFactory(whereaboutsApi),
    establishmentRollService: establishmentRollFactory(elite2Api),
    globalSearchService: globalSearchFactory(elite2Api),
    movementsService: movementsServiceFactory(elite2Api, oauthClientId),
    offenderLoader: offenderLoaderFactory(elite2Api),
    appointmentsService: appointmentsServiceFactory(elite2Api),
    csvParserService: csvParserService({ fs, isBinaryFileSync }),
    offenderService: offenderServiceFactory(elite2Api),
    offenderActivitesService: offenderActivitesFactory(elite2Api, whereaboutsApi),
    referenceCodesService: referenceCodesService(elite2Api),
    elite2Api,
  })

  router.use(async (req, res, next) => {
    const { userDetails } = req.session
    if (!userDetails) {
      req.session.userDetails = await oauthApi.currentUser(res.locals)
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
  router.use('/api/houseblockLocations', houseblockLocationsFactory(whereaboutsApi).getHouseblockLocations)
  router.use('/api/activityLocations', activityLocationsFactory(elite2Api).getActivityLocations)
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
  router.get('/app/images/:offenderNo/data', prisonerImageFactory(elite2Api).prisonerImage)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/prisoners-unaccounted-for', controller.getPrisonersUnaccountedFor)
  router.get('/api/get-alert-types', controller.getAlertTypes)
  router.get('/api/get-offender-events', getExistingEventsController({ elite2Api, logError }))
  router.get('/api/get-location-events', getLocationExistingEventsController({ elite2Api, logError }))
  router.get('/api/get-recurring-end-date', endDateController)
  router.post('/api/create-alert/:bookingId', handleErrors(controller.createAlert))
  router.get('/edit-alert', handleErrors(alertFactory(oauthApi, elite2Api).displayEditAlertPage))
  router.post(
    '/api/edit-alert/:bookingId/:alertId',
    handleErrors(alertFactory(oauthApi, elite2Api).handleEditAlertForm)
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics',
    handleErrors(attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError).attendanceStatistics)
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/:reason',
    handleErrors(
      attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError).attendanceStatisticsOffendersList
    )
  )
  router.get(
    '/offenders/:offenderNo/probation-documents',
    handleErrors(
      probationDocumentsFactory(oauthApi, elite2Api, communityApi, oauthClientId).displayProbationDocumentsPage
    )
  )
  router.get(
    '/offenders/:offenderNo/probation-documents/:documentId/download',
    handleErrors(downloadProbationDocumentFactory(oauthApi, communityApi, oauthClientId).downloadDocument)
  )

  router.get('/bulk-appointments/need-to-upload-file', async (req, res) => {
    res.render('bulkAppointmentsAdd.njk', { title: 'You need to upload a CSV file' })
  })

  router.get('/bulk-appointments/no-appointments-added', async (req, res) => {
    const { reason } = req.query
    req.session.data = null
    res.render('bulkAppointmentsNotAdded.njk', { reason })
  })

  router.use('/bulk-appointments/upload-file', bulkAppointmentsUploadRouter({ elite2Api, logError }))
  router.use(
    '/bulk-appointments/add-appointment-details',
    bulkAppointmentsAddDetailsRouter({ elite2Api, oauthApi, logError })
  )
  router.use('/bulk-appointments/appointments-added', bulkAppointmentsAddedRouter({ logError }))
  router.get('/bulk-appointments/appointments-movement-slips', bulkAppointmentsSlipsRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/confirm-appointments', bulkAppointmentsConfirmRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/appointment-clashes', bulkAppointmentsClashesRouter({ elite2Api, logError }))
  router.use('/bulk-appointments/invalid-numbers', bulkAppointmentsInvalidNumbersRouter({ elite2Api, logError }))

  router.use('/change-caseload', changeCaseloadRouter({ elite2Api, logError }))

  router.get('/terms', async (req, res) => {
    res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
  })

  router.use('/offenders/:offenderNo/add-appointment', addAppointmentRouter({ elite2Api, logError }))
  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ elite2Api, logError }))
  router.use(
    '/offenders/:offenderNo/prepost-appointments',
    prepostAppointmentRouter({ elite2Api, logError, oauthApi, notifyClient })
  )
  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment',
    addCourtAppointmentRouter({ elite2Api, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ elite2Api, whereaboutsApi, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({ elite2Api, whereaboutsApi, logError, oauthApi, notifyClient })
  )

  router.get('/prisoner-search', prisonerSearchController({ oauthApi, elite2Api, logError }))

  router.get('/videolink', async (req, res) => {
    res.render('courtsVideolink.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/videolink',
    })
  })

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api }))

  router.use('/appointments', viewAppointmentsRouter({ elite2Api, whereaboutsApi, oauthApi, logError }))

  router.use(
    '/offenders/:offenderNo/retention-reasons',
    retentionReasonsRouter({ elite2Api, dataComplianceApi, logError })
  )

  return router
}

module.exports = dependencies => setup(dependencies)
