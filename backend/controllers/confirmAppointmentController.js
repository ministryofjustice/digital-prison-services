const express = require('express')
const confirmAppointment = require('./confirmAppointment')

const router = express.Router({ mergeParams: true })

const controller = ({ logError }) => {
  const { index } = confirmAppointment.confirmAppointmentFactory(logError)
  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
