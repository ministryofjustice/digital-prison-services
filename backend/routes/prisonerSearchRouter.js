const express = require('express')
const qs = require('querystring')
const prisonerSearchController = require('../controllers/search/prisonerSearch')
const paginationService = require('../services/paginationService')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  router.get('/', prisonerSearchController({ paginationService, elite2Api, logError }))
  router.post('/', (req, res) => {
    const { alerts, ...queries } = req.query

    return res.redirect(
      `${req.baseUrl}?${qs.stringify({
        ...queries,
        'alerts[]': alerts,
        sortFieldsWithOrder: req.body.sortFieldsWithOrder,
      })}`
    )
  })
  return router
}

module.exports = dependencies => controller(dependencies)
