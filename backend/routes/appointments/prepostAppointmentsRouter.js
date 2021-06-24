const express = require('express')
const prepostAppointments = require('../../controllers/appointments/prepostAppoinments')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')

const router = express.Router({ mergeParams: true })

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
