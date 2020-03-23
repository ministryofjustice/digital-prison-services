const express = require('express')
const { selectCourtAppointmentCourtFactory } = require('../../controllers/appointments/selectCourtAppointmentCourt')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, whereaboutsApi, logError }) => {
  const { index, post } = selectCourtAppointmentCourtFactory(elite2Api, whereaboutsApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
