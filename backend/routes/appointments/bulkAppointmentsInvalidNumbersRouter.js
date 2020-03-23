const express = require('express')
const {
  bulkAppointmentsInvalidNumbersFactory,
} = require('../../controllers/appointments/bulkAppointmentsInvalidNumbers')

const router = express.Router()

const controller = () => {
  const { index } = bulkAppointmentsInvalidNumbersFactory()

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
