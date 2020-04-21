const express = require('express')
const prepostAppointments = require('../../controllers/appointments/prepostAppoinments')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError, oauthApi, whereaboutsApi, notifyClient, raiseAnalyticsEvent }) => {
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const { index, post, cancel } = prepostAppointments.prepostAppointmentsFactory({
    elite2Api,
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

module.exports = dependencies => controller(dependencies)
