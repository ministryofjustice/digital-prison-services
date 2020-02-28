const express = require('express')
const { selectCourtAppointmentRoomsFactory } = require('./selectCourtAppointmentRooms')
const { appointmentsServiceFactory } = require('./appointmentsService')
const existingEventsServiceFactory = require('../attendance/existingEventsService')
const availableSlotsService = require('../../services/availableSlotsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError, oauthApi, notifyClient }) => {
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const { index, post, cancel } = selectCourtAppointmentRoomsFactory({
    elite2Api,
    whereaboutsApi,
    oauthApi,
    notifyClient,
    logError,
    appointmentsService,
    existingEventsService,
    availableSlotsService: availableSlotsService({ existingEventsService, appointmentsService }),
  })

  router.get('/', index)
  router.post('/', post)
  router.get('/cancel', cancel)

  return router
}

module.exports = dependencies => controller(dependencies)
