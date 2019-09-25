const express = require('express')
const { addAppointmentDetailsFactory } = require('./addAppointmentDetails')
const bulkAppointmentServiceFactory = require('./bulk-appointments-service')

const router = express.Router()

const controller = ({ elite2Api, oauthApi, logError }) => {
  const { index, post } = addAppointmentDetailsFactory(bulkAppointmentServiceFactory(elite2Api), oauthApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
