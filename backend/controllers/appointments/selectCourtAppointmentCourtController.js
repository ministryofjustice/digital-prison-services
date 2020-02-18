const express = require('express')
const { selectCourtAppointmentCourtFactory } = require('./selectCourtAppointmentCourt')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  const { index, post } = selectCourtAppointmentCourtFactory(elite2Api, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
