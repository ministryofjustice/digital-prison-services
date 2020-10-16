const express = require('express')
const { addCourtAppointmentsFactory } = require('../../controllers/appointments/addCourtAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')
const availableSlots = require('../../services/availableSlotsService')
const checkAppointmentRooms = require('../../middleware/checkAppointmentRooms')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, logError }) => {
  const existingEventsService = existingEventsServiceFactory(prisonApi)
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const availableSlotsService = availableSlots({ existingEventsService, appointmentsService })

  const { index, validateInput, goToCourtSelection } = addCourtAppointmentsFactory(prisonApi, logError)

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
