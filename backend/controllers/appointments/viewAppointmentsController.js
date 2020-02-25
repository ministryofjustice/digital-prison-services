const express = require('express')
const viewAppointmentsFactory = require('./viewAppointments')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError }) => {
  const { index } = viewAppointmentsFactory(elite2Api, whereaboutsApi, logError)

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
