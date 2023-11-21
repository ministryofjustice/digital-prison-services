import express from 'express'
import establishmentRollDashboardController from '../controllers/establishmentRoll/dashboard'
import inReceptionController from '../controllers/establishmentRoll/inReceptionController'
import enRouteController from '../controllers/establishmentRoll/enRoute'
import currentlyOutController from '../controllers/establishmentRoll/currentlyOut'
import totalCurrentlyOutController from '../controllers/establishmentRoll/totalCurrentlyOut'
import inTodayController from '../controllers/establishmentRoll/inToday'
import outTodayController from '../controllers/establishmentRoll/outToday'
import noCellAllocatedController from '../controllers/establishmentRoll/noCellAllocated'
import { movementsServiceFactory } from '../services/movementsService'

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, prisonApi, systemOauthClient, logError, incentivesApi }) => {
  const movementsService = movementsServiceFactory(prisonApi, systemOauthClient, incentivesApi)

  router.get('/', establishmentRollDashboardController({ systemOauthClient, prisonApi }))
  router.get('/in-reception', inReceptionController({ movementsService, logError }))
  router.get('/en-route', enRouteController({ movementsService }))
  router.get('/:livingUnitId/currently-out', currentlyOutController({ movementsService, logError }))
  router.get('/total-currently-out', totalCurrentlyOutController({ movementsService, logError }))
  router.get('/in-today', inTodayController({ movementsService, logError }))
  router.get('/out-today', outTodayController({ movementsService, logError }))
  router.get('/no-cell-allocated', noCellAllocatedController({ oauthApi, systemOauthClient, prisonApi }))
  return router
}

export default (dependencies) => controller(dependencies)
