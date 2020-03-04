const express = require('express')
const { selectCourtAppointmentRoomsFactory } = require('./selectCourtAppointmentRooms')
const { appointmentsServiceFactory } = require('./appointmentsService')
const existingEventsServiceFactory = require('../attendance/existingEventsService')
const availableSlotsService = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError, oauthApi, notifyClient }) => {
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const availableSlots = availableSlotsService({ existingEventsService, appointmentsService })
  const { index, validateInput, createAppointments } = selectCourtAppointmentRoomsFactory({
    elite2Api,
    whereaboutsApi,
    oauthApi,
    notifyClient,
    logError,
    appointmentsService,
    existingEventsService,
  })

  router.get('/', index)
  router.post(
    '/',
    validateInput,
    checkAppointmentRooms(existingEventsService, availableSlots, logError),
    createAppointments
  )

  return router
}

module.exports = dependencies => controller(dependencies)
