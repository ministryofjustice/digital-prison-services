const express = require('express')
const { bulkAppointmentsAddDetailsFactory } = require('../../controllers/appointments/bulkAppointmentsAddDetails')
const { appointmentsServiceFactory } = require('../../services/appointmentsService')

const router = express.Router()

const controller = ({ prisonApi, oauthApi, logError }) => {
  const { index, post } = bulkAppointmentsAddDetailsFactory(appointmentsServiceFactory(prisonApi), oauthApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
