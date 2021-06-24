const express = require('express')
const { retentionReasonsFactory } = require('../controllers/retentionReasons')

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, dataComplianceApi, logError }) => {
  const { index, post } = retentionReasonsFactory(prisonApi, dataComplianceApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

module.exports = (dependencies) => controller(dependencies)
