const express = require('express')
const prisonerSearchController = require('../controllers/search/prisonerSearch')
const paginationService = require('../services/paginationService')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const { index, post } = prisonerSearchController({ paginationService, elite2Api, logError })
  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = dependencies => controller(dependencies)
