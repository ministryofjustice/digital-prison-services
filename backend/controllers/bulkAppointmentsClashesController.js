const express = require('express')
const { bulkAppointmentsClashesFactory } = require('./bulkAppointmentsClashes')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index } = bulkAppointmentsClashesFactory(elite2Api, logError)

  router.get('/', index)
  // router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
