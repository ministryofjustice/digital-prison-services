const express = require('express')
const { globalSearchFactory } = require('../controllers/globalSearch')
const paginationService = require('../services/paginationService')

const router = express.Router()

const controller = ({ offenderSearchApi, logError }) => {
  const { indexPage, resultsPage } = globalSearchFactory({ paginationService, offenderSearchApi, logError })

  router.get('/', indexPage)
  // router.post('/', post)
  router.get('/results', resultsPage)

  return router
}

module.exports = dependencies => controller(dependencies)
