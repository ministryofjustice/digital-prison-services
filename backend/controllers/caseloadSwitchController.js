const express = require('express')
const { caseloadSwitchFactory } = require('./caseloadSwitch')

const router = express.Router()

const controller = ({ elite2Api, logError }) => {
  const index = caseloadSwitchFactory(elite2Api, logError)

  router.get('/', index)
  return router
}

module.exports = dependencies => controller(dependencies)
