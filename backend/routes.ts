import express from 'express'

import { logError } from './logError'
import { alertFactory } from './controllers/alert'
import { probationDocumentsFactory } from './controllers/probationDocuments'
import { downloadProbationDocumentFactory } from './controllers/downloadProbationDocument'
import { attendanceStatisticsFactory } from './controllers/attendance/attendanceStatistics'
import referenceCodesService from './controllers/reference-codes-service'
import contentController from './controllers/content'
import selectResidentialLocationController from './controllers/selectResidentialLocation'
import bulkAppointmentsAddDetailsRouter from './routes/appointments/bulkAppointmentsAddDetailsRouter'
import bulkAppointmentsConfirmRouter from './routes/appointments/bulkAppointmentsConfirmRouter'
import bulkAppointmentsInvalidNumbersRouter from './routes/appointments/bulkAppointmentsInvalidNumbersRouter'
import bulkAppointmentsAddedRouter from './routes/appointments/bulkAppointmentsAddedRouter'
import bulkAppointmentsSlipsRouter from './routes/appointments/bulkAppointmentsSlipsRouter'
import bulkAppointmentsUploadRouter from './routes/appointments/bulkAppointmentsUploadRouter'
import bulkAppointmentsClashesRouter from './routes/appointments/bulkAppointmentsClashesRouter'
import changeCaseloadRouter from './routes/changeCaseloadRouter'
import addAppointmentRouter from './routes/appointments/addAppointmentRouter'
import prepostAppointmentRouter from './routes/appointments/prepostAppointmentsRouter'
import viewAppointments from './controllers/appointments/viewAppointments'
import confirmAppointmentRouter from './routes/appointments/confirmAppointmentRouter'
import prisonerProfileRouter from './routes/prisonerProfileRouter'
import retentionReasonsRouter from './routes/retentionReasonsRouter'
import attendanceChangeRouter from './routes/attendanceChangesRouter'
import covidRouter from './routes/covidRouter'
import prisonerSearchRouter from './routes/prisonerSearchRouter'
import cellMoveRouter from './routes/cellMoveRouter'
import establishmentRollRouter from './routes/establishmentRollRouter'
import changeSomeonesCellRouter from './routes/changeSomeonesCellRouter'
import globalSearchRouter from './routes/globalSearchRouter'
import amendCaseNoteRouter from './routes/caseNoteAmendmentRouter'
import createCaseNoteRouter from './routes/caseNoteCreationRouter'
import deleteCaseNoteRouter from './routes/caseNoteDeletionRouter'
import selectActivityLocation from './controllers/selectActivityLocation'
import contentfulServiceFactory from './services/contentfulService'
import notificationCookie from './services/notificationCookie'
import notificationDismiss from './controllers/notificationDismiss'
import contentfulClient from './contentfulClient'
import notificationBar from './middleware/notificationHandler'
import systemOauthClient from './api/systemOauthClient'
import { notifyClient } from './shared/notifyClient'
import { raiseAnalyticsEvent } from './raiseAnalyticsEvent'
import backToStart from './controllers/backToStart'
import permit from './controllers/permit'
import appointmentDetailsServiceFactory from './services/appointmentDetailsService'
import appointmentDetails from './controllers/appointmentDetails'
import appointmentConfirmDeletion from './controllers/appointmentConfirmDeletion'
import appointmentDeleteRecurringBookings from './controllers/appointmentDeleteRecurringBookings'
import appointmentDeleted from './controllers/appointmentDeleted'
import { cacheFactory } from './utils/singleValueInMemoryCache'

import whereaboutsRouter from './routes/whereabouts/whereaboutsRouter'

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
  incentivesApi,
  restrictedPatientApi,
}) => {
  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
      prisonerSearchUrl: req.session.prisonerSearchUrl,
    }
    next()
  })

  const contentfulCache = cacheFactory(30) // 30 second TTL

  router.use(
    '/manage-prisoner-whereabouts',
    whereaboutsRouter({ oauthApi, prisonApi, offenderSearchApi, systemOauthClient })
  )

  router.post('/notification/dismiss', notificationDismiss({ notificationCookie }))
  router.use(
    notificationBar({
      contentfulService: contentfulServiceFactory({ notificationCookie, contentfulClient }, contentfulCache),
      logError,
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
  router.use(
    '/prisoner/:offenderNo/add-case-note',
    createCaseNoteRouter({ prisonApi, caseNotesApi, oauthApi, systemOauthClient, restrictedPatientApi })
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi).attendanceStatistics
  )
  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/:reason',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi).attendanceStatisticsOffendersList
  )

  router.get(
    '/manage-prisoner-whereabouts/attendance-reason-statistics/suspended',
    attendanceStatisticsFactory(oauthApi, prisonApi, whereaboutsApi).attendanceStatisticsSuspendedList
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
    downloadProbationDocumentFactory(oauthApi, communityApi, systemOauthClient, prisonApi).downloadDocument
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

  router.use('/view-all-appointments', viewAppointments({ prisonApi, whereaboutsApi, logError }))

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
      incentivesApi,
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
      incentivesApi,
      restrictedPatientApi,
    })
  )

  router.use(
    '/change-someones-cell',
    permit(oauthApi, ['CELL_MOVE']),
    changeSomeonesCellRouter({
      systemOauthClient,
      prisonApi,
      whereaboutsApi,
    })
  )

  router.use('/current-covid-units', covidRouter(prisonApi, logError))

  router.use('/attendance-changes', attendanceChangeRouter({ prisonApi, whereaboutsApi }))

  router.use('/prisoner-search', prisonerSearchRouter({ prisonApi, incentivesApi, logError }))

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
    contentController({
      contentfulService: contentfulServiceFactory({ contentfulClient, notificationCookie }, contentfulCache),
    })
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

export default (dependencies) => setup(dependencies)
