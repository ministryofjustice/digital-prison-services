const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, logError }) => {
  router.get('/', establishmentRollDashboardController({ prisonApi, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
