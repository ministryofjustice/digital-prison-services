const express = require('express')
const { requestBookingFactory } = require('./requestBooking')

const router = express.Router({ mergeParams: true })

const controller = ({ logError }) => {
  const { index, post, confirm } = requestBookingFactory(logError)

  router.get('/', index)
  router.post('/', post)
  router.get('/confirmation', confirm)

  return router
}

module.exports = dependencies => controller(dependencies)
