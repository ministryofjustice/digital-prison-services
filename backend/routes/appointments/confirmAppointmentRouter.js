const express = require('express')
const confirmAppointment = require('../../controllers/appointments/confirmAppointment')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const { index } = confirmAppointment.confirmAppointmentFactory({ elite2Api, appointmentsService, logError })

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
