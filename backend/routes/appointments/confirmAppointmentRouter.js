const express = require('express')
const confirmAppointment = require('../../controllers/appointments/confirmAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, logError }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const { index } = confirmAppointment.confirmAppointmentFactory({ prisonApi, appointmentsService, logError })

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
