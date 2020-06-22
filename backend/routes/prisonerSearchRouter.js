const express = require('express')
const qs = require('querystring')
const prisonerSearchController = require('../controllers/search/prisonerSearch')
const paginationService = require('../services/paginationService')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  router.get('/', prisonerSearchController({ paginationService, elite2Api, logError }))
  router.post('/', (req, res) =>
    res.redirect(`${req.baseUrl}?${qs.stringify({ ...req.query, sortFieldsWithOrder: req.body.sortFieldsWithOrder })}`)
  )
  return router
}

module.exports = dependencies => controller(dependencies)
