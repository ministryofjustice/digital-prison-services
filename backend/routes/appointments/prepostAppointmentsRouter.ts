// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const prepostAppointments = require('../../controllers/appointments/prepostAppoinments')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'existingEv... Remove this comment to see the full error message
const existingEventsServiceFactory = require('../../services/existingEventsService')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, logError, oauthApi, whereaboutsApi, notifyClient, raiseAnalyticsEvent }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const existingEventsService = existingEventsServiceFactory(prisonApi)
  const { index, post, cancel } = prepostAppointments.prepostAppointmentsFactory({
    prisonApi,
    oauthApi,
    whereaboutsApi,
    notifyClient,
    logError,
    appointmentsService,
    existingEventsService,
    raiseAnalyticsEvent,
  })

  router.get('/', index)
  router.post('/', post)
  router.get('/cancel', cancel)

  return router
}

module.exports = (dependencies) => controller(dependencies)
