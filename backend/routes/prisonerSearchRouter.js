const express = require('express')
const { prisonerSearchFactory } = require('../controllers/search/prisonerSearch')

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi, elite2Api, logError }) => {
  const { index } = prisonerSearchFactory(oauthApi, elite2Api, logError)

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
