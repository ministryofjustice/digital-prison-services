const express = require('express')

const { logError } = require('./logError')
const config = require('./config')

const { alertFactory } = require('./controllers/alert')
const { caseNoteFactory } = require('./controllers/caseNote')
const { probationDocumentsFactory } = require('./controllers/probationDocuments')
const { downloadProbationDocumentFactory } = require('./controllers/downloadProbationDocument')
const { attendanceStatisticsFactory } = require('./controllers/attendance/attendanceStatistics')
const referenceCodesService = require('./controllers/reference-codes-service')
const contentController = require('./controllers/content')

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
const viewCourtBookingsRouter = require('./routes/appointments/viewCourtBookingsRouter')
const requestBookingRouter = require('./routes/appointments/requestBookingRouter')
const prisonerProfileRouter = require('./routes/prisonerProfileRouter')
const retentionReasonsRouter = require('./routes/retentionReasonsRouter')
const attendanceChangeRouter = require('./routes/attendanceChangesRouter')
const covidRouter = require('./routes/covidRouter')
const prisonerSearchRouter = require('./routes/prisonerSearchRouter')
const cellMoveRouter = require('./routes/cellMoveRouter')
const establishmentRollRouter = require('./routes/establishmentRollRouter')

const videolinkPrisonerSearchController = require('./controllers/videolink/search/videolinkPrisonerSearch')
const amendCaseNNoteRouter = require('./routes/caseNoteAmendmentRouter')

const currentUser = require('./middleware/currentUser')
const systemOauthClient = require('./api/systemOauthClient')
const handleErrors = require('./middleware/asyncHandler')
const { notifyClient } = require('./shared/notifyClient')

const { raiseAnalyticsEvent } = require('./raiseAnalyticsEvent')

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
}) => {
  router.use(currentUser({ prisonApi, oauthApi }))

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.originalUrl,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })
  router.get(
    '/edit-alert',
    handleErrors(alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).displayEditAlertPage)
  )
  router.post(
    '/edit-alert/:bookingId/:alertId',
    handleErrors(alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).handleEditAlertForm)
  )
  router.get(
    '/offenders/:offenderNo/create-alert',
    handleErrors(alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).displayCreateAlertPage)
  )
  router.post(
    '/offenders/:offenderNo/create-alert',
    handleErrors(alertFactory(oauthApi, prisonApi, referenceCodesService(prisonApi)).handleCreateAlertForm)
  )
  router.get(
    '/prisoner/:offenderNo/add-case-note',
    handleErrors(caseNoteFactory(prisonApi, caseNotesApi).displayCreateCaseNotePage)
  )
  router.post(
    '/prisoner/:offenderNo/add-case-note',
    handleErrors(caseNoteFactory(prisonApi, caseNotesApi).handleCreateCaseNoteForm)
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics',
    handleErrors(attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatistics)
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/:reason',
    handleErrors(
      attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatisticsOffendersList
    )
  )

  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/suspended',
    handleErrors(
      attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi, logError).attendanceStatisticsSuspendedList
    )
  )

  router.get(
    '/offenders/:offenderNo/probation-documents',
    handleErrors(
      probationDocumentsFactory(oauthApi, prisonApi, communityApi, systemOauthClient).displayProbationDocumentsPage
    )
  )
  router.get(
    '/offenders/:offenderNo/probation-documents/:documentId/download',
    handleErrors(downloadProbationDocumentFactory(oauthApi, communityApi, systemOauthClient).downloadDocument)
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

  router.get('/terms', async (req, res) => {
    res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
  })

  router.use('/offenders/:offenderNo/add-appointment', addAppointmentRouter({ prisonApi, logError }))
  router.use('/offenders/:offenderNo/confirm-appointment', confirmAppointmentRouter({ prisonApi, logError }))
  router.use(
    '/offenders/:offenderNo/prepost-appointments',
    prepostAppointmentRouter({ prisonApi, logError, oauthApi, whereaboutsApi, notifyClient, raiseAnalyticsEvent })
  )
  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment',
    addCourtAppointmentRouter({ prisonApi, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-court',
    selectCourtAppointmentCourt({ prisonApi, whereaboutsApi, logError })
  )

  router.use(
    '/:agencyId/offenders/:offenderNo/add-court-appointment/select-rooms',
    selectCourtAppointmentRooms({ prisonApi, whereaboutsApi, logError, oauthApi, notifyClient })
  )

  router.get('/videolink/prisoner-search', videolinkPrisonerSearchController({ oauthApi, prisonApi, logError }))

  router.get('/videolink', async (req, res) => {
    res.render('courtsVideolink.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/videolink',
    })
  })

  router.use('/videolink/bookings', viewCourtBookingsRouter({ prisonApi, whereaboutsApi, logError }))

  router.use('/request-booking', requestBookingRouter({ logError, notifyClient, whereaboutsApi, oauthApi, prisonApi }))

  router.use('/appointments', viewAppointmentsRouter({ prisonApi, whereaboutsApi, oauthApi, logError }))

  router.use(
    '/offenders/:offenderNo/retention-reasons',
    retentionReasonsRouter({ prisonApi, dataComplianceApi, logError })
  )

  router.use('/prisoner/:offenderNo/cell-move', cellMoveRouter({ oauthApi, prisonApi, whereaboutsApi, logError }))

  router.use(
    '/establishment-roll',
    establishmentRollRouter({
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
    })
  )

  router.use('/current-covid-units', covidRouter(prisonApi, logError))

  router.use('/attendance-changes', attendanceChangeRouter({ prisonApi, whereaboutsApi, oauthApi, logError }))

  router.use('/prisoner-search', prisonerSearchRouter({ prisonApi, logError }))

  router.use(
    '/prisoner/:offenderNo/case-notes/amend-case-note/:caseNoteId',
    amendCaseNNoteRouter({ prisonApi, caseNotesApi, logError })
  )

  router.get(['/content', '/content/:path'], contentController({ logError }))

  return router
}

module.exports = dependencies => setup(dependencies)
