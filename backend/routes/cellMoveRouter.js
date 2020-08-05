const express = require('express')
const selectLocationController = require('../controllers/cellMove/selectLocation')
const nonAssociationsController = require('../controllers/cellMove/viewNonAssociations')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, logError }) => {
  router.get('/select-location', selectLocationController({ elite2Api, logError }))
  router.get('/non-assocations', nonAssociationsController({ elite2Api, logError }))

  return router
}

module.exports = dependencies => controller(dependencies)
