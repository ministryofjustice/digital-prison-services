const express = require('express')
const { covidServiceFactory } = require('../services/covidService')
const covidDashboardController = require('../controllers/covid/covidDashboard')
const reverseCohortingUnitController = require('../controllers/covid/reverseCohortingUnit')
const protectiveIsolationUnitController = require('../controllers/covid/protectiveIsolationUnitController')
const shieldingUnitController = require('../controllers/covid/shieldingUnitController')
const refusingToShieldController = require('../controllers/covid/refusingToShieldController')

const router = express.Router({ mergeParams: true })

module.exports = (elite2Api, logError) => {
  const covidService = covidServiceFactory(elite2Api)

  router.get('/', covidDashboardController({ covidService, logError }))
  router.get('/reverse-cohorting-unit', reverseCohortingUnitController({ covidService, logError }))
  router.get('/protective-isolation-unit', protectiveIsolationUnitController({ covidService, logError }))
  router.get('/shielding-unit', shieldingUnitController({ covidService, logError }))
  router.get('/refusing-to-shield', refusingToShieldController({ covidService, logError }))
  return router
}
