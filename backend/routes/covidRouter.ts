import express from 'express'
import { covidServiceFactory } from '../services/covidService'
import covidDashboardController from '../controllers/covid/covidDashboardController'
import reverseCohortingUnitController from '../controllers/covid/reverseCohortingUnitController'
import protectiveIsolationUnitController from '../controllers/covid/protectiveIsolationUnitController'
import shieldingUnitController from '../controllers/covid/shieldingUnitController'
import refusingToShieldController from '../controllers/covid/refusingToShieldController'
import notInUnitController from '../controllers/covid/notInUnitController'

const router = express.Router({ mergeParams: true })

export default (systemOauthClient, prisonApi) => {
  const covidService = covidServiceFactory(systemOauthClient, prisonApi)

  router.get('/', covidDashboardController({ covidService }))
  router.get('/reverse-cohorting-unit', reverseCohortingUnitController({ covidService }))
  router.get('/protective-isolation-unit', protectiveIsolationUnitController({ covidService }))
  router.get('/shielding-unit', shieldingUnitController({ covidService }))
  router.get('/refusing-to-shield', refusingToShieldController({ covidService }))
  router.get('/not-in-unit', notInUnitController({ covidService }))
  return router
}
