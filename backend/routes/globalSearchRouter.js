const express = require('express')
const globalSearchController = require('../controllers/globalSearch')
const paginationService = require('../services/paginationService')
const telemetry = require('../azure-appinsights')

const router = express.Router()

const controller = ({ offenderSearchApi, oauthApi, logError }) => {
  const { indexPage, resultsPage } = globalSearchController({
    paginationService,
    offenderSearchApi,
    oauthApi,
    telemetry,
    logError,
  })

  router.get('/', indexPage)
  router.get('/results', resultsPage)

  return router
}

module.exports = dependencies => controller(dependencies)
