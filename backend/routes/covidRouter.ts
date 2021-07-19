// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const { covidServiceFactory } = require('../services/covidService')
const covidDashboardController = require('../controllers/covid/covidDashboardController')
const reverseCohortingUnitController = require('../controllers/covid/reverseCohortingUnitController')
const protectiveIsolationUnitController = require('../controllers/covid/protectiveIsolationUnitController')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'shieldingU... Remove this comment to see the full error message
const shieldingUnitController = require('../controllers/covid/shieldingUnitController')
const refusingToShieldController = require('../controllers/covid/refusingToShieldController')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'notInUnitC... Remove this comment to see the full error message
const notInUnitController = require('../controllers/covid/notInUnitController')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

module.exports = (prisonApi, logError) => {
  const covidService = covidServiceFactory(prisonApi)

  router.get('/', covidDashboardController({ covidService, logError }))
  router.get('/reverse-cohorting-unit', reverseCohortingUnitController({ covidService, logError }))
  router.get('/protective-isolation-unit', protectiveIsolationUnitController({ covidService, logError }))
  router.get('/shielding-unit', shieldingUnitController({ covidService, logError }))
  router.get('/refusing-to-shield', refusingToShieldController({ covidService, logError }))
  router.get('/not-in-unit', notInUnitController({ covidService, logError }))
  return router
}
