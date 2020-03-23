const express = require('express')
const { bulkAppointmentsConfirmFactory } = require('../../controllers/appointments/bulkAppointmentsConfirm')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index, post } = bulkAppointmentsConfirmFactory(elite2Api, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
