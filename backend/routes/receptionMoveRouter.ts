import express from 'express'
import considerRisksController from '../controllers/receptionMove/considerRisksReception'
import { movementsServiceFactory } from '../services/movementsService'

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, prisonApi, systemOauthClient, incentivesApi, nonAssociationsApi }) => {
  const movementsService = movementsServiceFactory(prisonApi, systemOauthClient, incentivesApi)
  const { view, submit } = considerRisksController({ oauthApi, prisonApi, movementsService, nonAssociationsApi })
  router.get('/consider-risks-reception', view)
  router.post('/consider-risks-reception', submit)

  return router
}

export default (dependencies) => controller(dependencies)
