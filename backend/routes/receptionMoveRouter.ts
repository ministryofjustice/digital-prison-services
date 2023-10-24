import express from 'express'
import considerRisksController from '../controllers/receptionMove/considerRisksReception'
import receptionFullController from '../controllers/receptionMove/receptionFull'

import { movementsServiceFactory } from '../services/movementsService'

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, prisonApi, systemOauthClient, incentivesApi, nonAssociationsApi, logError }) => {
  const movementsService = movementsServiceFactory(prisonApi, systemOauthClient, incentivesApi)

  const { view: considerRiskView, submit: considerRiskSubmit } = considerRisksController({
    oauthApi,
    prisonApi,
    movementsService,
    nonAssociationsApi,
    logError,
  })
  router.get('/consider-risks-reception', considerRiskView)
  router.post('/consider-risks-reception', considerRiskSubmit)

  const { view: receptionFullView } = receptionFullController(prisonApi)
  router.get('/reception-full', receptionFullView)

  return router
}

export default (dependencies) => controller(dependencies)
