const express = require('express')
const { selectCourtAppointmentRoomsFactory } = require('../../controllers/appointments/selectCourtAppointmentRooms')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlotsService = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, whereaboutsApi, logError, oauthApi, notifyClient }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const existingEventsService = existingEventsServiceFactory(prisonApi)
  const availableSlots = availableSlotsService({ existingEventsService, appointmentsService })
  const { index, validateInput, createAppointments } = selectCourtAppointmentRoomsFactory({
    prisonApi,
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
