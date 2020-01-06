const express = require('express')
const prepostAppointments = require('./prepostAppoinments')
const { appointmentsServiceFactory } = require('../controllers/appointmentsService')
const existingEventsServiceFactory = require('../controllers/existingEventsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const appointmentsService = appointmentsServiceFactory(elite2Api)
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const { index, post } = prepostAppointments.prepostAppointmentsFactory({
    elite2Api,
    logError,
    appointmentsService,
    existingEventsService,
  })

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
