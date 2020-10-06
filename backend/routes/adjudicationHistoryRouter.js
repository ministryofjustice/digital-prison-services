const express = require('express')

const adjudicationsController = require('../controllers/prisonerProfile/adjudicationHistory')
const adjudicationsHistoryService = require('../services/adjudicationHistory')
const paginationService = require('../services/paginationService')

const router = express.Router({ mergeParams: true })

module.exports = (elite2Api, logError) => {
  const adjudicationHistoryService = adjudicationsHistoryService(elite2Api)
  const controller = adjudicationsController({
    adjudicationHistoryService,
    paginationService,
    elite2Api,
    logError,
  })

  router.get('/', controller.index)

  return router
}
