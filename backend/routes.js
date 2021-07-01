import whereaboutsHomepage from './controllers/whereabouts/whereaboutsHomepage'

const express = require('express')
const { logError } = require('./logError')

const { alertFactory } = require('./controllers/alert')
const { caseNoteFactory } = require('./controllers/caseNote')
const { probationDocumentsFactory } = require('./controllers/probationDocuments')
const { downloadProbationDocumentFactory } = require('./controllers/downloadProbationDocument')
const { attendanceStatisticsFactory } = require('./controllers/attendance/attendanceStatistics')
const referenceCodesService = require('./controllers/reference-codes-service')
const contentController = require('./controllers/content')
const selectResidentialLocationController = require('./controllers/selectResidentialLocation')

const bulkAppointmentsAddDetailsRouter = require('./routes/appointments/bulkAppointmentsAddDetailsRouter')
const bulkAppointmentsConfirmRouter = require('./routes/appointments/bulkAppointmentsConfirmRouter')
const bulkAppointmentsInvalidNumbersRouter = require('./routes/appointments/bulkAppointmentsInvalidNumbersRouter')
const bulkAppointmentsAddedRouter = require('./routes/appointments/bulkAppointmentsAddedRouter')
const bulkAppointmentsSlipsRouter = require('./routes/appointments/bulkAppointmentsSlipsRouter')
const bulkAppointmentsUploadRouter = require('./routes/appointments/bulkAppointmentsUploadRouter')
const bulkAppointmentsClashesRouter = require('./routes/appointments/bulkAppointmentsClashesRouter')
const changeCaseloadRouter = require('./routes/changeCaseloadRouter')
const addAppointmentRouter = require('./routes/appointments/addAppointmentRouter')
const prepostAppointmentRouter = require('./routes/appointments/prepostAppointmentsRouter')
const viewAppointments = require('./controllers/appointments/viewAppointments')
const confirmAppointmentRouter = require('./routes/appointments/confirmAppointmentRouter')
const prisonerProfileRouter = require('./routes/prisonerProfileRouter')
const retentionReasonsRouter = require('./routes/retentionReasonsRouter')
const attendanceChangeRouter = require('./routes/attendanceChangesRouter')
const covidRouter = require('./routes/covidRouter')
const prisonerSearchRouter = require('./routes/prisonerSearchRouter')
const cellMoveRouter = require('./routes/cellMoveRouter')
const establishmentRollRouter = require('./routes/establishmentRollRouter')
const changeSomeonesCellRouter = require('./routes/changeSomeonesCellRouter')
const globalSearchRouter = require('./routes/globalSearchRouter')

const amendCaseNoteRouter = require('./routes/caseNoteAmendmentRouter')
const deleteCaseNoteRouter = require('./routes/caseNoteDeletionRouter')

const selectActivityLocation = require('./controllers/selectActivityLocation')

const contentfulServiceFactory = require('./services/contentfulService')
const notificationCookie = require('./services/notificationCookie')
const notificationDismiss = require('./controllers/notificationDismiss')
const contentfulClient = require('./contentfulClient')
const notificationBar = require('./middleware/notificationHandler')

const systemOauthClient = require('./api/systemOauthClient')
const { notifyClient } = require('./shared/notifyClient')

const { raiseAnalyticsEvent } = require('./raiseAnalyticsEvent')
const backToStart = require('./controllers/backToStart')
const permit = require('./controllers/permit')
const appointmentDetailsServiceFactory = require('./services/appointmentDetailsService')
const appointmentDetails = require('./controllers/appointmentDetails')
const appointmentConfirmDeletion = require('./controllers/appointmentConfirmDeletion')
const appointmentDeleteRecurringBookings = require('./controllers/appointmentDeleteRecurringBookings')
const appointmentDeleted = require('./controllers/appointmentDeleted')

const router = express.Router()

const setup = ({
  prisonApi,
  whereaboutsApi,
  oauthApi,
  communityApi,
  dataComplianceApi,
  keyworkerApi,
  caseNotesApi,
  allocationManagerApi,
  pathfinderApi,
  socApi,
  offenderSearchApi,
  complexityApi,
  curiousApi,
}) => {
  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  router.use('/manage-prisoner-whereabouts', whereaboutsHomepage({ oauthApi, prisonApi }))

  router.post('/notification/dismiss', notificationDismiss({ notificationCookie }))
  router.use(
    notificationBar({
      contentfulService: contentfulServiceFactory({ notificationCookie, contentfulClient }),
      logError,
      notificationCookie,
    })
  )

  router.get('/edit-alert', alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).displayEditAlertPage)
  router.post(
    '/edit-alert/:bookingId/:alertId',
    alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).handleEditAlertForm
  )
  router.get(
    '/offenders/:offenderNo/create-alert',
    alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).displayCreateAlertPage
  )
  router.post(
    '/offenders/:offenderNo/create-alert',
    alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).handleCreateAlertForm
  )
  router.get('/prisoner/:offenderNo/add-case-note', caseNoteFactory(prisonApi, caseNotesApi).displayCreateCaseNotePage)
  router.post('/prisoner/:offenderNo/add-case-note', caseNoteFactory(prisonApi, caseNotesApi).handleCreateCaseNoteForm)
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatistics
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/:reason',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatisticsOffendersList
  )

  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/suspended',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatisticsSuspendedList
  )

  router.get(
    '/manage-prisoner-whereabouts/select-residential-location',
    selectResidentialLocationController(whereaboutsApi).index
  )
  router.post(
    '/manage-prisoner-whereabouts/select-residential-location',
    selectResidentialLocationController(whereaboutsApi).post
  )

  router.get(
    '/offenders/:offenderNo/probation-documents',
    probationDocumentsFactory(oauthApi, prisonApi, communityApi, systemOauthClient).displayProbationDocumentsPage
  )
  router.get(
    '/offenders/:offenderNo/probation-documents/:documentId/download',
    downloadProbationDocumentFactory(oauthApi, communityApi, systemOauthClient).downloadDocument
  )

  router.get('/bulk-appointments/need-to-upload-file', async (req, res) => {
    res.render('bulkAppointmentsAdd.njk', { title: 'You need to upload a CSV file' })
  })

  router.get('/bulk-appointments/no-appointments-added', async (req, res) => {
    const { reason } = req.query
    req.session.data = null
    res.render('bulkAppointmentsNotAdded.njk', { reason })
  })

  router.use('/bulk-appointments/upload-file', bulkAppointmentsUploadRouter({ prisonApi, logError }))
  router.use(
    '/bulk-appointments/add-appointment-details',
    bulkAppointmentsAddDetailsRouter({ prisonApi, oauthApi, logError })
  )
  router.use('/bulk-appointments/appointments-added', bulkAppointmentsAddedRouter({ logError }))
  router.get('/bulk-appointments/appointments-movement-slips', bulkAppointmentsSlipsRouter({ prisonApi, logError }))
  router.use('/bulk-appointments/confirm-appointments', bulkAppointmentsConfirmRouter({ prisonApi, logError }))
  router.use('/bulk-appointments/appointment-clashes', bulkAppointmentsClashesRouter({ prisonApi, logError }))
  router.use('/bulk-appointments/invalid-numbers', bulkAppointmentsInvalidNumbersRouter({ prisonApi, logError }))

  router.use('/change-caseload', changeCaseloadRouter({ prisonApi, logError }))

  router.use('/offenders/:offenderNo/add-appointment', addAppointmentRouter({ prisonApi, whereaboutsApi, logError }))

  router.use(
    '/offenders/:offenderNo/prepost-appointments',
    prepostAppointmentRouter({ prisonApi, logError, oauthApi, whereaboutsApi, notifyClient, raiseAnalyticsEvent })
  )

  router.use('/view-all-appointments', viewAppointments({ prisonApi, whereaboutsApi, oauthApi, logError }))

  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ prisonApi, logError }))

  router.use(
    '/offenders/:offenderNo/retention-reasons',
    retentionReasonsRouter({ prisonApi, dataComplianceApi, logError })
  )

  router.use(
    '/prisoner/:offenderNo/cell-move',
    cellMoveRouter({
      oauthApi,
      prisonApi,
      whereaboutsApi,
      caseNotesApi,
      logError,
    })
  )

  router.use(
    '/establishment-roll',
    establishmentRollRouter({
      oauthApi,
      prisonApi,
      systemOauthClient,
      logError,
    })
  )

  router.use(
    '/prisoner/:offenderNo',
    prisonerProfileRouter({
      prisonApi,
      keyworkerApi,
      oauthApi,
      caseNotesApi,
      allocationManagerApi,
      systemOauthClient,
      pathfinderApi,
      dataComplianceApi,
      logError,
      socApi,
      whereaboutsApi,
      complexityApi,
      offenderSearchApi,
      curiousApi,
    })
  )

  router.use(
    '/change-someones-cell',
    permit(oauthApi, ['CELL_MOVE']),
    changeSomeonesCellRouter({
      caseNotesApi,
      prisonApi,
      whereaboutsApi,
    })
  )

  router.use('/current-covid-units', covidRouter(prisonApi, logError))

  router.use('/attendance-changes', attendanceChangeRouter({ prisonApi, whereaboutsApi, oauthApi, logError }))

  router.use('/prisoner-search', prisonerSearchRouter({ prisonApi, logError }))

  router.use(
    '/prisoner/:offenderNo/case-notes/amend-case-note/:caseNoteId',
    amendCaseNoteRouter({ prisonApi, caseNotesApi, logError })
  )

  router.use(
    '/prisoner/:offenderNo/case-notes/delete-case-note/:caseNoteId/:caseNoteAmendmentId?',
    deleteCaseNoteRouter({ prisonApi, caseNotesApi, oauthApi, logError })
  )

  router.get(
    ['/content', '/content/:path'],
    contentController({ contentfulService: contentfulServiceFactory({ contentfulClient }) })
  )

  router.use('/global-search', globalSearchRouter({ offenderSearchApi, oauthApi, logError }))

  router.get('/manage-prisoner-whereabouts/select-location', selectActivityLocation({ prisonApi }).index)
  router.post('/manage-prisoner-whereabouts/select-location', selectActivityLocation({ prisonApi }).post)

  router.get('/back-to-start', backToStart())

  router.get(
    '/appointment-details/:id/confirm-deletion',
    appointmentConfirmDeletion({
      whereaboutsApi,
      appointmentDetailsService: appointmentDetailsServiceFactory({ prisonApi }),
    }).index
  )
  router.post(
    '/appointment-details/:id/confirm-deletion',
    appointmentConfirmDeletion({
      whereaboutsApi,
      appointmentDetailsService: appointmentDetailsServiceFactory({ prisonApi }),
    }).post
  )
  router.get(
    '/appointment-details/:id/delete-recurring-bookings',
    appointmentDeleteRecurringBookings({
      whereaboutsApi,
    }).index
  )
  router.post(
    '/appointment-details/:id/delete-recurring-bookings',
    appointmentDeleteRecurringBookings({
      whereaboutsApi,
    }).post
  )
  router.get('/appointment-details/deleted', appointmentDeleted().index)
  router.use(
    '/appointment-details/:id',
    appointmentDetails({
      oauthApi,
      prisonApi,
      whereaboutsApi,
      appointmentDetailsService: appointmentDetailsServiceFactory({ prisonApi }),
    })
  )

  return router
}

module.exports = (dependencies) => setup(dependencies)
