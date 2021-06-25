const express = require('express')
const { bulkAppointmentsClashesFactory } = require('../../controllers/appointments/bulkAppointmentsClashes')

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsClashesFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
