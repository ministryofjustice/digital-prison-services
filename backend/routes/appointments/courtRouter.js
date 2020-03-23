const express = require('express')
const { addCourtAppointmentsFactory } = require('../../controllers/appointments/addCourtAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlots = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const availableSlotsService = availableSlots({ existingEventsService, appointmentsService })

  const { index, validateInput, goToCourtSelection } = addCourtAppointmentsFactory(elite2Api, logError)

  router.get('/', index)
  router.post(
    '/',
    validateInput,
    checkAppointmentRooms(existingEventsService, availableSlotsService, logError),
    goToCourtSelection
  )

  return router
}

module.exports = dependencies => controller(dependencies)
