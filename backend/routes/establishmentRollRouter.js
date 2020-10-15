const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')
const inReceptionController = require('../controllers/establishmentRoll/inReceptionController')
const enRouteController = require('../controllers/establishmentRoll/enRoute')
const currentlyOutController = require('../controllers/establishmentRoll/currentlyOut')

const { movementsServiceFactory } = require('../services/movementsService')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, systemOauthClient, logError }) => {
  const movementsService = movementsServiceFactory(elite2Api, systemOauthClient)

  router.get('/', establishmentRollDashboardController({ elite2Api, logError }))
  router.get('/in-reception', inReceptionController({ movementsService, logError }))
  router.get('/en-route', enRouteController({ elite2Api, movementsService, logError }))
  router.get('/:livingUnitId/currently-out', currentlyOutController({ movementsService, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
