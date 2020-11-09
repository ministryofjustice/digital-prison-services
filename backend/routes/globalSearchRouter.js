const express = require('express')
const { globalSearchFactory } = require('../controllers/globalSearch')
const paginationService = require('../services/paginationService')

const router = express.Router()

const controller = ({ offenderSearchApi, oauthApi, logError }) => {
  const { indexPage, resultsPage } = globalSearchFactory({ paginationService, offenderSearchApi, oauthApi, logError })

  router.get('/', indexPage)
  router.get('/results', resultsPage)

  return router
}

module.exports = dependencies => controller(dependencies)
