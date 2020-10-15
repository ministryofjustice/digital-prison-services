const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')
const enRouteController = require('../controllers/establishmentRoll/enRoute')

const { movementsServiceFactory } = require('../services/movementsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, systemOauthClient, logError }) => {
  const movementsService = movementsServiceFactory(elite2Api, systemOauthClient)

  router.get('/', establishmentRollDashboardController({ elite2Api, logError }))
  router.get('/en-route', enRouteController({ elite2Api, movementsService, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
