const express = require('express')
const { retentionReasonsFactory } = require('../controllers/retentionReasons')

const router = express.Router({ mergeParams: true })

const controller = ({ elite2Api, dataComplianceApi, logError }) => {
  const { index } = retentionReasonsFactory(elite2Api, dataComplianceApi, logError)

  router.get('/', index)

  return router
}

module.exports = dependencies => controller(dependencies)
