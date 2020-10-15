const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')
const inReceptionController = require('../controllers/establishmentRoll/inReceptionController')
const enRouteController = require('../controllers/establishmentRoll/enRoute')
const currentlyOutController = require('../controllers/establishmentRoll/currentlyOut')

const { movementsServiceFactory } = require('../services/movementsService')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, systemOauthClient, logError }) => {
  const movementsService = movementsServiceFactory(prisonApi, systemOauthClient)

  router.get('/', establishmentRollDashboardController({ prisonApi, logError }))
  router.get('/in-reception', inReceptionController({ movementsService, logError }))
  router.get('/en-route', enRouteController({ prisonApi, movementsService, logError }))
  router.get('/:livingUnitId/currently-out', currentlyOutController({ movementsService, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
