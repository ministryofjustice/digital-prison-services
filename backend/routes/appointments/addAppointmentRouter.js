const express = require('express')
const { addAppointmentFactory } = require('../../controllers/appointments/addAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
const existingEventsServiceFactory = require('../../services/existingEventsService')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, whereaboutsApi, logError }) => {
  const { index, post } = addAppointmentFactory(
    appointmentsServiceFactory(prisonApi),
    existingEventsServiceFactory(prisonApi),
    prisonApi,
    whereaboutsApi,
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
