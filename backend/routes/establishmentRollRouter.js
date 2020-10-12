const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  router.get('/', establishmentRollDashboardController({ elite2Api, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
