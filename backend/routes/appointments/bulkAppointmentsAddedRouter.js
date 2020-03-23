const express = require('express')
const { bulkAppointmentsAddedFactory } = require('../../controllers/appointments/bulkAppointmentsAdded')

const router = express.Router()

const controller = () => {
  const { index } = bulkAppointmentsAddedFactory()

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
