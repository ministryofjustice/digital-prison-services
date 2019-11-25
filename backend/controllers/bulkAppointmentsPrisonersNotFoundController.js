const express = require('express')
const { bulkAppointmentsPrisonersNotFoundFactory } = require('./bulkAppointmentsPrisonersNotFound')

const router = express.Router()

const controller = () => {
  const { index } = bulkAppointmentsPrisonersNotFoundFactory()

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
