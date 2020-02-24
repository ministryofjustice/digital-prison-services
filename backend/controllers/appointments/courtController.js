const express = require('express')
const { addCourtAppointmentsFactory } = require('./addCourtAppointment')
const { appointmentsServiceFactory } = require('../appointments/appointmentsService')
const existingEventsServiceFactory = require('../attendance/existingEventsService')
const availableSlotsService = require('../../services/availableSlotsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const existingEventsService = existingEventsServiceFactory(elite2Api)
  const appointmentsService = appointmentsServiceFactory(elite2Api)

  const { index, post } = addCourtAppointmentsFactory(
    existingEventsService,
    elite2Api,
    logError,
    availableSlotsService({ existingEventsService, appointmentsService })
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
