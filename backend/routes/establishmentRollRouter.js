const express = require('express')

const establishmentRollDashboardController = require('../controllers/establishmentRoll/dashboard')
const inReceptionController = require('../controllers/establishmentRoll/inReceptionController')
const enRouteController = require('../controllers/establishmentRoll/enRoute')
const currentlyOutController = require('../controllers/establishmentRoll/currentlyOut')
const totalCurrentlyOutController = require('../controllers/establishmentRoll/totalCurrentlyOut')
const inTodayController = require('../controllers/establishmentRoll/inToday')
const outTodayController = require('../controllers/establishmentRoll/outToday')
const noCellAllocatedController = require('../controllers/establishmentRoll/noCellAllocated')

const { movementsServiceFactory } = require('../services/movementsService')

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, prisonApi, systemOauthClient, logError }) => {
  const movementsService = movementsServiceFactory(prisonApi, systemOauthClient)

  router.get('/', establishmentRollDashboardController({ prisonApi, logError }))
  router.get('/in-reception', inReceptionController({ movementsService, logError }))
  router.get('/en-route', enRouteController({ prisonApi, movementsService, logError }))
  router.get('/:livingUnitId/currently-out', currentlyOutController({ movementsService, logError }))
  router.get('/total-currently-out', totalCurrentlyOutController({ movementsService, logError }))
  router.get('/in-today', inTodayController({ movementsService, logError }))
  router.get('/out-today', outTodayController({ movementsService, logError }))
  router.get('/no-cell-allocated', noCellAllocatedController({ oauthApi, prisonApi, logError }))
  return router
}

module.exports = dependencies => controller(dependencies)
