const express = require('express')
const { addAppointmentFactory } = require('./addAppointment')
const appointmentsServiceFactory = require('./appointmentsService')
const existingEventsServiceFactory = require('./existingEventsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const { index, post } = addAppointmentFactory(
    appointmentsServiceFactory(elite2Api),
    existingEventsServiceFactory(elite2Api),
    elite2Api,
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
