import express from 'express'
import { covidServiceFactory } from '../services/covidService'
import covidDashboardController from '../controllers/covid/covidDashboardController'
import reverseCohortingUnitController from '../controllers/covid/reverseCohortingUnitController'
import protectiveIsolationUnitController from '../controllers/covid/protectiveIsolationUnitController'
import shieldingUnitController from '../controllers/covid/shieldingUnitController'
import refusingToShieldController from '../controllers/covid/refusingToShieldController'
import notInUnitController from '../controllers/covid/notInUnitController'

const router = express.Router({ mergeParams: true })

export default (prisonApi, logError) => {
  const covidService = covidServiceFactory(prisonApi)

  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/', covidDashboardController({ covidService, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/reverse-cohorting-unit', reverseCohortingUnitController({ covidService, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/protective-isolation-unit', protectiveIsolationUnitController({ covidService, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/shielding-unit', shieldingUnitController({ covidService, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/refusing-to-shield', refusingToShieldController({ covidService, logError }))
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ covidService: { getCount(res: ... Remove this comment to see the full error message
  router.get('/not-in-unit', notInUnitController({ covidService, logError }))
  return router
}
