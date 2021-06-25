const express = require('express')
const { bulkAppointmentsConfirmFactory } = require('../../controllers/appointments/bulkAppointmentsConfirm')

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsConfirmFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
