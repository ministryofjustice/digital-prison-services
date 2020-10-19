const express = require('express')

const adjudicationsController = require('../controllers/prisonerProfile/adjudicationHistory')
const adjudicationsHistoryService = require('../services/adjudicationHistory')
const paginationService = require('../services/paginationService')

const router = express.Router({ mergeParams: true })

module.exports = (prisonApi, logError) => {
  const adjudicationHistoryService = adjudicationsHistoryService(prisonApi)
  const controller = adjudicationsController({
    adjudicationHistoryService,
    paginationService,
    prisonApi,
    logError,
  })

  router.get('/', controller.index)

  return router
}
