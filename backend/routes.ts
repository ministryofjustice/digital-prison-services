import express from 'express'

import { logError } from './logError'
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
import viewAppointments from './controllers/appointments/viewAppointments'
import confirmAppointmentRouter from './routes/appointments/confirmAppointmentRouter'
import prisonerProfileRouter from './routes/prisonerProfileRouter'
import retentionReasonsRouter from './routes/retentionReasonsRouter'
import attendanceChangesRouter from './routes/attendanceChangesRouter'
import covidRouter from './routes/covidRouter'
import prisonerSearchRouter from './routes/prisonerSearchRouter'
import establishmentRollRouter from './routes/establishmentRollRouter'
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
import backToStart from './controllers/backToStart'
import permit from './controllers/permit'
import appointmentDetailsServiceFactory from './services/appointmentDetailsService'
import appointmentDetails from './controllers/appointmentDetails'
import appointmentConfirmDeletion from './controllers/appointmentConfirmDeletion'
import appointmentDeleteRecurringBookings from './controllers/appointmentDeleteRecurringBookings'
import appointmentDeleted from './controllers/appointmentDeleted'
import { cacheFactory } from './utils/singleValueInMemoryCache'
import asyncMiddleware from './middleware/asyncHandler'
import videoLinkBookingServiceFactory from './services/videoLinkBookingService'

import whereaboutsRouter from './routes/whereabouts/whereaboutsRouter'
import maintenancePage from './controllers/maintenancePage'
import prisonerProfileBackLinkRedirect from './controllers/prisonerProfile/prisonerProfileBackLinkRedirect'
import config from './config'
import changeSomeonesCellHasMovedRouter from './routes/changeSomeonesCellHasMovedRouter'

const {
  app: { covidUnitsEnabled, prisonerProfileRedirect },
  apis: { activities, appointments },
} = config

const isActivitiesRolledOut = (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  if (
    activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
    appointments.enabled_prisons.split(',').includes(activeCaseLoadId)
  ) {
    res.render('whereaboutsServiceDeactivated.njk', {
      activeCaseLoadId,
    })
  } else {
    next()
  }
}

const isAppointmentsRolledOut = (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  if (appointments.enabled_prisons.split(',').includes(activeCaseLoadId)) {
    res.redirect(appointments.url)
  } else {
    next()
  }
}

const isCreateIndividualAppointmentRolledOut = (req, res, next) => {
  const { activeCaseLoadId } = req.session.userDetails
  if (appointments.enabled_prisons.split(',').includes(activeCaseLoadId)) {
    const { offenderNo } = req.params
    res.redirect(`${appointments.url}/create/start-prisoner/${offenderNo}`)
  } else {
    next()
  }
}

const redirectToPrisonerProfileForAppointments = (req, res, next) => {
  res.redirect(`${prisonerProfileRedirect.url}/prisoner/${req.params.offenderNo}/add-appointment`)
}

const isCovidUnitsEnabled = (req, res, next) => {
  if (!covidUnitsEnabled) {
    res.redirect('/')
  } else {
    next()
  }
}

const router = express.Router()

const setup = ({
  prisonApi,
  prisonerAlertsApi,
  whereaboutsApi,
  bookAVideoLinkApi,
  locationsInsidePrisonApi,
  oauthApi,
  hmppsManageUsersApi,
  deliusIntegrationApi,
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
  nonAssociationsApi,
  restrictedPatientApi,
  whereaboutsMaintenanceMode,
  getClientCredentialsTokens,
  nomisMapping,
}) => {
  const videoLinkBookingService = videoLinkBookingServiceFactory({
    whereaboutsApi,
    bookAVideoLinkApi,
    locationsInsidePrisonApi,
    nomisMapping,
  })

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
    }
    next()
  })

  const contentfulCache = cacheFactory(30) // 30 second TTL

  router.post('/notification/dismiss', notificationDismiss({ notificationCookie }))
  router.use(
    notificationBar({
      contentfulService: contentfulServiceFactory({ notificationCookie, contentfulClient }, contentfulCache),
      logError,
    })
  )

  router.use(
    '/prisoner/:offenderNo/add-case-note',
    createCaseNoteRouter({ prisonApi, oauthApi, systemOauthClient, restrictedPatientApi })
  )

  if (whereaboutsMaintenanceMode) {
    router.use('/manage-prisoner-whereabouts*', maintenancePage('Prisoner whereabouts'))
  } else {
    router.use(
      '/manage-prisoner-whereabouts',
      whereaboutsRouter({ oauthApi, prisonApi, prisonerAlertsApi, offenderSearchApi, systemOauthClient })
    )
    router.get(
      '/manage-prisoner-whereabouts/attendance-reason-statistics',
      isActivitiesRolledOut,
      attendanceStatisticsFactory(oauthApi, hmppsManageUsersApi, prisonApi, whereaboutsApi).attendanceStatistics
    )
    router.get(
      '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/:reason',
      isActivitiesRolledOut,
      attendanceStatisticsFactory(oauthApi, hmppsManageUsersApi, prisonApi, whereaboutsApi)
        .attendanceStatisticsOffendersList
    )

    router.get(
      '/manage-prisoner-whereabouts/attendance-reason-statistics/suspended',
      isActivitiesRolledOut,
      attendanceStatisticsFactory(oauthApi, hmppsManageUsersApi, prisonApi, whereaboutsApi)
        .attendanceStatisticsSuspendedList
    )

    router.get(
      '/manage-prisoner-whereabouts/select-residential-location',
      isActivitiesRolledOut,
      selectResidentialLocationController(locationsInsidePrisonApi, systemOauthClient).index
    )
    router.post(
      '/manage-prisoner-whereabouts/select-residential-location',
      isActivitiesRolledOut,
      selectResidentialLocationController(locationsInsidePrisonApi, systemOauthClient).post
    )

    router.get(
      '/manage-prisoner-whereabouts/select-location',
      isActivitiesRolledOut,
      selectActivityLocation({ prisonApi }).index
    )
    router.post(
      '/manage-prisoner-whereabouts/select-location',
      isActivitiesRolledOut,
      selectActivityLocation({ prisonApi }).post
    )
  }

  router.get(
    '/offenders/:offenderNo/probation-documents',
    asyncMiddleware(
      probationDocumentsFactory(oauthApi, hmppsManageUsersApi, prisonApi, deliusIntegrationApi, systemOauthClient)
        .displayProbationDocumentsPage
    )
  )
  router.get(
    '/offenders/:offenderNo/probation-documents/:documentId/download',
    downloadProbationDocumentFactory(oauthApi, hmppsManageUsersApi, deliusIntegrationApi, systemOauthClient, prisonApi)
      .downloadDocument
  )

  router.get('/bulk-appointments/need-to-upload-file', isAppointmentsRolledOut, async (req, res) => {
    res.render('bulkAppointmentsAdd.njk', { title: 'You need to upload a CSV file' })
  })

  router.get('/bulk-appointments/no-appointments-added', isAppointmentsRolledOut, async (req, res) => {
    const { reason } = req.query
    req.session.data = null
    res.render('bulkAppointmentsNotAdded.njk', { reason })
  })

  router.use(
    '/bulk-appointments/upload-file',
    isAppointmentsRolledOut,
    bulkAppointmentsUploadRouter({ prisonApi, logError })
  )
  router.use(
    '/bulk-appointments/add-appointment-details',
    isAppointmentsRolledOut,
    bulkAppointmentsAddDetailsRouter({ prisonApi, locationsInsidePrisonApi, oauthApi, logError })
  )
  router.use(
    '/bulk-appointments/appointments-added',
    isAppointmentsRolledOut,
    bulkAppointmentsAddedRouter({ logError })
  )
  router.get(
    '/bulk-appointments/appointments-movement-slips',
    isAppointmentsRolledOut,
    bulkAppointmentsSlipsRouter({ prisonApi, logError })
  )
  router.use(
    '/bulk-appointments/confirm-appointments',
    isAppointmentsRolledOut,
    bulkAppointmentsConfirmRouter({ systemOauthClient, prisonApi })
  )
  router.use(
    '/bulk-appointments/appointment-clashes',
    isAppointmentsRolledOut,
    bulkAppointmentsClashesRouter({ systemOauthClient, prisonApi })
  )
  router.use(
    '/bulk-appointments/invalid-numbers',
    isAppointmentsRolledOut,
    bulkAppointmentsInvalidNumbersRouter({ prisonApi, logError })
  )

  router.use('/change-caseload', changeCaseloadRouter({ prisonApi, logError, systemOauthClient }))

  if (whereaboutsMaintenanceMode) {
    router.use(
      '/offenders/:offenderNo/add-appointment',
      isAppointmentsRolledOut,
      maintenancePage('Appointment details')
    )
  } else {
    router.use(
      '/offenders/:offenderNo/add-appointment',
      isCreateIndividualAppointmentRolledOut,
      redirectToPrisonerProfileForAppointments,
      addAppointmentRouter({ systemOauthClient, prisonApi, locationsInsidePrisonApi, whereaboutsApi, logError })
    )
  }

  router.use(
    '/view-all-appointments',
    isAppointmentsRolledOut,
    viewAppointments({
      systemOauthClient,
      prisonApi,
      offenderSearchApi,
      whereaboutsApi,
      locationsInsidePrisonApi,
      bookAVideoLinkApi,
      nomisMapping,
    })
  )

  router.use(
    '/offenders/:offenderNo/confirm-appointment',
    isAppointmentsRolledOut,
    confirmAppointmentRouter({ prisonApi, locationsInsidePrisonApi, logError })
  )

  router.use(
    '/offenders/:offenderNo/retention-reasons',
    retentionReasonsRouter({ prisonApi, dataComplianceApi, logError })
  )

  router.use('/manage-prisoner-whereabouts/activity-results*', (req, res, next) => {
    const { activeCaseLoadId } = req.session.userDetails
    if (
      activities.enabled_prisons.split(',').includes(activeCaseLoadId) ||
      appointments.enabled_prisons.split(',').includes(activeCaseLoadId)
    ) {
      res.render('whereaboutsServiceDeactivated.njk', {
        activeCaseLoadId,
      })
    } else {
      next()
    }
  })

  router.use('/change-someones-cell', (req, res) => res.redirect('/change-someones-cell-has-moved'))

  router.use('/change-someones-cell/*', (req, res) => res.redirect('/change-someones-cell-has-moved'))

  router.use('/prisoner/:offenderNo/cell-move*', (req, res) => res.redirect('/change-someones-cell-has-moved'))

  router.use('/prisoner/:offenderNo/reception-move*', (req, res) => res.redirect('/change-someones-cell-has-moved'))

  router.use('/change-someones-cell-has-moved', changeSomeonesCellHasMovedRouter())

  router.use('/establishment-roll', establishmentRollRouter())

  router.use(
    '/prisoner/:offenderNo',
    prisonerProfileRouter({
      prisonApi,
      prisonerAlertsApi,
      keyworkerApi,
      oauthApi,
      hmppsManageUsersApi,
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
      nonAssociationsApi,
    })
  )

  router.use('/change-someones-cell*', permit(oauthApi, ['CELL_MOVE']), changeSomeonesCellHasMovedRouter())

  router.use('/current-covid-units', isCovidUnitsEnabled, covidRouter(systemOauthClient, prisonApi, prisonerAlertsApi))

  router.use('/attendance-changes', attendanceChangesRouter({ prisonApi, whereaboutsApi, systemOauthClient }))

  router.use(
    '/prisoner-search',
    prisonerSearchRouter({ prisonApi, offenderSearchApi, incentivesApi, logError, systemOauthClient })
  )

  router.use(
    '/prisoner/:offenderNo/case-notes/amend-case-note/:caseNoteId',
    amendCaseNoteRouter({ prisonApi, caseNotesApi, logError, systemOauthClient })
  )

  router.use(
    '/prisoner/:offenderNo/case-notes/delete-case-note/:caseNoteId/:caseNoteAmendmentId?',
    deleteCaseNoteRouter({ prisonApi, caseNotesApi, oauthApi, logError, systemOauthClient })
  )

  router.get(
    ['/content', '/content/:path'],
    contentController({
      contentfulService: contentfulServiceFactory({ contentfulClient, notificationCookie }, contentfulCache),
    })
  )

  router.use('/global-search', globalSearchRouter({ offenderSearchApi, oauthApi, logError }))

  router.get('/back-to-start', backToStart())

  if (whereaboutsMaintenanceMode) {
    router.use('/appointment-details*', isAppointmentsRolledOut, maintenancePage('Appointment details'))
  } else {
    router.get(
      '/appointment-details/:id/confirm-deletion',
      isAppointmentsRolledOut,
      appointmentConfirmDeletion({
        whereaboutsApi,
        appointmentDetailsService: appointmentDetailsServiceFactory({
          prisonApi,
          videoLinkBookingService,
          locationsInsidePrisonApi,
          nomisMapping,
          getClientCredentialsTokens,
        }),
        videoLinkBookingService,
        getClientCredentialsTokens,
      }).index
    )
    router.post(
      '/appointment-details/:id/confirm-deletion',
      isAppointmentsRolledOut,
      appointmentConfirmDeletion({
        whereaboutsApi,
        appointmentDetailsService: appointmentDetailsServiceFactory({
          prisonApi,
          videoLinkBookingService,
          locationsInsidePrisonApi,
          nomisMapping,
          getClientCredentialsTokens,
        }),
        videoLinkBookingService,
        getClientCredentialsTokens,
      }).post
    )
    router.get(
      '/appointment-details/:id/delete-recurring-bookings',
      isAppointmentsRolledOut,
      appointmentDeleteRecurringBookings({
        whereaboutsApi,
      }).index
    )
    router.post(
      '/appointment-details/:id/delete-recurring-bookings',
      isAppointmentsRolledOut,
      appointmentDeleteRecurringBookings({
        whereaboutsApi,
      }).post
    )
    router.get('/appointment-details/deleted', isAppointmentsRolledOut, appointmentDeleted().index)
    router.use(
      '/appointment-details/:id',
      isAppointmentsRolledOut,
      appointmentDetails({
        oauthApi,
        prisonApi,
        whereaboutsApi,
        appointmentDetailsService: appointmentDetailsServiceFactory({
          prisonApi,
          videoLinkBookingService,
          locationsInsidePrisonApi,
          nomisMapping,
          getClientCredentialsTokens,
        }),
      })
    )
  }

  router.get('/save-backlink', prisonerProfileBackLinkRedirect)

  return router
}

export default (dependencies) => setup(dependencies)
