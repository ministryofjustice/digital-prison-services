const express = require('express')
const fs = require('fs')
const { isBinaryFileSync } = require('isbinaryfile')

const { logError } = require('./logError')
const config = require('./config')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const setActiveCaseLoadFactory = require('./controllers/setactivecaseload').activeCaseloadFactory
const adjudicationHistoryFactory = require('./controllers/adjudicationHistoryService')
const offenderServiceFactory = require('./controllers/offenderService')
const { offenderActivitesFactory } = require('./controllers/offenderActivities')
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/activityList').getActivityListFactory
const iepDetailsFactory = require('./controllers/iepDetails').getIepDetailsFactory
const houseblockListFactory = require('./controllers/houseblockList').getHouseblockListFactory
const { attendanceFactory } = require('./controllers/attendance')
const establishmentRollFactory = require('./controllers/establishmentRollCount').getEstablishmentRollCountFactory
const { movementsServiceFactory } = require('./controllers/movementsService')
const { globalSearchFactory } = require('./controllers/globalSearch')
const { prisonerImageFactory } = require('./controllers/prisonerImage')
const { offenderLoaderFactory } = require('./controllers/offender-loader')
const bulkAppointmentsServiceFactory = require('./controllers/bulk-appointments-service')
const { alertFactory } = require('./controllers/alert')
const { probationDocumentsFactory } = require('./controllers/probationDocuments')
const { downloadProbationDocumentFactory } = require('./controllers/downloadProbationDocument')
const { attendanceStatisticsFactory } = require('./controllers/attendanceStatistics')
const referenceCodesService = require('./controllers/reference-codes-service')

const addAppointmentDetailsController = require('./controllers/appointmentDetailsController')
const bulkAppointmentsConfirmController = require('./controllers/bulkAppointmentsConfirmController')
const bulkAppointmentsAddedController = require('./controllers/bulkAppointmentsAddedController')
const bulkAppointmentsSlipsController = require('./controllers/bulkAppointmentsSlipsController')
const uploadAppointmentDetailsController = require('./controllers/bulkAppointmentsUploadController')
const bulkAppointmentsClashesController = require('./controllers/bulkAppointmentsClashesController')
const changeCaseloadController = require('./controllers/changeCaseloadController')

const controllerFactory = require('./controllers/controller').factory

const contextProperties = require('./contextProperties')
const oauthClientId = require('./api/oauthClientId')
const { csvParserService } = require('./csv-parser')
const handleErrors = require('./middleware/asyncHandler')

const router = express.Router()

const setup = ({ elite2Api, whereaboutsApi, oauthApi, communityApi }) => {
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
    bulkAppointmentsService: bulkAppointmentsServiceFactory(elite2Api),
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
  router.post('/api/setactivecaseload', handleErrors(setActiveCaseLoadFactory(elite2Api, logError).setActiveCaseload))
  router.use('/api/houseblockLocations', houseblockLocationsFactory(elite2Api).getHouseblockLocations)
  router.use('/api/activityLocations', activityLocationsFactory(elite2Api).getActivityLocations)
  router.use('/api/bookings/:offenderNo/iepSummary', controller.getIepDetails)
  router.use('/api/houseblocklist', controller.getHouseblockList)
  router.use('/api/activityList', controller.getActivityList)
  router.use('/api/offenders/:offenderNumber/adjudications/:adjudicationNumber', controller.getAdjudicationDetails)
  router.use('/api/offenders/:offenderNumber/adjudications', controller.getAdjudications)
  router.use('/api/offenders/:offenderNumber/iep-details', controller.getIepDetails)
  router.use('/api/iep-levels', controller.getPossibleLevels)
  router.post('/api/offenders/:offenderNumber/change-iep-level', controller.changeIepLevel)
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
  router.get('/api/bulk-appointments/view-model', controller.getBulkAppointmentsViewModel)
  router.post('/api/bulk-appointments', controller.addBulkAppointments)
  router.get('/bulk-appointments/csv-template', controller.bulkAppointmentsCsvTemplate)
  router.get('/api/prisoners-unaccounted-for', controller.getPrisonersUnaccountedFor)
  router.get('/api/get-alert-types', controller.getAlertTypes)
  router.post('/api/create-alert/:bookingId', handleErrors(controller.createAlert))
  router.get('/close-alert', handleErrors(alertFactory(oauthApi, elite2Api).displayCloseAlertPage))
  router.post(
    '/api/close-alert/:bookingId/:alertId',
    handleErrors(alertFactory(oauthApi, elite2Api).handleCloseAlertForm)
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
    res.render('addBulkAppointments.njk', { title: 'You need to upload a CSV file' })
  })

  router.get('/bulk-appointments/no-appointments-added', async (req, res) => {
    const { reason } = req.query
    res.render('noAppointmentsAdded.njk', { reason })
  })

  router.use('/bulk-appointments/upload-file', uploadAppointmentDetailsController({ elite2Api, logError }))
  router.use(
    '/bulk-appointments/add-appointment-details',
    addAppointmentDetailsController({ elite2Api, oauthApi, logError })
  )
  router.use('/bulk-appointments/appointments-added', bulkAppointmentsAddedController({ logError }))
  router.get('/bulk-appointments/appointments-movement-slips', bulkAppointmentsSlipsController({ elite2Api, logError }))
  router.use('/bulk-appointments/confirm-appointments', bulkAppointmentsConfirmController({ elite2Api, logError }))
  router.use('/bulk-appointments/appointment-clashes', bulkAppointmentsClashesController({ elite2Api, logError }))

  router.use('/change-caseload', changeCaseloadController({ elite2Api, logError }))

  router.get('/terms', async (req, res) => {
    res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
  })

  return router
}

module.exports = dependencies => setup(dependencies)
